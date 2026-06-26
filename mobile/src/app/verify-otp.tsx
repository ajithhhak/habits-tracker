import { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Platform, KeyboardAvoidingView } from 'react-native';
import { Text } from "@/components/CustomText";
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function VerifyOtpScreen() {
  const { userId } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const API_URL = 'https://habitsyncc.vercel.app';

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  function handleChange(text: string, i: number) {
    if (/[^0-9]/.test(text)) return;
    const nextOtp = [...otp];
    nextOtp[i] = text;
    setOtp(nextOtp);
    if (text && i < 5) inputRefs.current[i + 1]?.focus();
  }

  function handleKeyPress(e: any, i: number) {
    if (e.nativeEvent.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
      const nextOtp = [...otp];
      nextOtp[i - 1] = '';
      setOtp(nextOtp);
    }
  }

  async function handleVerify() {
    setError('');
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter all 6 digits'); return; }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(userId), otp: code }),
      });
      
      const data = await res.json();
      if (res.ok) {
        await SecureStore.setItemAsync('jwt', data.token);
        await SecureStore.setItemAsync('userId', String(data.user._id));
        router.replace('/(tabs)/dashboard');
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    setResending(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(userId) }),
      });
      if (res.ok) {
        setCountdown(60);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to resend');
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setResending(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Image 
          source={require('../../assets/images/logo_main.png')} 
          style={styles.logo}
          resizeMode="contain" 
        />
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to your email address.{'\n'}Enter it below to confirm your account.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.otpContainer}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={el => inputRefs.current[i] = el}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              value={digit}
              onChangeText={text => handleChange(text, i)}
              onKeyPress={e => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Continue →</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          {countdown > 0 ? (
            <Text style={styles.footerText}>Resend OTP in <Text style={styles.countdownText}>{countdown}s</Text></Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              <Text style={styles.resendLink}>{resending ? 'Sending...' : "Didn't receive it? Resend OTP"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdfa', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  logo: { width: 64, height: 64, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  errorBox: { width: '100%', backgroundColor: '#fef2f2', padding: 12, borderRadius: 8, marginBottom: 24 },
  errorText: { color: '#b91c1c', fontSize: 14, textAlign: 'center', fontWeight: '500' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 32 },
  otpInput: { width: 44, height: 56, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, fontSize: 24, fontWeight: '700', textAlign: 'center', backgroundColor: '#f9fafb', color: '#111827' },
  otpInputFilled: { borderColor: '#14b8a6', backgroundColor: '#fff' },
  button: { width: '100%', backgroundColor: '#14b8a6', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { marginTop: 24 },
  footerText: { color: '#9ca3af', fontSize: 14 },
  countdownText: { color: '#0d9488', fontWeight: '700' },
  resendLink: { color: '#0d9488', fontSize: 14, fontWeight: '600' }
});
