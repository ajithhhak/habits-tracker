import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert, Modal, Platform } from 'react-native';
import { Text } from "@/components/CustomText";
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const MOODS = ['Happy', 'Excited', 'Neutral', 'Sad', 'Tired', 'Stressed', 'Grateful'];
const ICONS = ['⭐','🔥','💧','🏃','📚','🧘','💪','🍎','💻','🎨','🎵','🧹','💸','💊','🌿','✨','📝','🦷','🍳','🚴'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

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
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<any[]>([]);
  const [logs, setLogs] = useState<Record<string, any>>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newHabit, setNewHabit] = useState('');
  const [addingHabit, setAddingHabit] = useState(false);
  const [editModal, setEditModal] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');

  const monthKey = formatMonth(currentDate);
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

  useEffect(() => { loadTracker(); }, [monthKey]);

  async function getToken() {
    const token = await SecureStore.getItemAsync('jwt');
    if (!token) { router.replace('/login'); return null; }
    return token;
  }

  async function loadTracker() {
    setLoading(true);
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
      setLoading(false);
    }
  }

  async function toggleTick(habitId: string, day: number) {
    const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`;
    const current = logs[dateKey]?.ticks?.[habitId] || false;
    const newVal = !current;

    setLogs(prev => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], ticks: { ...(prev[dateKey]?.ticks || {}), [habitId]: newVal } }
    }));

    try {
      const token = await getToken();
      if (!token) return;
      await fetch(`${API_URL}/api/habits/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: dateKey, habitId, value: newVal }),
      });
    } catch (err) { console.error('Failed to save', err); }
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

  function prevMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }
  function goToday() { setCurrentDate(new Date()); }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading tracker...</Text>
      </View>
    );
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="checkbox-outline" size={28} color="#7c3aed" style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>Habit Tracker</Text>
        </View>
        <Text style={styles.headerSub}>Tap a circle to log your progress</Text>
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.monthBtn} onPress={prevMonth}>
            <Ionicons name="chevron-back" size={14} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.monthBtnText}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.monthBtn} onPress={goToday}>
            <Text style={[styles.monthBtnText, { fontWeight: '700' }]}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.monthBtn} onPress={nextMonth}>
            <Text style={styles.monthBtnText}>Next</Text>
            <Ionicons name="chevron-forward" size={14} color="#475569" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
        <Text style={styles.monthLabel}>{getMonthName(currentDate)}</Text>
      </View>

      <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 20 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.row}>
              <View style={styles.habitColHeader}><Text style={styles.colHeaderText}>Habits</Text></View>
              {days.map(d => {
                const dateKey = `${monthKey}-${String(d).padStart(2, '0')}`;
                const isToday = dateKey === todayStr;
                const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                const dowName = DOW[dateObj.getDay()];
                return (
                  <View key={d} style={[styles.dayCell, isToday && styles.todayCell]}>
                    <Text style={[styles.dowText, isToday && styles.todayText]}>{dowName}</Text>
                    <Text style={[styles.dayText, isToday && styles.todayText]}>{d}</Text>
                  </View>
                );
              })}
            </View>

            {habits.map((habit, hi) => (
              <View key={habit._id} style={[styles.row, { backgroundColor: hi % 2 === 0 ? '#fff' : '#fafafa' }]}>
                <TouchableOpacity
                  style={[styles.habitCol, { backgroundColor: hi % 2 === 0 ? '#fff' : '#fafafa' }]}
                  onLongPress={() => { setEditModal(habit); setEditName(habit.name); setEditIcon(habit.icon || '✨'); }}
                >
                  <Text style={styles.habitIcon}>{habit.icon}</Text>
                  <Text style={styles.habitName} numberOfLines={1}>{habit.name}</Text>
                </TouchableOpacity>
                {days.map(d => {
                  const dateKey = `${monthKey}-${String(d).padStart(2, '0')}`;
                  const isChecked = logs[dateKey]?.ticks?.[habit._id];
                  return (
                    <TouchableOpacity key={d} style={[styles.cell, isChecked && styles.cellChecked]} onPress={() => toggleTick(habit._id, d)}>
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked && <Ionicons name="checkmark" size={18} color="#fff" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            <View style={styles.row}>
              <View style={[styles.habitCol, { backgroundColor: '#f8fafc' }]}>
                <TextInput
                  style={styles.addInput}
                  placeholder="+ Add a habit…"
                  placeholderTextColor="#94a3b8"
                  value={newHabit}
                  onChangeText={setNewHabit}
                  onSubmitEditing={addHabit}
                  returnKeyType="done"
                />
                {newHabit.trim() ? (
                  <TouchableOpacity style={styles.addBtn} onPress={addHabit} disabled={addingHabit}>
                    <Text style={styles.addBtnText}>{addingHabit ? '...' : 'Add'}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              {days.map(d => <View key={d} style={[styles.cell, { backgroundColor: '#f8fafc' }]} />)}
            </View>

            <View style={styles.row}>
              <View style={[styles.habitCol, { backgroundColor: '#faf5ff' }]}>
                <Ionicons name="sparkles-outline" size={18} color="#7c3aed" style={{ marginRight: 8 }} />
                <Text style={[styles.habitName, { color: '#7c3aed' }]}>Daily Mood</Text>
              </View>
              {days.map(d => {
                const dateKey = `${monthKey}-${String(d).padStart(2, '0')}`;
                const mood = logs[dateKey]?.mood;
                return (
                  <TouchableOpacity
                    key={d}
                    style={[styles.cell, { backgroundColor: '#faf5ff' }]}
                    onPress={() => {
                      Alert.alert('Select Mood', 'How are you feeling?',
                        [...MOODS.map(m => ({ text: m, onPress: () => setMoodForDay(d, m) })),
                         { text: 'Clear', onPress: () => setMoodForDay(d, ''), style: 'destructive' },
                         { text: 'Cancel', style: 'cancel' }]
                      );
                    }}
                  >
                    <Text style={styles.moodText}>{mood ? mood.substring(0,2) : '·'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </ScrollView>

      <Modal visible={!!editModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Habit</Text>
              <TouchableOpacity onPress={() => setEditModal(null)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Habit Name</Text>
              <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} />
              <Text style={[styles.modalLabel, { marginTop: 16 }]}>Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {ICONS.map(ic => (
                  <TouchableOpacity
                    key={ic}
                    onPress={() => setEditIcon(ic)}
                    style={[styles.iconOption, editIcon === ic && styles.iconOptionActive]}
                  >
                    <Text style={{ fontSize: 22 }}>{ic}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={deleteHabit} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color="#dc2626" style={{ marginRight: 4 }} />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => setEditModal(null)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveHabit} style={styles.saveBtn}>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, color: '#7c3aed', fontWeight: '600' },
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { padding: 20, paddingTop: 56, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
  headerSub: { fontSize: 13, color: '#64748b', marginTop: 4 },
  monthNav: { flexDirection: 'row', gap: 8, marginTop: 14 },
  monthBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  monthBtnText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  monthLabel: { fontSize: 18, fontWeight: '700', color: '#7c3aed', marginTop: 10 },
  mainScroll: { flex: 1 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  habitColHeader: { width: 150, padding: 14, justifyContent: 'center', backgroundColor: '#f8fafc', borderRightWidth: 1, borderRightColor: '#e2e8f0' },
  colHeaderText: { fontWeight: '700', color: '#64748b', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 },
  habitCol: { width: 150, padding: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#e2e8f0' },
  habitIcon: { fontSize: 18, marginRight: 8 },
  habitName: { fontSize: 13, fontWeight: '600', color: '#334155', flex: 1 },
  dayCell: { width: 50, height: 56, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', borderRightWidth: 1, borderRightColor: '#f1f5f9' },
  todayCell: { backgroundColor: '#f5f3ff' },
  dowText: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 },
  dayText: { fontWeight: '800', color: '#1e293b', fontSize: 14 },
  todayText: { color: '#7c3aed' },
  cell: { width: 50, height: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#f1f5f9' },
  cellChecked: { backgroundColor: '#faf5ff' },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  checkboxChecked: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  addInput: { flex: 1, fontSize: 13, fontWeight: '600', color: '#334155' },
  addBtn: { backgroundColor: '#7c3aed', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  addBtnText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  moodText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 360, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#faf5ff' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  modalBody: { padding: 20 },
  modalLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6 },
  modalInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a' },
  iconOption: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 6, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  iconOptionActive: { backgroundColor: '#ede9fe', borderColor: '#7c3aed', borderWidth: 2 },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', backgroundColor: '#fafafa' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  deleteBtnText: { color: '#dc2626', fontWeight: '600', fontSize: 13 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f1f5f9' },
  cancelBtnText: { color: '#475569', fontWeight: '600', fontSize: 13 },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: '#7c3aed' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
