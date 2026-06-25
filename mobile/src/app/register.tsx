import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { Text } from "@/components/CustomText";
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://habitsyncc.vercel.app';

  async function handleSubmit() {
    setError('');
    if (!form.name.trim()) { setError('Please enter your name'); return; }
    if (!form.email.trim()) { setError('Please enter your email'); return; }
    if (!form.phone.trim()) { setError('Please enter your phone number'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push({ pathname: '/verify-otp', params: { userId: data.userId, email: form.email.trim() } });
    } catch (err) {
      console.error(err);
      setError('Network error. Is the Next.js server running?');
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Ionicons name="sparkles" size={28} color="#fff" />
        </View>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Join HabitSync and start tracking today.</Text>
      </View>

      <View style={styles.card}>
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="warning" size={16} color="#b91c1c" style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="John Doe" placeholderTextColor="#94a3b8" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email address</Text>
          <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#94a3b8" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} placeholder="+91 98765 43210" placeholderTextColor="#94a3b8" value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} keyboardType="phone-pad" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Min 6 characters" placeholderTextColor="#94a3b8" value={form.password} onChangeText={(t) => setForm({ ...form, password: t })} secureTextEntry />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput style={styles.input} placeholder="Repeat password" placeholderTextColor="#94a3b8" value={form.confirm} onChangeText={(t) => setForm({ ...form, confirm: t })} secureTextEntry />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.securityNoteContainer}>
        <Ionicons name="lock-closed" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
        <Text style={styles.securityNote}>Your data is encrypted.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20, justifyContent: 'center', minHeight: '100%' },
  header: { alignItems: 'center', marginBottom: 30 },
  logoBox: { width: 64, height: 64, backgroundColor: '#7c3aed', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  title: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 12, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#fecaca' },
  errorText: { color: '#b91c1c', fontSize: 14, fontWeight: '500' },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a' },
  button: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#64748b', fontSize: 14 },
  linkText: { color: '#7c3aed', fontSize: 14, fontWeight: '700' },
  securityNoteContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  securityNote: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
});
