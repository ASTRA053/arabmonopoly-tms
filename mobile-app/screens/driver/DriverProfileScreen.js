import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export default function DriverProfileScreen() {
  const { currentUser, logout } = useAuth();
  const { drivers, vehicles } = useData();
  const driver = drivers.find(d => d.id === currentUser?.driverId);
  const vehicle = vehicles.find(v => v.id === currentUser?.vehicleId || v.id === driver?.vehicleId);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, padding: 16, backgroundColor: '#f5f7fb' }}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{currentUser?.name || '-'}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{currentUser?.email || '-'}</Text>

        <Text style={styles.label}>Driver ID</Text>
        <Text style={styles.value}>{currentUser?.driverId || '-'}</Text>

        <Text style={styles.label}>Passport</Text>
        <Text style={styles.value}>{driver?.passport || '-'}</Text>

        <Text style={styles.label}>License</Text>
        <Text style={styles.value}>{driver?.license || '-'}</Text>

        <Text style={styles.label}>Vehicle</Text>
        <Text style={styles.value}>{vehicle?.plate || driver?.vehicleId || currentUser?.vehicleId || '-'}</Text>

        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16, color: '#111827' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  label: { fontSize: 12, color: '#9ca3af', marginTop: 10 },
  value: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 2 },
  button: { marginTop: 20, backgroundColor: '#dc2626', paddingVertical: 12, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
});