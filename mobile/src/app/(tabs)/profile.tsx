import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Text } from "@/components/CustomText";
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'profile' | 'security'>('profile');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const token = await SecureStore.getItemAsync('jwt');
      if (!token) { router.replace('/login'); return; }

      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setUser(u);
        setName(u.name || '');
        setPhone(u.phone || '');
        setTimezone(u.timezone || 'Asia/Kolkata');
      } else if (res.status === 401) {
        router.replace('/login');
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync('jwt');
      if (!token) return;

      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('timezone', timezone);

      const res = await fetch(`${API_URL}/api/profile/update`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        Alert.alert('Success', 'Profile updated!');
      } else {
        const data = await res.json();
        Alert.alert('Error', data.error || 'Update failed');
      }
    } catch (err) { Alert.alert('Error', 'Network error'); }
    finally { setSaving(false); }
  }

  async function handlePasswordChange() {
    if (newPw !== confirmPw) { Alert.alert('Error', 'Passwords do not match'); return; }
    if (newPw.length < 6) { Alert.alert('Error', 'Password must be 6+ characters'); return; }

    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync('jwt');
      if (!token) return;

      const res = await fetch(`${API_URL}/api/profile/update?action=change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Password changed!');
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      } else {
        Alert.alert('Error', data.error || 'Failed');
      }
    } catch (err) { Alert.alert('Error', 'Network error'); }
    finally { setSaving(false); }
  }

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await SecureStore.deleteItemAsync('jwt');
        await SecureStore.deleteItemAsync('userId');
        router.replace('/login');
      }},
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const initials = user?.name?.[0]?.toUpperCase() || '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>My Profile</Text>
      <Text style={styles.pageSub}>Manage your account settings and preferences</Text>

      <View style={styles.avatarSection}>
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
        <Text style={styles.avatarName}>{user?.name}</Text>
        <Text style={styles.avatarEmail}>{user?.email}</Text>
        <View style={[styles.verifiedBadge, user?.isVerified ? styles.verifiedGreen : styles.verifiedYellow]}>
          <Ionicons name={user?.isVerified ? "checkmark-circle" : "warning"} size={14} color={user?.isVerified ? "#15803d" : "#a16207"} style={{ marginRight: 4 }} />
          <Text style={styles.verifiedText}>{user?.isVerified ? 'Verified' : 'Unverified'}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { value: `${user?.streak ?? 0}d`, label: 'Streak', color: '#f97316' },
          { value: `${user?.longestStreak ?? 0}d`, label: 'Best', color: '#8b5cf6' },
          { value: user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—', label: 'Joined', color: '#ec4899' },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: s.color }]}>
            <Text style={styles.statVal}>{s.value}</Text>
            <Text style={styles.statLbl}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'profile' && styles.tabBtnActive]} onPress={() => setTab('profile')}>
          <Ionicons name="person-outline" size={16} color={tab === 'profile' ? '#7c3aed' : '#94a3b8'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabBtnText, tab === 'profile' && styles.tabBtnTextActive]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'security' && styles.tabBtnActive]} onPress={() => setTab('security')}>
          <Ionicons name="lock-closed-outline" size={16} color={tab === 'security' ? '#7c3aed' : '#94a3b8'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabBtnText, tab === 'security' && styles.tabBtnTextActive]}>Security</Text>
        </TouchableOpacity>
      </View>

      {tab === 'profile' && (
        <View style={styles.formCard}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" />

          <Text style={styles.label}>Email</Text>
          <TextInput style={[styles.input, styles.inputDisabled]} value={user?.email || ''} editable={false} />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" />

          <Text style={styles.label}>Timezone</Text>
          <TextInput style={[styles.input, styles.inputDisabled]} value={timezone} editable={false} />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === 'security' && (
        <View style={styles.formCard}>
          <View style={styles.securityHeader}>
            <Ionicons name="lock-closed-outline" size={28} color="#7c3aed" style={{ marginBottom: 6 }} />
            <Text style={styles.securityTitle}>Change Password</Text>
            <Text style={styles.securitySub}>Ensure your account stays secure.</Text>
          </View>

          <Text style={styles.label}>Current Password</Text>
          <TextInput style={styles.input} value={currentPw} onChangeText={setCurrentPw} placeholder="••••••••" secureTextEntry />

          <Text style={styles.label}>New Password</Text>
          <TextInput style={styles.input} value={newPw} onChangeText={setNewPw} placeholder="Min 6 characters" secureTextEntry />

          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput style={styles.input} value={confirmPw} onChangeText={setConfirmPw} placeholder="Repeat password" secureTextEntry />

          <TouchableOpacity style={styles.saveButton} onPress={handlePasswordChange} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Updating...' : 'Update Password'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#dc2626" style={{ marginRight: 6 }} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, color: '#7c3aed', fontWeight: '600' },
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20, paddingTop: 56 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
  pageSub: { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarRing: { width: 96, height: 96, borderRadius: 48, padding: 3, backgroundColor: '#7c3aed', marginBottom: 12 },
  avatarInner: { flex: 1, borderRadius: 45, backgroundColor: '#ede9fe', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#7c3aed' },
  avatarName: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  avatarEmail: { fontSize: 14, color: '#64748b', marginTop: 2 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  verifiedGreen: { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' },
  verifiedYellow: { backgroundColor: '#fef9c3', borderColor: '#fde68a' },
  verifiedText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLbl: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', marginTop: 2, letterSpacing: 0.5 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16, backgroundColor: '#faf5ff', borderRadius: 14, padding: 4 },
  tabBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  tabBtnTextActive: { color: '#7c3aed', fontWeight: '700' },
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a' },
  inputDisabled: { backgroundColor: '#f1f5f9', color: '#94a3b8' },
  saveButton: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  securityHeader: { alignItems: 'center', marginBottom: 8 },
  securityTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  securitySub: { fontSize: 13, color: '#64748b', marginTop: 4 },
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#fecaca', marginTop: 4 },
  logoutText: { color: '#dc2626', fontSize: 15, fontWeight: '700' },
});
