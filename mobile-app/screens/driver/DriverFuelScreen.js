import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { fetchMyTrips, submitFuelLog } from './DriverData';

export default function DriverFuelScreen() {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState({ station: '', liters: '', price_per_liter: '', odometer: '', notes: '' });
  const [photo, setPhoto] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMyTrips(currentUser?.token).then(setTrips).catch((error) => Alert.alert('Fuel unavailable', error.message));
  }, [currentUser?.token]);

  const activeTrip = trips.find((trip) => ['planned', 'in_transit'].includes(trip.status));
  const totalCost = Number(form.liters || 0) * Number(form.price_per_liter || 0);

  async function takePumpPhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert('Camera permission needed', 'Take a photo of the fuel pump before submitting fuel.');
    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6, allowsEditing: true });
    if (!result.canceled && result.assets?.[0]?.base64) setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
  }

  async function submit() {
    if (!activeTrip) return Alert.alert('No active trip', 'Fuel can only be submitted for an assigned active trip.');
    if (!form.station || !Number(form.liters) || !Number(form.price_per_liter) || !photo) return Alert.alert('Complete fuel entry', 'Station, liters, price and a fuel pump photo are required.');
    setSaving(true);
    try {
      await submitFuelLog(currentUser.token, { vehicle_id: activeTrip.vehicle_id, log_date: new Date().toISOString(), station: form.station, liters: Number(form.liters), price_per_liter: Number(form.price_per_liter), total_cost: totalCost, odometer: form.odometer ? Number(form.odometer) : null, notes: form.notes, fuel_photo: photo });
      setForm({ station: '', liters: '', price_per_liter: '', odometer: '', notes: '' }); setPhoto('');
      Alert.alert('Fuel submitted', 'Your fuel entry and pump photo were sent to the office.');
    } catch (error) { Alert.alert('Fuel not saved', error.message); } finally { setSaving(false); }
  }

  return <ScrollView contentContainerStyle={styles.page}><Text style={styles.title}>Add fuel</Text><Text style={styles.subtitle}>{activeTrip ? `Vehicle: ${activeTrip.plate || activeTrip.vehicle_id}` : 'No active assigned vehicle'}</Text><View style={styles.card}><TextInput style={styles.input} placeholder="Fuel station" value={form.station} onChangeText={(station) => setForm({ ...form, station })} /><TextInput style={styles.input} placeholder="Liters" keyboardType="decimal-pad" value={form.liters} onChangeText={(liters) => setForm({ ...form, liters })} /><TextInput style={styles.input} placeholder="Price per liter" keyboardType="decimal-pad" value={form.price_per_liter} onChangeText={(price_per_liter) => setForm({ ...form, price_per_liter })} /><TextInput style={styles.input} placeholder="Odometer (optional)" keyboardType="decimal-pad" value={form.odometer} onChangeText={(odometer) => setForm({ ...form, odometer })} /><TextInput style={styles.input} placeholder="Notes (optional)" value={form.notes} onChangeText={(notes) => setForm({ ...form, notes })} /><Text style={styles.total}>Total: SAR {totalCost.toFixed(2)}</Text><TouchableOpacity style={styles.photoButton} onPress={takePumpPhoto}><Text style={styles.buttonText}>{photo ? 'Fuel pump photo captured' : 'Take fuel pump photo'}</Text></TouchableOpacity>{photo ? <Image source={{ uri: photo }} style={styles.photo} /> : null}<TouchableOpacity style={[styles.submitButton, (!activeTrip || saving) && styles.disabled]} disabled={!activeTrip || saving} onPress={submit}><Text style={styles.buttonText}>{saving ? 'Submitting...' : 'Submit fuel entry'}</Text></TouchableOpacity></View></ScrollView>;
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 16, backgroundColor: '#f5f7fb' }, title: { color: '#111827', fontSize: 25, fontWeight: '800' }, subtitle: { color: '#64748b', marginTop: 5, marginBottom: 16 }, card: { backgroundColor: '#fff', padding: 16, borderRadius: 12 }, input: { borderWidth: 1, borderColor: '#dbe3ef', borderRadius: 8, padding: 12, marginBottom: 10, color: '#111827' }, total: { color: '#111827', fontSize: 17, fontWeight: '800', marginVertical: 6 }, photoButton: { backgroundColor: '#0f766e', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 }, submitButton: { backgroundColor: '#2563eb', padding: 13, borderRadius: 8, alignItems: 'center', marginTop: 12 }, disabled: { opacity: 0.5 }, buttonText: { color: '#fff', fontWeight: '800' }, photo: { height: 180, marginTop: 12, borderRadius: 8 },
});