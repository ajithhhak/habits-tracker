import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Text } from "@/components/CustomText";
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://habitsyncc.vercel.app';
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDow(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function formatMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
function getMonthName(date: Date) {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}
function formatDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getPctStyle(pct: number) {
  if (pct >= 80) return { bg: '#dcfce7', border: '#22c55e', text: '#15803d' };
  if (pct >= 50) return { bg: '#fef9c3', border: '#eab308', text: '#a16207' };
  if (pct > 0) return { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c' };
  return { bg: '#f8fafc', border: '#e2e8f0', text: '#94a3b8' };
}

export default function CalendarScreen() {
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = formatMonth(currentDate);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDow(year, month);
  const todayStr = formatDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  useEffect(() => { loadCalendar(); }, [monthKey]);

  async function loadCalendar() {
    setLoading(true);
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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  const blanks = Array.from({ length: firstDow });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 {getMonthName(currentDate)}</Text>
        <Text style={styles.subtitle}>Monthly habit overview</Text>
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
            <Ionicons name="chevron-back" size={14} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.navBtnText}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentDate(new Date())}>
            <Text style={[styles.navBtnText, { fontWeight: '700' }]}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
            <Text style={styles.navBtnText}>Next</Text>
            <Ionicons name="chevron-forward" size={14} color="#475569" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.legend}>
        {[
          { color: '#22c55e', bg: '#dcfce7', label: '80%+ done' },
          { color: '#eab308', bg: '#fef9c3', label: '50–79%' },
          { color: '#ef4444', bg: '#fee2e2', label: '1–49%' },
          { color: '#e2e8f0', bg: '#f8fafc', label: 'No data' },
        ].map(l => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.bg, borderColor: l.color }]} />
            <Text style={styles.legendText}>{l.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.dowRow}>
        {DOW.map(d => (
          <View key={d} style={styles.dowCell}>
            <Text style={styles.dowText}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {blanks.map((_, i) => <View key={`b${i}`} style={styles.dayCell} />)}
        {days.map(d => {
          const dateKey = formatDateStr(year, month, d);
          const log = logs[dateKey];
          const pct = log?.pct || 0;
          const mood = log?.mood || '';
          const style = getPctStyle(pct);
          const isToday = dateKey === todayStr;
          const isSelected = selected === dateKey;

          return (
            <TouchableOpacity
              key={d}
              style={[
                styles.dayCell,
                { backgroundColor: style.bg, borderColor: isToday ? '#7c3aed' : style.border, borderWidth: isToday ? 2 : 1 },
                isSelected && { borderColor: '#7c3aed', borderWidth: 2, transform: [{ scale: 1.05 }] },
              ]}
              onPress={() => setSelected(isSelected ? null : dateKey)}
            >
              <View style={styles.dayCellTop}>
                <Text style={[styles.dayNum, { color: isToday ? '#7c3aed' : style.text }]}>{d}</Text>
                {mood ? <Text style={styles.dayMood}>{mood ? mood.substring(0,2) : ''}</Text> : null}
              </View>
              {pct > 0 && (
                <View style={styles.dayProgress}>
                  <View style={styles.dayProgressBg}>
                    <View style={[styles.dayProgressFill, { width: `${pct}%`, backgroundColor: style.border }]} />
                  </View>
                  <Text style={[styles.dayPct, { color: style.text }]}>{pct}%</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {selected && logs[selected] && (
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>
            📅 {new Date(selected + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <View style={styles.detailGrid}>
            <View style={[styles.detailStat, { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' }]}>
              <Text style={[styles.detailStatVal, { color: '#15803d' }]}>{logs[selected].completedCount || 0}</Text>
              <Text style={[styles.detailStatLabel, { color: '#16a34a' }]}>Completed</Text>
            </View>
            <View style={[styles.detailStat, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}>
              <Text style={[styles.detailStatVal, { color: '#b91c1c' }]}>{(logs[selected].totalCount || 0) - (logs[selected].completedCount || 0)}</Text>
              <Text style={[styles.detailStatLabel, { color: '#dc2626' }]}>Missed</Text>
            </View>
            <View style={[styles.detailStat, { backgroundColor: '#ede9fe', borderColor: '#ddd6fe' }]}>
              <Text style={[styles.detailStatVal, { color: '#6d28d9' }]}>{logs[selected].pct || 0}%</Text>
              <Text style={[styles.detailStatLabel, { color: '#7c3aed' }]}>Done</Text>
            </View>
          </View>
          {logs[selected].mood && (
            <View style={styles.detailMood}>
              <Text style={styles.detailMoodLabel}>Recorded Mood</Text>
              <Text style={styles.detailMoodEmoji}>{logs[selected].mood}</Text>
            </View>
          )}
        </View>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, color: '#7c3aed', fontWeight: '600' },
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20, paddingTop: 56 },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  monthNav: { flexDirection: 'row', gap: 8, marginTop: 14 },
  navBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  navBtnText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16, padding: 12, backgroundColor: '#f8fafc', borderRadius: 14, borderWidth: 1, borderColor: '#f1f5f9' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 14, borderRadius: 4, borderWidth: 2 },
  legendText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  dowRow: { flexDirection: 'row', marginBottom: 6 },
  dowCell: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  dowText: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', minHeight: 68, borderRadius: 12, padding: 6, marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  dayCellTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  dayNum: { fontSize: 13, fontWeight: '800', color: '#64748b' },
  dayMood: { fontSize: 10, fontWeight: '700', color: '#94a3b8' },
  dayProgress: { marginTop: 'auto' },
  dayProgressBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2, overflow: 'hidden' },
  dayProgressFill: { height: '100%', borderRadius: 2 },
  dayPct: { fontSize: 9, fontWeight: '800', marginTop: 2 },
  detailCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginTop: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  detailTitle: { fontSize: 17, fontWeight: '700', color: '#1e293b', marginBottom: 14 },
  detailGrid: { flexDirection: 'row', gap: 8 },
  detailStat: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  detailStatVal: { fontSize: 26, fontWeight: '800' },
  detailStatLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  detailMood: { alignItems: 'center', marginTop: 16 },
  detailMoodLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  detailMoodEmoji: { fontSize: 14, fontWeight: 'bold' },
});
