import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API = 'http://10.118.57.232:4000/api';

export default function TripsScreen({ navigation, token, user }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const driverId = user.driver_id;

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/trips/driver/${driverId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTrips(res.data);
      } catch (e) {
        setTrips([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderItem = ({ item }) => {
    const tripEarnings = (item.rate_per_trip || 0) + (item.extra_earnings || 0);

    return (
      <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#ddd' }}>
        <Text style={{ fontWeight: 'bold' }}>Trip #{item.id}</Text>
        <Text>Material: {item.material_type} – {item.quantity} {item.unit}</Text>
        <Text>Vehicle: {item.plate} ({item.model})</Text>
        <Text>Status: {item.status}</Text>
        <Text>Earnings: {tripEarnings} SAR</Text>

        <Button
          title="Open"
          onPress={() => navigation.navigate('TripDetail', { trip: item, token })}
        />
      </View>
    );
  };

  if (loading) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>My Trips</Text>
      <FlatList
        data={trips}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
      />
      <Button
        title="Earnings"
        onPress={() => navigation.navigate('Earnings', { token, user })}
      />
    </View>
  );
}