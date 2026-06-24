import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Text } from "@/components/CustomText";
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const token = await SecureStore.getItemAsync('jwt');
      if (!token) { router.replace('/login'); return; }

      const res = await fetch(`${API_URL}/api/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setStats(await res.json());
      } else if (res.status === 401) {
        await SecureStore.deleteItemAsync('jwt');
        router.replace('/login');
      }
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const rawName = stats?.user?.name || 'there';
  const firstName = rawName.split(' ')[0];
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  const insightText = stats?.todayPct === 100
    ? "Incredible work! You've crushed all your habits today. Keep this momentum going!"
    : (stats?.user?.streak ?? 0) >= 3
    ? `Your streak is on fire at ${stats?.user?.streak} days! Consistency is your superpower right now.`
    : (stats?.avgPct ?? 0) < 40 && (stats?.totalHabits ?? 0) > 0
    ? "Building habits takes time. Try scaling back slightly to build momentum."
    : (stats?.daysTracked ?? 0) > 0
    ? "You're making steady progress. Keep showing up—every single checkmark counts!"
    : "Start logging your habits today to unlock personalized insights and trends here.";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Good {greeting},</Text>
            <Text style={styles.userName}>{capitalizedName}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/about')}>
              <Ionicons name="information-circle-outline" size={22} color="#7c3aed" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/(tabs)/profile')}>
              <Ionicons name="settings-outline" size={22} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>Welcome back. Here is your habit performance overview.</Text>
      </View>

      <View style={styles.statsGrid}>
        {[
          { value: `${stats?.user?.streak ?? 0}d`, label: 'CURRENT STREAK', color: '#f97316' },
          { value: `${stats?.todayPct ?? 0}%`, label: "TODAY'S PROGRESS", color: '#10b981' },
          { value: `${stats?.daysTracked ?? 0}`, label: 'DAYS TRACKED', color: '#8b5cf6' },
          { value: `${stats?.avgPct ?? 0}%`, label: 'MONTHLY AVG', color: '#ec4899' },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: s.color }]}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.insightsCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="sparkles" size={18} color="#8b5cf6" style={{ marginRight: 6 }} />
          <Text style={styles.insightsTitle}>Smart Insights</Text>
        </View>
        <Text style={styles.insightsText}>{insightText}</Text>
      </View>

      {stats?.chartData && stats.chartData.length > 0 && (
        <View style={styles.chartCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Ionicons name="trending-up" size={18} color="#8b5cf6" style={{ marginRight: 6 }} />
            <Text style={styles.chartTitle}>Daily Completion Rate</Text>
          </View>
          <Text style={styles.chartSub}>Last 30 days performance</Text>
          <View style={styles.chartBarContainer}>
            {stats.chartData.slice(-14).map((d: any, i: number) => (
              <View key={i} style={styles.chartBarWrapper}>
                <View style={[styles.chartBar, { height: Math.max(4, (d.pct / 100) * 80), backgroundColor: d.pct >= 80 ? '#10b981' : d.pct >= 50 ? '#f59e0b' : d.pct > 0 ? '#ef4444' : '#e2e8f0' }]} />
                <Text style={styles.chartBarLabel}>{d.label?.split('/')[1] || ''}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {stats?.habitStats && stats.habitStats.length > 0 && (
        <View style={styles.habitStatsCard}>
          <Text style={styles.habitStatsTitle}>Habit Performance</Text>
          {stats.habitStats.map((h: any) => (
            <View key={h.id} style={styles.habitRow}>
              <View style={styles.habitIconBox}>
                <Text style={styles.habitIcon}>{h.icon}</Text>
              </View>
              <View style={styles.habitInfo}>
                <View style={styles.habitInfoHeader}>
                  <Text style={styles.habitName} numberOfLines={1}>{h.name}</Text>
                  <Text style={styles.habitRate}>{h.rate}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${h.rate}%` }]} />
                </View>
              </View>
              <Text style={styles.habitDays}>{h.completedDays}/30</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  loadingText: { marginTop: 12, color: '#7c3aed', fontWeight: '600' },
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20, paddingTop: 56 },
  header: { marginBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  greeting: { fontSize: 22, fontWeight: '600', color: '#1e293b' },
  userName: { fontSize: 30, fontWeight: '900', color: '#7c3aed', marginTop: 2 },
  settingsBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#f8fafc',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0',
  },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    width: '48%', borderRadius: 16, padding: 18, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  statValue: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  statLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 },
  insightsCard: {
    backgroundColor: '#faf5ff', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#e9d5ff', marginBottom: 20,
  },
  insightsTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  insightsText: { fontSize: 14, color: '#475569', lineHeight: 21 },
  chartCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 20,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  chartSub: { fontSize: 11, fontWeight: '600', color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  chartBarContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100 },
  chartBarWrapper: { alignItems: 'center', flex: 1, marginHorizontal: 1 },
  chartBar: { width: 10, borderRadius: 5, minHeight: 4 },
  chartBarLabel: { fontSize: 8, color: '#94a3b8', marginTop: 4, fontWeight: '600' },
  habitStatsCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  habitStatsTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  habitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  habitIconBox: {
    width: 42, height: 42, backgroundColor: '#f8fafc', borderRadius: 12,
    borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  habitIcon: { fontSize: 20 },
  habitInfo: { flex: 1, marginRight: 12 },
  habitInfoHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  habitName: { fontSize: 14, fontWeight: '600', color: '#1e293b', flex: 1 },
  habitRate: { fontSize: 14, fontWeight: '700', color: '#7c3aed' },
  progressBarBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#7c3aed', borderRadius: 3 },
  habitDays: { fontSize: 11, fontWeight: '600', color: '#64748b', width: 36, textAlign: 'right' },
});
