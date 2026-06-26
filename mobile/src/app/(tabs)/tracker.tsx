import { useState, useEffect, useCallback, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert, Modal } from 'react-native';
import { Text } from "@/components/CustomText";
import * as SecureStore from 'expo-secure-store';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

const MOODS = [
  { emoji: '😁', label: 'Happy' },
  { emoji: '🤩', label: 'Excited' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '🥱', label: 'Tired' },
  { emoji: '😫', label: 'Stressed' },
  { emoji: '🙏', label: 'Grateful' }
];
const ICONS = ['⭐','🔥','💧','🏃','📚','🧘','💪','🍎','💻','🎨','🎵','🧹','💸','💊','🌿','✨','📝','🦷','🍳','🚴'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const API_URL = 'https://habitsyncc.vercel.app';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function formatMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
function getMonthName(date: Date) {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export default function Tracker() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<any[]>([]);
  const [logs, setLogs] = useState<Record<string, any>>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newHabit, setNewHabit] = useState('');
  const [addingHabit, setAddingHabit] = useState(false);
  const [editModal, setEditModal] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [moodModal, setMoodModal] = useState<number | null>(null);

  const monthKey = formatMonth(currentDate);
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

  async function getToken() {
    const token = await SecureStore.getItemAsync('jwt');
    if (!token) { router.replace('/login'); return null; }
    return token;
  }

  const loadTracker = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const headers = { 'Authorization': `Bearer ${token}` };

      const [habitsRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/api/habits`, { headers }),
        fetch(`${API_URL}/api/habits/log?month=${monthKey}`, { headers }),
      ]);

      if (habitsRes.ok && logsRes.ok) {
        const habitsData = await habitsRes.json();
        const logsData = await logsRes.json();
        setHabits(habitsData.habits || []);
        const map: Record<string, any> = {};
        (logsData.logs || []).forEach((l: any) => { map[l.date] = { ticks: l.ticks || {}, mood: l.mood }; });
        setLogs(map);
      } else if (habitsRes.status === 401 || logsRes.status === 401) {
        router.replace('/login');
      }
    } catch (err) {
      console.error('Failed to load tracker', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [monthKey]);

  useFocusEffect(
    useCallback(() => {
      loadTracker(true);
      // 30 second polling
      const interval = setInterval(() => {
        loadTracker(false);
      }, 30000);
      return () => clearInterval(interval);
    }, [loadTracker])
  );

  async function toggleTick(habitId: string, day: number) {
    const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`;
    const current = logs[dateKey]?.ticks?.[habitId] || false;
    const newVal = !current;

    // Optimistic UI update
    setLogs(prev => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], ticks: { ...(prev[dateKey]?.ticks || {}), [habitId]: newVal } }
    }));

    // Background sync
    try {
      const token = await getToken();
      if (!token) return;
      await fetch(`${API_URL}/api/habits/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: dateKey, habitId, value: newVal }),
      });
      
      // Fetch latest data from DB ASAP to ensure full synchronization
      loadTracker(false);
    } catch (err) {
      console.error('Failed to save', err);
      // Revert if failed
      setLogs(prev => ({
        ...prev,
        [dateKey]: { ...prev[dateKey], ticks: { ...(prev[dateKey]?.ticks || {}), [habitId]: current } }
      }));
    }
  }

  async function setMoodForDay(day: number, mood: string) {
    const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`;
    setLogs(prev => ({ ...prev, [dateKey]: { ...prev[dateKey], mood } }));
    try {
      const token = await getToken();
      if (!token) return;
      await fetch(`${API_URL}/api/habits/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: dateKey, mood }),
      });
    } catch (err) { console.error('Failed to save mood', err); }
  }

  async function addHabit() {
    if (!newHabit.trim()) return;
    setAddingHabit(true);
    try {
      const token = await getToken();
      if (!token) return;
      const r = await fetch(`${API_URL}/api/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newHabit.trim() }),
      });
      const d = await r.json();
      if (d.habit) { setHabits(prev => [...prev, d.habit]); setNewHabit(''); }
    } catch (err) { console.error(err); }
    finally { setAddingHabit(false); }
  }

  async function saveHabit() {
    if (!editModal) return;
    try {
      const token = await getToken();
      if (!token) return;
      const r = await fetch(`${API_URL}/api/habits`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: editModal._id, name: editName, icon: editIcon }),
      });
      const d = await r.json();
      if (d.habit) { setHabits(prev => prev.map(h => h._id === editModal._id ? d.habit : h)); }
      setEditModal(null);
    } catch (err) { console.error(err); }
  }

  async function deleteHabit() {
    if (!editModal) return;
    Alert.alert('Delete Habit', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const token = await getToken();
          if (!token) return;
          await fetch(`${API_URL}/api/habits?id=${editModal._id}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
          });
          setHabits(prev => prev.filter(h => h._id !== editModal._id));
          setEditModal(null);
        } catch (err) { console.error(err); }
      }},
    ]);
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.primary }]}>Loading tracker...</Text>
      </View>
    );
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="checkbox-outline" size={28} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Habit Tracker</Text>
        </View>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Tap a circle to log your progress</Text>
        <View style={styles.monthNav}>
          <TouchableOpacity style={[styles.monthBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
            <Ionicons name="chevron-back" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.monthBtnText, { color: colors.textSecondary }]}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.monthBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setCurrentDate(new Date())}>
            <Text style={[styles.monthBtnText, { fontWeight: '700', color: colors.textSecondary }]}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.monthBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
            <Text style={[styles.monthBtnText, { color: colors.textSecondary }]}>Next</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.monthLabel, { color: colors.primary }]}>{getMonthName(currentDate)}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} removeClippedSubviews={true}>
        <View style={{ flexDirection: 'row' }}>
          
          {/* STICKY HABITS COLUMN */}
          <View style={{ width: 140, zIndex: 10, backgroundColor: colors.background }}>
            <View style={[styles.habitColHeader, { backgroundColor: colors.card, borderRightColor: colors.border, borderBottomColor: colors.border }]}>
              <Text style={[styles.colHeaderText, { color: colors.textSecondary }]}>Habits</Text>
            </View>
            {habits.map((habit, hi) => (
              <TouchableOpacity
                key={habit._id}
                style={[styles.habitCol, { backgroundColor: hi % 2 === 0 ? colors.background : colors.card, borderRightColor: colors.border, borderBottomColor: colors.border }]}
                onPress={() => { setEditModal(habit); setEditName(habit.name); setEditIcon(habit.icon || '✨'); }}
              >
                <Text style={styles.habitIcon}>{habit.icon}</Text>
                <Text style={[styles.habitName, { color: colors.text }]} numberOfLines={1}>{habit.name}</Text>
                <Ionicons name="pencil" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))}
            <View style={[styles.habitCol, { backgroundColor: colors.card, borderRightColor: colors.border, borderBottomColor: colors.border }]}>
              <TextInput
                style={[styles.addInput, { color: colors.text }]}
                placeholder="+ Add habit"
                placeholderTextColor={colors.textSecondary}
                value={newHabit}
                onChangeText={setNewHabit}
                onSubmitEditing={addHabit}
                returnKeyType="done"
              />
            </View>
            <View style={[styles.habitCol, { backgroundColor: colors.primaryLight, borderRightColor: colors.border, borderBottomColor: colors.border }]}>
              <Ionicons name="sparkles-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.habitName, { color: colors.primary }]} numberOfLines={1}>Daily Mood</Text>
            </View>
          </View>

          {/* SCROLLABLE DATES MATRIX */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} removeClippedSubviews={true}>
            <View>
              <View style={{ flexDirection: 'row' }}>
                {days.map(d => {
                  const dateKey = `${monthKey}-${String(d).padStart(2, '0')}`;
                  const isToday = dateKey === todayStr;
                  const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                  const dowName = DOW[dateObj.getDay()];
                  return (
                    <View key={d} style={[styles.dayCell, { backgroundColor: isToday ? colors.primaryLight : colors.card, borderBottomColor: colors.border, borderRightColor: colors.border }]}>
                      <Text style={[styles.dowText, isToday && { color: colors.primary }]}>{dowName}</Text>
                      <Text style={[styles.dayText, { color: isToday ? colors.primary : colors.text }]}>{d}</Text>
                    </View>
                  );
                })}
              </View>

              {habits.map((habit, hi) => (
                <View key={habit._id} style={{ flexDirection: 'row' }}>
                  {days.map(d => {
                    const dateKey = `${monthKey}-${String(d).padStart(2, '0')}`;
                    const isChecked = logs[dateKey]?.ticks?.[habit._id];
                    return (
                      <TouchableOpacity key={d} style={[styles.cell, { backgroundColor: isChecked ? colors.primaryLight : (hi % 2 === 0 ? colors.background : colors.card), borderRightColor: colors.border, borderBottomColor: colors.border }]} onPress={() => toggleTick(habit._id, d)}>
                        <View style={[styles.checkbox, { borderColor: isChecked ? colors.primary : colors.border, backgroundColor: isChecked ? colors.primary : 'transparent' }]}>
                          {isChecked && <Ionicons name="checkmark" size={18} color="#fff" />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              <View style={{ flexDirection: 'row' }}>
                {days.map(d => <View key={d} style={[styles.cell, { backgroundColor: colors.card, borderRightColor: colors.border, borderBottomColor: colors.border }]} />)}
              </View>

              <View style={{ flexDirection: 'row' }}>
                {days.map(d => {
                  const dateKey = `${monthKey}-${String(d).padStart(2, '0')}`;
                  const mood = logs[dateKey]?.mood;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[styles.cell, { backgroundColor: colors.primaryLight, borderRightColor: colors.border, borderBottomColor: colors.border }]}
                      onPress={() => setMoodModal(d)}
                    >
                      <Text style={[styles.moodText, { color: colors.primary }]}>{mood ? mood.substring(0,2) : '·'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <Modal visible={!!moodModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>How are you feeling?</Text>
              <TouchableOpacity onPress={() => setMoodModal(null)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 24, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              {MOODS.map(m => (
                <TouchableOpacity 
                  key={m.label} 
                  style={{ alignItems: 'center', padding: 8, width: 80 }}
                  onPress={() => { setMoodForDay(moodModal as number, m.emoji); setMoodModal(null); }}
                >
                  <Text style={{ fontSize: 32, marginBottom: 4 }}>{m.emoji}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>{m.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={{ alignItems: 'center', padding: 8, width: 80 }}
                onPress={() => { setMoodForDay(moodModal as number, ''); setMoodModal(null); }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', marginBottom: 4, borderWidth: 1, borderColor: colors.border }}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.danger }}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!editModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Habit</Text>
              <TouchableOpacity onPress={() => setEditModal(null)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Habit Name</Text>
              <TextInput style={[styles.modalInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} value={editName} onChangeText={setEditName} />
              <Text style={[styles.modalLabel, { color: colors.textSecondary, marginTop: 16 }]}>Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {ICONS.map(ic => (
                  <TouchableOpacity key={ic} onPress={() => setEditIcon(ic)} style={[styles.iconOption, { backgroundColor: colors.card, borderColor: editIcon === ic ? colors.primary : colors.border }]}>
                    <Text style={{ fontSize: 22 }}>{ic}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={[styles.modalFooter, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
              <TouchableOpacity onPress={deleteHabit} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color={colors.danger} style={{ marginRight: 4 }} />
                <Text style={[styles.deleteBtnText, { color: colors.danger }]}>Delete</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => setEditModal(null)} style={[styles.cancelBtn, { backgroundColor: colors.border }]}>
                  <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveHabit} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontWeight: '600' },
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 56, borderBottomWidth: 1 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 4 },
  monthNav: { flexDirection: 'row', gap: 8, marginTop: 14 },
  monthBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  monthBtnText: { fontSize: 13, fontWeight: '600' },
  monthLabel: { fontSize: 18, fontWeight: '700', marginTop: 10 },
  
  habitColHeader: { height: 56, padding: 12, justifyContent: 'center', borderRightWidth: 1, borderBottomWidth: 1 },
  colHeaderText: { fontWeight: '700', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 },
  habitCol: { height: 52, padding: 12, flexDirection: 'row', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1 },
  habitIcon: { fontSize: 16, marginRight: 6 },
  habitName: { fontSize: 13, fontWeight: '600', flex: 1 },
  
  dayCell: { width: 46, height: 56, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1 },
  dowText: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 },
  dayText: { fontWeight: '800', fontSize: 14 },
  cell: { width: 46, height: 52, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  
  addInput: { flex: 1, fontSize: 12, fontWeight: '600' },
  moodText: { fontSize: 11, fontWeight: '700' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { borderRadius: 20, width: '100%', maxWidth: 360, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalBody: { padding: 20 },
  modalLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  iconOption: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 6, borderWidth: 2 },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  deleteBtnText: { fontWeight: '600', fontSize: 13 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  cancelBtnText: { fontWeight: '600', fontSize: 13 },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
