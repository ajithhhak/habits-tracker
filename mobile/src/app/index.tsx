import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await SecureStore.getItemAsync('jwt');
        if (token) {
          router.replace('/(tabs)/dashboard');
        } else {
          router.replace('/login');
        }
      } catch {
        router.replace('/login');
      } finally {
        setChecking(false);
      }
    }
    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#7c3aed" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
});
