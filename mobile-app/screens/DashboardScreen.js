import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_BASE_URL } from '../config';

const emptySummary = {
  kpis: { activeTrips: 0, deliveredToday: 0, fleetUtilization: 0, pendingPayments: 0 },
  dispatch: { planned: [], transit: [], delivered: [] },
  exceptions: [],
  network: [],
};

export default function DashboardScreen() {
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadSummary = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/summary`);
      if (!response.ok) throw new Error('Dashboard data could not be loaded.');
      setSummary(await response.json());
      setError('');
    } catch (requestError) {
      setError(`${requestError.message} Check that the backend is running.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const cards = [
    { label: 'Active trips', value: summary.kpis.activeTrips, tone: '#2563eb' },
    { label: 'Delivered today', value: summary.kpis.deliveredToday, tone: '#16a34a' },
    { label: 'Fleet utilization', value: `${summary.kpis.fleetUtilization}%`, tone: '#ea580c' },
    { label: 'Pending payments', value: summary.kpis.pendingPayments, tone: '#7c3aed' },
  ];
  const dispatchColumns = [
    { title: 'Planned', trips: summary.dispatch.planned },
    { title: 'In transit', trips: summary.dispatch.transit },
    { title: 'Delivered', trips: summary.dispatch.delivered },
  ];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadSummary(true)} />}>
      <View style={styles.header}><View><Text style={styles.kicker}>ARABMONOPOLY LOGISTICS</Text><Text style={styles.title}>Good morning, Ahmed.</Text><Text style={styles.subtitle}>Live operations overview</Text></View>{loading && <ActivityIndicator color="#2563eb" />}</View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.grid}>{cards.map((item) => <View key={item.label} style={styles.card}><View style={[styles.dot, { backgroundColor: item.tone }]} /><Text style={styles.value}>{item.value}</Text><Text style={styles.label}>{item.label}</Text></View>)}</View>
      <Text style={styles.sectionTitle}>Dispatch board</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.board}>{dispatchColumns.map((column) => <View key={column.title} style={styles.column}><View style={styles.columnHeader}><Text style={styles.columnTitle}>{column.title}</Text><Text style={styles.count}>{column.trips.length}</Text></View>{column.trips.length ? column.trips.slice(0, 4).map((trip) => <View key={String(trip.id)} style={styles.tripCard}><Text style={styles.tripId}>{trip.id}</Text><Text style={styles.tripRoute}>{trip.route || trip.plate || 'Assigned movement'}</Text><Text style={styles.tripMeta}>{trip.driver_name || trip.status || 'No driver assigned'}</Text></View>) : <Text style={styles.empty}>No trips</Text>}</View>)}</ScrollView>
      <Text style={styles.sectionTitle}>Exception queue</Text>
      <View style={styles.exceptionPanel}>{summary.exceptions.length ? summary.exceptions.map((item) => <View key={item.title} style={styles.exceptionRow}><View style={styles.exceptionIcon}><Text>!</Text></View><View style={styles.exceptionText}><Text style={styles.exceptionTitle}>{item.title}</Text><Text style={styles.exceptionDetail}>{item.detail}</Text></View></View>) : <Text style={styles.empty}>No operational exceptions detected.</Text>}</View>
      <Text style={styles.sectionTitle}>Network health</Text>
      {summary.network.map((item) => <View key={item.label} style={styles.networkRow}><View style={styles.networkLabel}><Text style={styles.label}>{item.label}</Text><Text style={styles.networkValue}>{item.value}</Text></View><View style={styles.progressTrack}><View style={[styles.progress, { width: `${Math.min(item.progress || 0, 100)}%` }]} /></View></View>)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  kicker: { color: '#64748b', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#0f172a', fontSize: 25, fontWeight: '800', marginTop: 5 },
  subtitle: { color: '#64748b', marginTop: 5 },
  error: { color: '#b91c1c', backgroundColor: '#fee2e2', padding: 12, borderRadius: 10, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2 },
  dot: { width: 9, height: 9, borderRadius: 5, marginBottom: 10 },
  value: { fontSize: 25, fontWeight: '800', color: '#0f172a' },
  label: { marginTop: 5, color: '#64748b', fontWeight: '600', fontSize: 12 },
  sectionTitle: { color: '#0f172a', fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 10 },
  board: { gap: 10, paddingBottom: 4 },
  column: { width: 220, backgroundColor: '#eaf0f8', borderRadius: 14, padding: 10 },
  columnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  columnTitle: { color: '#334155', fontWeight: '800' },
  count: { color: '#2563eb', fontWeight: '800' },
  tripCard: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 8 },
  tripId: { color: '#2563eb', fontWeight: '800', fontSize: 12 },
  tripRoute: { color: '#0f172a', fontWeight: '700', marginTop: 5 },
  tripMeta: { color: '#64748b', fontSize: 12, marginTop: 4 },
  empty: { color: '#64748b', paddingVertical: 10, fontSize: 12 },
  exceptionPanel: { backgroundColor: '#fff', borderRadius: 14, padding: 12 },
  exceptionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  exceptionIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' },
  exceptionText: { flex: 1, marginLeft: 10 },
  exceptionTitle: { color: '#0f172a', fontWeight: '800' },
  exceptionDetail: { color: '#64748b', marginTop: 3, fontSize: 12 },
  networkRow: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  networkLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  networkValue: { color: '#0f172a', fontWeight: '800' },
  progressTrack: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progress: { height: 6, backgroundColor: '#2563eb', borderRadius: 3 },
});