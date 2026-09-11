import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { fetchMyTrips } from './DriverData';

export default function DriverDashboardScreen() {
  const { currentUser } = useAuth();
  const [myTrips, setMyTrips] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const loadTrips = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    try { setMyTrips(await fetchMyTrips(currentUser?.token)); setError(''); }
    catch (requestError) { setError(requestError.message); }
    finally { setRefreshing(false); }
  }, [currentUser?.token]);
  useEffect(() => { loadTrips(); }, [loadTrips]);
  const delivered = myTrips.filter((trip) => trip.status === 'delivered').length;
  const earnings = myTrips.reduce((total, trip) => total + Number(trip.rate_per_trip || 0) + Number(trip.extra_earnings || 0), 0);

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadTrips(true)} />} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, padding: 16, backgroundColor: '#f5f7fb' }}>
      <Text style={styles.kicker}>ARABMONOPOLY LOGISTICS</Text><Text style={styles.header}>Welcome, {currentUser?.name || 'Driver'}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.card}>
        <Text style={styles.title}>My account</Text><Text style={styles.text}>{currentUser?.email}</Text><Text style={styles.text}>Driver ID: {currentUser?.driver_id || '-'}</Text>
      </View>
      <View style={styles.grid}><View style={styles.stat}><Text style={styles.big}>{myTrips.length}</Text><Text style={styles.text}>Total trips</Text></View><View style={styles.stat}><Text style={styles.big}>{delivered}</Text><Text style={styles.text}>Delivered</Text></View><View style={styles.stat}><Text style={styles.big}>SAR {earnings.toLocaleString()}</Text><Text style={styles.text}>Total earnings</Text></View></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  kicker: { color: '#64748b', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16, marginTop: 5, color: '#111827' },
  error: { color: '#b91c1c', backgroundColor: '#fee2e2', padding: 10, borderRadius: 10, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  text: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  big: { fontSize: 28, fontWeight: '800', color: '#2563eb' },
  grid: { gap: 10 },
  stat: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, elevation: 2 },
});