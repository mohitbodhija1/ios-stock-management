import { Link } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Store, MapPin, Trash2, Warehouse, Info } from 'lucide-react-native';

import { useInventory } from '@/context/inventory-context';

export default function GodownsScreen() {
  const { godowns, addGodown, deleteGodown } = useInventory();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [godownToDelete, setGodownToDelete] = useState<{ id: string; name: string } | null>(null);

  const onAdd = async () => {
    if (!name.trim()) return;
    try {
      await addGodown({ name: name.trim(), location: location.trim() });
      setName('');
      setLocation('');
      setShowAddModal(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const confirmDeleteGodown = () => {
    if (!godownToDelete) return;
    deleteGodown(godownToDelete.id);
    setGodownToDelete(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Premium Backdrop */}
      <View style={styles.backdrop}>
        <View style={styles.blueAura} />
        <View style={styles.goldAura} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Godowns</Text>
            <Text style={styles.subheading}>{godowns.length} Active Warehouses</Text>
          </View>
          <Pressable style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Plus size={20} color="#fff" strokeWidth={3} />
          </Pressable>
        </View>

        {/* Godowns List */}
        <View style={styles.list}>
          {godowns.map((g) => (
            <View key={g.id} style={styles.godownCard}>
              <Link href={`/godowns/${g.id}`} asChild>
                <Pressable style={styles.cardInfo}>
                  <View style={styles.iconBox}>
                    <Warehouse size={22} color="#0f172a" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{g.name}</Text>
                    <View style={styles.locationRow}>
                      <MapPin size={12} color="#94a3b8" />
                      <Text style={styles.muted}>{g.location || 'No location set'}</Text>
                    </View>
                  </View>
                </Pressable>
              </Link>
              <Pressable 
                style={styles.deleteBtn} 
                onPress={() => setGodownToDelete({ id: g.id, name: g.name })}
              >
                <Trash2 size={18} color="#ef4444" />
              </Pressable>
            </View>
          ))}
          
          {godowns.length === 0 && (
            <View style={styles.emptyState}>
              <Store size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No warehouses found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Godown Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Register Godown</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>WAREHOUSE NAME</Text>
              <TextInput 
                placeholder="e.g. Central Hub" 
                value={name} 
                onChangeText={setName} 
                style={styles.input} 
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PHYSICAL LOCATION</Text>
              <TextInput 
                placeholder="e.g. Industrial Area, Block C" 
                value={location} 
                onChangeText={setLocation} 
                style={styles.input} 
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={onAdd}>
                <Text style={styles.primaryText}>Save Warehouse</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Confirmation */}
      <Modal visible={!!godownToDelete} animationType="fade" transparent>
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <View style={styles.warningIcon}>
              <Info size={24} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>Delete Warehouse?</Text>
            <Text style={styles.confirmText}>
              All stock records for <Text style={{ fontWeight: '800' }}>{godownToDelete?.name}</Text> will be removed. This action is permanent.
            </Text>

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => setGodownToDelete(null)}>
                <Text style={styles.secondaryBtnText}>Keep it</Text>
              </Pressable>
              <Pressable style={styles.dangerBtn} onPress={confirmDeleteGodown}>
                <Text style={styles.primaryText}>Confirm Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  blueAura: { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: '#E0F2FE', top: -150, right: -150, opacity: 0.5 },
  goldAura: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#FEF3C7', bottom: -100, left: -100, opacity: 0.4 },
  
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 24 },
  heading: { fontSize: 32, fontWeight: '900', color: '#0f172a', letterSpacing: -1 },
  subheading: { fontSize: 15, color: '#64748b', fontWeight: '500' },
  
  addBtn: { width: 48, height: 48, backgroundColor: '#0f172a', borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  
  list: { gap: 12 },
  godownCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10 },
  cardInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  rowTitle: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  muted: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
  deleteBtn: { padding: 10 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, gap: 20 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#e2e8f0', borderRadius: 10, alignSelf: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', marginLeft: 4 },
  input: { height: 56, backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, fontSize: 16, borderWidth: 1, borderColor: '#e2e8f0', color: '#0f172a' },
  
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  primaryBtn: { flex: 2, height: 56, backgroundColor: '#0f172a', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: { flex: 1, height: 56, backgroundColor: '#f1f5f9', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { color: '#475569', fontWeight: '700' },
  
  confirmBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', padding: 24 },
  confirmCard: { backgroundColor: '#fff', borderRadius: 28, padding: 24, gap: 16, alignItems: 'center' },
  warningIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  confirmText: { fontSize: 16, color: '#475569', lineHeight: 24, textAlign: 'center' },
  dangerBtn: { flex: 2, height: 56, backgroundColor: '#ef4444', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: '#94a3b8', fontWeight: '600' }
});