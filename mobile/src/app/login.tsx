import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Text } from "@/components/CustomText";
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://habitsyncc.vercel.app';

  async function handleSubmit() {
    setError('');
    if (!form.email.trim()) { setError('Please enter your email'); return; }
    if (!form.password) { setError('Please enter your password'); return; }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      await SecureStore.setItemAsync('jwt', data.token);
      await SecureStore.setItemAsync('userId', data.user.id || data.user._id);

      setLoading(false);
      router.replace('/(tabs)/dashboard');
    } catch (err) {
      console.error(err);
      setError('Network error. Is the Next.js server running?');
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Ionicons name="sparkles" size={28} color="#fff" />
        </View>
        <Text style={styles.title}>Sign in to HabitSync</Text>
        <Text style={styles.subtitle}>Welcome back, please enter your details.</Text>
      </View>

      <View style={styles.card}>
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="warning" size={16} color="#b91c1c" style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#94a3b8"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.linkText}>Create one free</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  logoBox: { width: 64, height: 64, backgroundColor: '#7c3aed', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  title: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 12, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#fecaca' },
  errorText: { color: '#b91c1c', fontSize: 14, fontWeight: '500' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16, color: '#0f172a' },
  button: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#64748b', fontSize: 14 },
  linkText: { color: '#7c3aed', fontSize: 14, fontWeight: '700' },
});
