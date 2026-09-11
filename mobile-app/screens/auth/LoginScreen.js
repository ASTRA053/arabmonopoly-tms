import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login, loading, setLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);

  const onLogin = async () => {
    try {
      setLoading(true);
      await login(email, password);
    } catch (e) {
      Alert.alert('Login Failed', e.message || 'Please check your credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.logoWrap}><Ionicons name="cube-outline" size={34} color="#fff" /></View>
          <Text style={styles.brand}>Arabmonopoly</Text>
          <Text style={styles.subtitle}>Transport Management System</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.desc}>Sign in to continue.</Text>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color="#6b7280" />
            <TextInput style={styles.input} value={email} onChangeText={setEmail}
              placeholder="Enter email" placeholderTextColor="#9ca3af"
              autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#6b7280" />
            <TextInput style={styles.input} value={password} onChangeText={setPassword}
              placeholder="Enter password" placeholderTextColor="#9ca3af"
              secureTextEntry={secure} autoCapitalize="none" autoCorrect={false} />
            <TouchableOpacity onPress={() => setSecure((v) => !v)}>
              <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.button, loading && { opacity: 0.8 }]} onPress={onLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Login'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 22 },
  logoWrap: { width: 74, height: 74, borderRadius: 20, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  brand: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: 1.5 },
  subtitle: { color: '#cbd5e1', marginTop: 6, fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 22, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  desc: { marginTop: 8, color: '#6b7280', fontSize: 14, lineHeight: 20 },
  label: { marginTop: 18, marginBottom: 8, color: '#111827', fontWeight: '700' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 14, backgroundColor: '#f9fafb' },
  input: { flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: '#111827' },
  button: { marginTop: 24, backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});