import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import WebOnlyAction from '../components/WebOnlyAction';
import { useData } from '../context/DataContext';

export default function DriversScreen() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useData();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '' });

  const openAdd = () => { setEditing(null); setForm({ name: '', phone: '' }); setVisible(true); };
  const openEdit = (item) => { setEditing(item); setForm({ name: item.name || '', phone: item.phone || '' }); setVisible(true); };
  const save = () => {
    if (!form.name.trim()) return;
    if (editing) updateDriver({ ...editing, ...form }); else addDriver(form);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Drivers</Text>
        <WebOnlyAction title="Add Driver" onPress={openAdd} style={styles.addBtn} textStyle={styles.addBtnText} />
      </View>
      <FlatList data={drivers} keyExtractor={(i) => i.id} renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>{item.phone}</Text>
          {Platform.OS === 'web' && (
            <View style={styles.row}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}><Text style={styles.editText}>Edit</Text></TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteDriver(item.id)}><Text style={styles.deleteText}>Delete</Text></TouchableOpacity>
            </View>
          )}
        </View>
      )} />
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Driver' : 'Add Driver'}</Text>
            <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={(t) => setForm((p) => ({ ...p, name: t }))} />
            <TextInput style={styles.input} placeholder="Phone" value={form.phone} onChangeText={(t) => setForm((p) => ({ ...p, phone: t }))} />
            <View style={styles.row}>
              <TouchableOpacity style={styles.saveBtn} onPress={save}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setVisible(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f7fb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800' },
  addBtn: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { color: '#6b7280', marginTop: 4 },
  row: { flexDirection: 'row', gap: 10, marginTop: 10 },
  editBtn: { backgroundColor: '#e0f2fe', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  editText: { color: '#0369a1', fontWeight: '700' },
  deleteBtn: { backgroundColor: '#fee2e2', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  deleteText: { color: '#b91c1c', fontWeight: '700' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  saveBtn: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: '700' },
  cancelBtn: { backgroundColor: '#e5e7eb', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  cancelText: { color: '#111827', fontWeight: '700' },
});