import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { fetchMyTrips, submitCurrentLocation, submitDeliveryProof } from './DriverData';

export default function DriverTripsScreen() {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try { setTrips(await fetchMyTrips(currentUser?.token)); }
    catch (error) { Alert.alert('Trips unavailable', error.message); }
    finally { setLoading(false); }
  }, [currentUser?.token]);
  useEffect(() => { loadTrips(); }, [loadTrips]);

  async function addDeliveryPhoto(trip) {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert('Camera permission needed', 'Allow camera access to upload delivery proof.');
    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6, allowsEditing: true });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    setBusyId(trip.id);
    try {
      await submitDeliveryProof(currentUser.token, trip.id, `data:image/jpeg;base64,${result.assets[0].base64}`, 'Delivery proof uploaded by driver');
      await loadTrips();
      Alert.alert('Saved', 'Delivery photo was sent to dispatch.');
    } catch (error) { Alert.alert('Upload failed', error.message); }
    finally { setBusyId(null); }
  }

  async function shareLocation(trip) {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return Alert.alert('Location permission needed', 'Allow location access to share your vehicle position with dispatch.');
    setBusyId(`location-${trip.id}`);
    try {
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await submitCurrentLocation(currentUser.token, trip.vehicle_id, position.coords);
      Alert.alert('Location shared', 'Dispatch can now see your latest vehicle position.');
    } catch (error) { Alert.alert('Location unavailable', error.message); }
    finally { setBusyId(null); }
  }

  return <FlatList data={trips} refreshing={loading} onRefresh={loadTrips} keyExtractor={(trip) => String(trip.id)} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No trips assigned yet.</Text>} renderItem={({ item }) => <View style={styles.item}><Text style={styles.itemTitle}>Trip #{item.id}</Text><Text style={styles.itemText}>Material: {item.material_type || '-'}</Text><Text style={styles.itemText}>Quantity: {item.quantity || 0} {item.unit || ''}</Text><Text style={styles.itemText}>Vehicle: {item.plate || '-'}</Text><Text style={styles.itemText}>Amount: SAR {Number(item.rate_per_trip || 0).toLocaleString()}</Text><Text style={styles.status}>{item.status}</Text>{item.status !== 'delivered' ? <TouchableOpacity style={styles.locationButton} disabled={busyId === `location-${item.id}`} onPress={() => shareLocation(item)}><Text style={styles.buttonText}>{busyId === `location-${item.id}` ? 'Sharing location...' : 'Share current location'}</Text></TouchableOpacity> : null}{item.delivery_photo ? <Image source={{ uri: item.delivery_photo }} style={styles.photo} /> : item.status !== 'delivered' ? <TouchableOpacity style={styles.button} disabled={busyId === item.id} onPress={() => addDeliveryPhoto(item)}><Text style={styles.buttonText}>{busyId === item.id ? 'Uploading...' : 'Add delivery photo'}</Text></TouchableOpacity> : <Text style={styles.proof}>Delivered</Text>}</View>} />;
}

const styles = StyleSheet.create({
  list: { padding: 16, backgroundColor: '#f5f7fb', flexGrow: 1 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40 },
  item: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, elevation: 1 },
  itemTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 8 },
  itemText: { fontSize: 14, color: '#64748b', marginBottom: 4 },
  status: { color: '#2563eb', fontWeight: '800', marginTop: 6, textTransform: 'capitalize' },
  button: { backgroundColor: '#2563eb', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  locationButton: { backgroundColor: '#0f766e', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontWeight: '800' },
  photo: { height: 150, borderRadius: 10, marginTop: 12 },
  proof: { color: '#16a34a', fontWeight: '800', marginTop: 12 },
});
