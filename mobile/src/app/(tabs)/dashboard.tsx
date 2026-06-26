import { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Image } from 'react-native';
import { Text } from "@/components/CustomText";
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { LineChart } from 'react-native-chart-kit';

const API_URL = 'https://habitsyncc.vercel.app';
const { width } = Dimensions.get('window');

export default function Dashboard() {
  const { colors, theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.primary }]}>Loading dashboard...</Text>
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

  const chartDataRaw = stats?.chartData?.slice(-14) || [];
  const chartLabels = chartDataRaw.map((d: any) => d.label?.split('/')[1] || '');
  const chartValues = chartDataRaw.map((d: any) => d.pct || 0);

  // Fallback if no data
  const hasChartData = chartValues.length > 0;
  const lineChartData = {
    labels: hasChartData ? chartLabels : ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    datasets: [{ data: hasChartData ? chartValues : [0, 0, 0, 0, 0, 0, 0] }]
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Image 
              source={require('../../../assets/images/logo_main.png')} 
              style={styles.appLogo}
              resizeMode="contain"
            />
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good {greeting},</Text>
              <Text style={[styles.userName, { color: colors.text }]}>{capitalizedName}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={toggleTheme}>
              <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/about')}>
              <Ionicons name="information-circle-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Welcome back. Here is your habit performance overview.</Text>
      </View>

      <View style={styles.statsGrid}>
        {[
          { value: `${stats?.user?.streak ?? 0}d`, label: 'CURRENT STREAK', color: colors.warning },
          { value: `${stats?.todayPct ?? 0}%`, label: "TODAY'S PROGRESS", color: colors.success },
          { value: `${stats?.daysTracked ?? 0}`, label: 'DAYS TRACKED', color: colors.primary },
          { value: `${stats?.avgPct ?? 0}%`, label: 'MONTHLY AVG', color: colors.danger },
        ].map((s, i) => (
          <TouchableOpacity 
            key={i} 
            style={[styles.statCard, { backgroundColor: s.color }]}
            activeOpacity={s.label.includes('STREAK') ? 0.7 : 1}
            onPress={() => {
              if (s.label.includes('STREAK')) {
                import('react-native').then(({ Alert }) => {
                  Alert.alert(
                    'Streak Rules 📈', 
                    '• Complete at least 50% of your habits to extend your streak.\n• Missing a day drops your current streak to 0.\n• Keep logging your progress!'
                  );
                });
              }
            }}
          >
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.insightsCard, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="sparkles" size={18} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.insightsTitle, { color: colors.text }]}>Smart Insights</Text>
        </View>
        <Text style={[styles.insightsText, { color: colors.textSecondary }]}>{insightText}</Text>
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Ionicons name="trending-up" size={18} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.chartTitle, { color: colors.text }]}>Daily Completion Rate</Text>
        </View>
        <Text style={[styles.chartSub, { color: colors.textSecondary }]}>Exponential progress tracking</Text>
        
        {hasChartData ? (
          <LineChart
            data={lineChartData}
            width={width - 76}
            height={180}
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
              labelColor: (opacity = 1) => colors.textSecondary,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: colors.primary
              }
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16, alignSelf: 'center' }}
            withInnerLines={false}
            withOuterLines={false}
          />
        ) : (
          <Text style={[styles.chartSub, { color: colors.textSecondary, textAlign: 'center', marginVertical: 20 }]}>Log habits to see your exponential growth curve here.</Text>
        )}
      </View>

      {stats?.habitStats && stats.habitStats.length > 0 && (
        <View style={[styles.habitStatsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.habitStatsTitle, { color: colors.text }]}>Habit Performance</Text>
          {stats.habitStats.map((h: any) => (
            <View key={h.id} style={styles.habitRow}>
              <View style={[styles.habitIconBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={styles.habitIcon}>{h.icon}</Text>
              </View>
              <View style={styles.habitInfo}>
                <View style={styles.habitInfoHeader}>
                  <Text style={[styles.habitName, { color: colors.text }]} numberOfLines={1}>{h.name}</Text>
                  <Text style={[styles.habitRate, { color: colors.primary }]}>{h.rate}%</Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: colors.background }]}>
                  <View style={[styles.progressBarFill, { width: `${h.rate}%`, backgroundColor: colors.primary }]} />
                </View>
              </View>
              <Text style={[styles.habitDays, { color: colors.textSecondary }]}>{h.completedDays}/30</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontWeight: '600' },
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 56 },
  header: { marginBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appLogo: { width: 44, height: 44, marginRight: 12 },
  greeting: { fontSize: 16, fontWeight: '600' },
  userName: { fontSize: 26, fontWeight: '900', marginTop: -2 },
  settingsBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  subtitle: { fontSize: 13, marginTop: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    width: '48%', borderRadius: 16, padding: 18, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  statValue: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  statLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 },
  insightsCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 20 },
  insightsTitle: { fontSize: 16, fontWeight: '700' },
  insightsText: { fontSize: 14, lineHeight: 21 },
  chartCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 20 },
  chartTitle: { fontSize: 16, fontWeight: '700' },
  chartSub: { fontSize: 11, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  habitStatsCard: { borderRadius: 16, padding: 18, borderWidth: 1 },
  habitStatsTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  habitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  habitIconBox: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  habitIcon: { fontSize: 20 },
  habitInfo: { flex: 1, marginRight: 12 },
  habitInfoHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  habitName: { fontSize: 14, fontWeight: '600', flex: 1 },
  habitRate: { fontSize: 14, fontWeight: '700' },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  habitDays: { fontSize: 11, fontWeight: '600', width: 36, textAlign: 'right' },
});
