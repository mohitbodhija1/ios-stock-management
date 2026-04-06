import { Link } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useInventory } from '@/context/inventory-context';

export default function ProductsScreen() {
  const { products, addProduct, deleteProduct } = useInventory();
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('Pieces');
  const [category, setCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  const onAdd = () => {
    if (!name.trim() || !sku.trim()) return;
    addProduct({ name: name.trim(), sku: sku.trim(), unit: unit.trim() || 'Pieces', category: category.trim() });
    setName('');
    setSku('');
    setUnit('Pieces');
    setCategory('');
    setShowAddModal(false);
  };

  const confirmDeleteProduct = () => {
    if (!productToDelete) return;
    deleteProduct(productToDelete.id);
    setProductToDelete(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Products</Text>
            <Text style={styles.subheading}>Manage your product catalog</Text>
          </View>
          <Pressable style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addBtnText}>Add Product</Text>
          </Pressable>
        </View>

        <View style={styles.list}>
          {products.map((p) => (
            <View key={p.id} style={styles.row}>
              <Link href={`/products/${p.id}`} asChild>
                <Pressable style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>{p.name}</Text>
                  <Text style={styles.muted}>
                    {p.sku} | {p.unit} | {p.category || 'No category'}
                  </Text>
                </Pressable>
              </Link>
              <Pressable onPress={() => setProductToDelete({ id: p.id, name: p.name })}>
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Product</Text>
            <TextInput placeholder="Product name" value={name} onChangeText={setName} style={styles.input} />
            <TextInput placeholder="SKU" value={sku} onChangeText={setSku} style={styles.input} />
            <TextInput placeholder="Unit" value={unit} onChangeText={setUnit} style={styles.input} />
            <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />

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

      <Modal visible={!!productToDelete} animationType="fade" transparent onRequestClose={() => setProductToDelete(null)}>
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.modalTitle}>Delete Product</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete {productToDelete?.name ?? 'this product'}?
            </Text>

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => setProductToDelete(null)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.dangerBtn} onPress={confirmDeleteProduct}>
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
