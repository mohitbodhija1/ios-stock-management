import { Link } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useInventory } from '@/context/inventory-context';

export default function GodownsScreen() {
  const { godowns, addGodown, deleteGodown } = useInventory();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [godownToDelete, setGodownToDelete] = useState<{ id: string; name: string } | null>(null);

  const onAdd = () => {
    if (!name.trim()) return;
    addGodown({ name: name.trim(), location: location.trim() });
    setName('');
    setLocation('');
    setShowAddModal(false);
  };

  const confirmDeleteGodown = () => {
    if (!godownToDelete) return;
    deleteGodown(godownToDelete.id);
    setGodownToDelete(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Godowns</Text>
            <Text style={styles.subheading}>Manage your warehouses</Text>
          </View>
          <Pressable style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addBtnText}>Add Godown</Text>
          </Pressable>
        </View>

        <View style={styles.list}>
          {godowns.map((g) => (
            <View key={g.id} style={styles.row}>
              <Link href={`/godowns/${g.id}`} asChild>
                <Pressable style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>{g.name}</Text>
                  <Text style={styles.muted}>{g.location || 'No location'}</Text>
                </Pressable>
              </Link>
              <Pressable onPress={() => setGodownToDelete({ id: g.id, name: g.name })}>
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Godown</Text>
            <TextInput placeholder="Godown name" value={name} onChangeText={setName} style={styles.input} />
            <TextInput placeholder="Location" value={location} onChangeText={setLocation} style={styles.input} />

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={onAdd}>
                <Text style={styles.primaryText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!godownToDelete} animationType="fade" transparent onRequestClose={() => setGodownToDelete(null)}>
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.modalTitle}>Delete Godown</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete {godownToDelete?.name ?? 'this godown'}?
            </Text>

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => setGodownToDelete(null)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.dangerBtn} onPress={confirmDeleteGodown}>
                <Text style={styles.primaryText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 },
  heading: { fontSize: 34, fontWeight: '700', letterSpacing: 0.3 },
  subheading: { color: '#8e8e93' },
  addBtn: { backgroundColor: '#007aff', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ebebf0', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: '#fafafa' },
  primaryBtn: { backgroundColor: '#007aff', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginTop: 4, flex: 1 },
  primaryText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  secondaryBtn: { backgroundColor: '#eef0f3', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginTop: 4, flex: 1 },
  secondaryBtnText: { color: '#111827', textAlign: 'center', fontWeight: '600' },
  list: { borderWidth: 1, borderColor: '#ebebf0', borderRadius: 14, backgroundColor: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f2f2f7' },
  rowInfo: { flex: 1 },
  rowTitle: { fontWeight: '600' },
  muted: { color: '#8e8e93', fontSize: 12, marginTop: 2 },
  delete: { color: '#dc2626', fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, gap: 10 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  confirmBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'center', padding: 20 },
  confirmCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 10 },
  confirmText: { color: '#374151', fontSize: 15, lineHeight: 22 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  dangerBtn: { backgroundColor: '#dc2626', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginTop: 4, flex: 1 },
});
