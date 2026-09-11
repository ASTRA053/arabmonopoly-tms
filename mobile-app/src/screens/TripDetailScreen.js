import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import axios from 'axios';

const API = 'http://10.118.57.232:4000/api';

export default function TripDetailScreen({ route, navigation }) {
  const { trip, token } = route.params;
  const tripEarnings = (trip.rate_per_trip || 0) + (trip.extra_earnings || 0);

  const updateStatus = async (newStatus, actual_start, actual_end) => {
    try {
      await axios.patch(
        `${API}/trips/${trip.id}/status`,
        { status: newStatus, actual_start, actual_end },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      Alert.alert('Success', 'Trip status updated');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Trip #{trip.id}</Text>
      <Text>Material: {trip.material_type} – {trip.quantity} {trip.unit}</Text>
      <Text>Vehicle: {trip.plate} ({trip.model})</Text>
      <Text>Status: {trip.status}</Text>
      <Text>Earnings: {tripEarnings} SAR</Text>

      <View style={{ marginTop: 24 }}>
        <Button
          title="Start Loading"
          onPress={() => updateStatus('loading', new Date().toISOString(), null)}
        />
        <Button
          title="En Route"
          onPress={() => updateStatus('en_route', null, null)}
        />
        <Button
          title="Start Unloading"
          onPress={() => updateStatus('unloading', null, null)}
        />
        <Button
          title="Complete"
          onPress={() => updateStatus('completed', null, new Date().toISOString())}
        />
      </View>
    </View>
  );
}
