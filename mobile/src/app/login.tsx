import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Text } from "@/components/CustomText";
import { Link, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'https://habitsyncc.vercel.app';

  async function handleSubmit() {
    setError('');
    if (!email || !password) { setError('Please fill all fields'); return; }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        await SecureStore.setItemAsync('jwt', data.token);
        await SecureStore.setItemAsync('userId', String(data.user._id));
        router.replace('/(tabs)/dashboard');
      } else {
        if (res.status === 403 && data.userId) {
          router.push(`/verify-otp?userId=${data.userId}`);
        } else {
          setError(data.error || 'Login failed');
        }
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons name="sparkles" size={28} color="#fff" />
          </View>
          <Text style={styles.title}>Sign in to HabitSync</Text>
          <Text style={styles.subtitle}>Welcome back, please enter your details.</Text>
        </View>

        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="warning" size={18} color="#b91c1c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail" size={18} color="#a78bfa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={18} color="#a78bfa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Link href="/register" asChild>
              <Text style={styles.link}>Create one free</Text>
            </Link>
          </Text>
        </View>

        <Text style={styles.encryptionText}>🔒 Your data is encrypted</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf2f8', justifyContent: 'center' },
  blobTop: { position: 'absolute', top: -100, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: '#c4b5fd', opacity: 0.3 },
  blobBottom: { position: 'absolute', bottom: -100, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: '#f0abfc', opacity: 0.25 },
  content: { padding: 24, zIndex: 10 },
  header: { alignItems: 'center', marginBottom: 32 },
  iconBox: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  title: { fontSize: 30, fontWeight: '800', color: '#1e293b', marginBottom: 8, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontWeight: '500', color: '#64748b', textAlign: 'center' },
  card: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, padding: 16, borderRadius: 12, marginBottom: 24 },
  errorText: { color: '#b91c1c', fontSize: 14, fontWeight: '500', marginLeft: 12, flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, height: 50 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1e293b' },
  button: { backgroundColor: '#7c3aed', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerText: { textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 24 },
  link: { color: '#7c3aed', fontWeight: '600' },
  encryptionText: { textAlign: 'center', fontSize: 12, color: '#94a3b8', fontWeight: '500', marginTop: 32 }
});
