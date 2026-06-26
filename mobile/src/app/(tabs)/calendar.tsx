import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from "@/components/CustomText";
import * as SecureStore from 'expo-secure-store';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

const API_URL = 'https://habitsyncc.vercel.app';
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function formatMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function CalendarScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthKey = formatMonth(currentDate);

  useFocusEffect(
    useCallback(() => {
      loadCalendar();
    }, [monthKey])
  );

  async function loadCalendar() {
    try {
      const token = await SecureStore.getItemAsync('jwt');
      if (!token) { router.replace('/login'); return; }

      const res = await fetch(`${API_URL}/api/habits/log?month=${monthKey}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const map: Record<string, any> = {};
        (data.logs || []).forEach((l: any) => { map[l.date] = l; });
        setLogs(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function prevMonth() { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)); }
  function nextMonth() { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const selectedData = selectedDate ? logs[selectedDate] : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="calendar-outline" size={28} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Calendar</Text>
        </View>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>View your habit history and moods</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={prevMonth} style={[styles.navBtn, { backgroundColor: colors.background }]}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={[styles.navBtn, { backgroundColor: colors.background }]}>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.daysRow}>
            {DOW.map(d => (
              <Text key={d} style={[styles.dowText, { color: colors.textSecondary }]}>{d.substring(0, 3)}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {blanks.map(b => <View key={`b-${b}`} style={styles.dayBox} />)}
            {days.map(d => {
              const dateKey = `${monthKey}-${String(d).padStart(2, '0')}`;
              const isToday = dateKey === todayStr;
              const isSelected = dateKey === selectedDate;
              
              const log = logs[dateKey];
              const pct = log?.pct || 0;
              const mood = log?.mood || '';
              
              let bg = 'transparent';
              let border = 'transparent';
              let textCol = colors.textSecondary;
              
              if (pct >= 80) { bg = '#dcfce7'; border = '#22c55e'; textCol = '#15803d'; }
              else if (pct >= 50) { bg = '#fef08a'; border = '#eab308'; textCol = '#a16207'; }
              else if (pct > 0) { bg = '#fee2e2'; border = '#ef4444'; textCol = '#b91c1c'; }

              return (
                <TouchableOpacity 
                  key={d} 
                  style={[
                    styles.dayBox, 
                    { backgroundColor: bg, borderColor: border, borderWidth: pct > 0 ? 2 : 0, borderRadius: 12 },
                    isToday && { borderColor: colors.primary, borderWidth: 3 },
                    isSelected && { transform: [{ scale: 1.1 }], shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 5, zIndex: 10 }
                  ]}
                  onPress={() => setSelectedDate(isSelected ? null : dateKey)}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 4, marginTop: 4 }}>
                    <Text style={[styles.dayNumber, { color: isToday ? colors.primary : textCol }]}>{d}</Text>
                    {mood ? <Text style={{ fontSize: 12 }}>{mood.substring(0, 2)}</Text> : null}
                  </View>
                  {pct > 0 && (
                    <View style={{ width: '80%', height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, marginTop: 'auto', marginBottom: 6 }}>
                      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: border, borderRadius: 2 }} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {selectedDate && (
          <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.detailDate, { color: colors.text }]}>
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            
            {selectedData ? (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 8 }}>
                  <View style={[styles.statBox, { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' }]}>
                    <Ionicons name="checkmark-circle" size={24} color="#22c55e" style={{marginBottom: 4}} />
                    <Text style={[styles.statValue, { color: '#15803d' }]}>{selectedData.completedCount || 0}</Text>
                    <Text style={[styles.statLabel, { color: '#166534' }]}>COMPLETED</Text>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}>
                    <Ionicons name="close-circle" size={24} color="#ef4444" style={{marginBottom: 4}} />
                    <Text style={[styles.statValue, { color: '#b91c1c' }]}>{(selectedData.totalCount || 0) - (selectedData.completedCount || 0)}</Text>
                    <Text style={[styles.statLabel, { color: '#991b1b' }]}>MISSED</Text>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: '#f3e8ff', borderColor: '#e9d5ff' }]}>
                    <Ionicons name="analytics" size={24} color="#a855f7" style={{marginBottom: 4}} />
                    <Text style={[styles.statValue, { color: '#7e22ce' }]}>{selectedData.pct || 0}%</Text>
                    <Text style={[styles.statLabel, { color: '#6b21a8' }]}>DONE</Text>
                  </View>
                </View>

                {selectedData.mood ? (
                  <View style={{ alignItems: 'center', marginTop: 12 }}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary, marginBottom: 8, fontSize: 12, letterSpacing: 1 }]}>RECORDED MOOD</Text>
                    <Text style={{ fontSize: 44 }}>{selectedData.mood}</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No habits logged on this day.</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 56, paddingBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 4 },
  calendarCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 20 },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  monthTitle: { fontSize: 18, fontWeight: '700' },
  navBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  daysRow: { flexDirection: 'row', marginBottom: 12 },
  dowText: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayBox: { width: '14.28%', height: 48, justifyContent: 'center', alignItems: 'center' },
  dayNumber: { fontSize: 15, fontWeight: '600' },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  detailCard: { borderRadius: 16, padding: 20, borderWidth: 1 },
  detailDate: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 8 },
  detailLabel: { fontSize: 14, fontWeight: '700' },
  detailValue: { fontSize: 15, fontWeight: '700' },
  emptyText: { fontSize: 14, fontStyle: 'italic', marginTop: 10 },
  statBox: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }
});
