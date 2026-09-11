import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API = 'http://10.118.57.232:4000/api';

export default function EarningsScreen({ token, user }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const driverId = user.driver_id;

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/trips/driver/${driverId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const completed = res.data.filter(t => t.status === 'completed');
        setTrips(completed);
      } catch (e) {
        setTrips([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalEarnings = trips.reduce(
    (sum, t) => sum + (t.rate_per_trip || 0) + (t.extra_earnings || 0),
    0
  );

  const renderItem = ({ item }) => {
    const earnings = (item.rate_per_trip || 0) + (item.extra_earnings || 0);

    return (
      <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#eee' }}>
        <Text>Trip #{item.id} – {item.material_type}</Text>
        <Text>Earnings: {earnings} SAR</Text>
      </View>
    );
  };

  if (loading) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 8 }}>My Earnings</Text>
      <Text style={{ marginBottom: 12 }}>
        Total (completed trips): {totalEarnings} SAR
      </Text>

      <FlatList
        data={trips}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
      />
    </View>
  );
}
