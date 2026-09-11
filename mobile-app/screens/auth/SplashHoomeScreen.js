import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SplashHomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Ionicons name="cube-outline" size={42} color="#fff" />
      </View>
      <Text style={styles.title}>TMS</Text>
      <Text style={styles.subtitle}>Transport Management System</Text>
      <Text style={styles.caption}>Managing trucks, trips, drivers, and reports with precision.</Text>
      <ActivityIndicator style={{ marginTop: 26 }} size="large" color="#ffffff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  badge: { width: 96, height: 96, borderRadius: 28, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  title: { color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: 2 },
  subtitle: { color: '#cbd5e1', marginTop: 8, fontSize: 15, fontWeight: '600' },
  caption: { color: '#94a3b8', marginTop: 14, textAlign: 'center', fontSize: 14, lineHeight: 21, maxWidth: 280 },
});