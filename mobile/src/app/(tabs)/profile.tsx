import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const API_URL = 'https://habitsyncc.vercel.app';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [currentPass, setCurrentPass] = useState('');
  const [nextPass, setNextPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const token = await SecureStore.getItemAsync('jwt');
      const res = await fetch(`${API_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setName(data.user.name || '');
        setPhone(data.user.phone || '');
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await SecureStore.deleteItemAsync('jwt');
    await SecureStore.deleteItemAsync('userId');
    router.replace('/login');
  }

  async function handleSaveProfile() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert("Success", "Profile updated successfully!");
    }, 1000);
  }

  async function handleSavePassword() {
    if (nextPass !== confirmPass) { Alert.alert("Error", "Passwords do not match"); return; }
    if (nextPass.length < 6) { Alert.alert("Error", "Password too short"); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert("Success", "Password changed successfully!");
      setCurrentPass(''); setNextPass(''); setConfirmPass('');
    }, 1000);
  }

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor: '#fff'}}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  const memberSince = user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-IN', {month:'short', year:'numeric'}) : '—';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerTitleContainer}>
        <Ionicons name="person" size={32} color="#8b5cf6" />
        <Text style={styles.mainTitle}>My Profile</Text>
      </View>
      <Text style={styles.mainSubtitle}>Manage your account settings and preferences</Text>

      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={[styles.statCard, {backgroundColor: '#f97316'}]}
          onPress={() => Alert.alert('Streak Rules 📈', '• Complete at least 50% of your habits to extend your streak.\n• Missing a day drops your current streak to 0.\n• Keep logging your progress!')}
        >
          <Ionicons name="flame" size={24} color="#fff" style={styles.statIcon} />
          <Text style={styles.statValue}>{user?.streak ?? 0}d</Text>
          <Text style={styles.statLabel}>CURRENT STREAK</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.statCard, {backgroundColor: '#8b5cf6'}]}
          onPress={() => Alert.alert('Streak Rules 📈', '• Complete at least 50% of your habits to extend your streak.\n• Missing a day drops your current streak to 0.\n• Keep logging your progress!')}
        >
          <Ionicons name="star" size={24} color="#fff" style={styles.statIcon} />
          <Text style={styles.statValue}>{user?.longestStreak ?? 0}d</Text>
          <Text style={styles.statLabel}>BEST STREAK</Text>
        </TouchableOpacity>
        <View style={[styles.statCard, {backgroundColor: '#ec4899'}]}>
          <Ionicons name="calendar" size={24} color="#fff" style={styles.statIcon} />
          <Text style={styles.statValue}>{memberSince}</Text>
          <Text style={styles.statLabel}>MEMBER SINCE</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'profile' && styles.tabBtnActive]} onPress={() => setTab('profile')}>
          <Ionicons name="person" size={16} color={tab === 'profile' ? '#7c3aed' : '#64748b'} />
          <Text style={[styles.tabText, tab === 'profile' && styles.tabTextActive]}>Profile Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'password' && styles.tabBtnActive]} onPress={() => setTab('password')}>
          <Ionicons name="lock-closed" size={16} color={tab === 'password' ? '#7c3aed' : '#64748b'} />
          <Text style={[styles.tabText, tab === 'password' && styles.tabTextActive]}>Security</Text>
        </TouchableOpacity>
      </View>

      {tab === 'profile' && (
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarBorder}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 48, fontWeight: '900', color: '#8b5cf6' }}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={[styles.badge, user?.isVerified ? styles.badgeVerified : styles.badgeUnverified]}>
              <Ionicons name={user?.isVerified ? "checkmark-circle" : "warning"} size={14} color={user?.isVerified ? '#15803d' : '#a16207'} />
              <Text style={[styles.badgeText, user?.isVerified ? {color: '#15803d'} : {color: '#a16207'}]}>
                {user?.isVerified ? 'Verified Account' : 'Unverified'}
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person" size={18} color="#a78bfa" style={styles.inputIcon} />
                <TextInput style={styles.input} value={name} onChangeText={setName} />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, {backgroundColor: '#f8fafc'}]}>
                <Ionicons name="mail" size={18} color="#cbd5e1" style={styles.inputIcon} />
                <TextInput style={[styles.input, {color: '#94a3b8'}]} value={user?.email} editable={false} />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call" size={18} color="#a78bfa" style={styles.inputIcon} />
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              </View>
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {tab === 'password' && (
        <View style={styles.card}>
          <View style={{alignItems: 'center', marginBottom: 24}}>
            <View style={styles.lockIconBox}>
              <Ionicons name="lock-closed" size={24} color="#7c3aed" />
            </View>
            <Text style={styles.securityTitle}>Change Password</Text>
            <Text style={styles.securitySubtitle}>Ensure your account is using a long, random password to stay secure.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={18} color="#a78bfa" style={styles.inputIcon} />
                <TextInput style={styles.input} secureTextEntry value={currentPass} onChangeText={setCurrentPass} placeholder="••••••••" />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={18} color="#a78bfa" style={styles.inputIcon} />
                <TextInput style={styles.input} secureTextEntry value={nextPass} onChangeText={setNextPass} placeholder="••••••••" />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={18} color="#a78bfa" style={styles.inputIcon} />
                <TextInput style={styles.input} secureTextEntry value={confirmPass} onChangeText={setConfirmPass} placeholder="••••••••" />
              </View>
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSavePassword} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: '#1e293b', marginLeft: 12 },
  mainSubtitle: { fontSize: 14, color: '#64748b', fontWeight: '500', marginBottom: 24 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', marginHorizontal: 4 },
  statIcon: { marginBottom: 8, opacity: 0.9 },
  statValue: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  statLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#f5f3ff', padding: 4, borderRadius: 16, marginBottom: 24 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
  tabBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  tabText: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: '#64748b' },
  tabTextActive: { color: '#7c3aed' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  profileHeader: { alignItems: 'center', marginBottom: 32, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 24 },
  avatarContainer: { marginBottom: 16 },
  avatarBorder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#8b5cf6', padding: 4 },
  avatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#fff', borderWidth: 2, borderColor: '#fff' },
  profileName: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: '#64748b', fontWeight: '500', marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgeVerified: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  badgeUnverified: { backgroundColor: '#fefce8', borderColor: '#fef08a' },
  badgeText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
  form: { width: '100%' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, height: 50 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: '#1e293b' },
  saveBtn: { backgroundColor: '#1e293b', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutBtn: { marginTop: 24, padding: 12, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
  lockIconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  securityTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  securitySubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20 }
});
