import { Link } from 'expo-router';
import { useState, useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Trash2, Package, Tag, Layers } from 'lucide-react-native';

import { useInventory } from '@/context/inventory-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProductsScreen() {
  const { products, addProduct, deleteProduct } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Product Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('Pieces');
  const [category, setCategory] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const onAdd = async () => {
    if (!name.trim() || !sku.trim()) return;
    try {
      await addProduct({ 
        name: name.trim(), 
        sku: sku.trim(), 
        unit: unit.trim() || 'Pieces', 
        category: category.trim() 
      });
      setName(''); setSku(''); setUnit('Pieces'); setCategory('');
      setShowAddModal(false);
    } catch (err) { console.error(err); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.backdrop}>
        <View style={styles.blueAura} />
        <View style={styles.goldAura} />
      </View>

      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>Products</Text>
            <Text style={styles.subheading}>{products.length} Items in Catalog</Text>
          </View>
          <Pressable style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Plus size={20} color="#fff" strokeWidth={3} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search by name or SKU..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {filteredProducts.map((p) => (
            <View key={p.id} style={styles.productCard}>
              <Link href={`/products/${p.id}`} asChild>
                <Pressable style={styles.cardInfo}>
                  <View style={styles.iconBox}>
                    <Package size={22} color="#2563eb" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{p.name}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.skuText}>{p.sku}</Text>
                      <Text style={styles.dot}>•</Text>
                      <Text style={styles.categoryText}>{p.category || 'General'}</Text>
                    </View>
                  </View>
                </Pressable>
              </Link>
              
              <Pressable 
                style={styles.deleteBtn} 
                onPress={() => setProductToDelete({ id: p.id, name: p.name })}
              >
                <Trash2 size={18} color="#ef4444" />
              </Pressable>
            </View>
          ))}
          
          {filteredProducts.length === 0 && (
            <View style={styles.emptyState}>
              <Layers size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Add Product Modal (Bottom Sheet Style) */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Product</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PRODUCT NAME</Text>
              <TextInput value={name} onChangeText={setName} placeholder="e.g. Steel Pipe 12ft" style={styles.input} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SKU / BARCODE</Text>
              <TextInput value={sku} onChangeText={setSku} placeholder="e.g. SP-1200" style={styles.input} />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>UNIT</Text>
                <TextInput value={unit} onChangeText={setUnit} placeholder="Pcs" style={styles.input} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CATEGORY</Text>
                <TextInput value={category} onChangeText={setCategory} placeholder="Construction" style={styles.input} />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.secondaryBtnText}>Dismiss</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={onAdd}>
                <Text style={styles.primaryText}>Create Product</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Confirmation */}
      <Modal visible={!!productToDelete} animationType="fade" transparent>
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.modalTitle}>Delete Item?</Text>
            <Text style={styles.confirmText}>
              You are about to remove <Text style={{ fontWeight: '800' }}>{productToDelete?.name}</Text> from your catalog. This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => setProductToDelete(null)}>
                <Text style={styles.secondaryBtnText}>Keep It</Text>
              </Pressable>
              <Pressable style={styles.dangerBtn} onPress={() => { deleteProduct(productToDelete!.id); setProductToDelete(null); }}>
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
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  blueAura: { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: '#E0F2FE', top: -150, right: -150, opacity: 0.5 },
  goldAura: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#FEF3C7', bottom: -100, left: -100, opacity: 0.4 },
  
  content: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 24 },
  heading: { fontSize: 32, fontWeight: '900', color: '#0f172a', letterSpacing: -1 },
  subheading: { fontSize: 15, color: '#64748b', fontWeight: '500' },
  
  addBtn: { width: 48, height: 48, backgroundColor: '#2563eb', borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', height: 52, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#0f172a' },
  
  productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  cardInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  skuText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  dot: { marginHorizontal: 6, color: '#cbd5e1' },
  categoryText: { fontSize: 13, color: '#94a3b8' },
  deleteBtn: { padding: 10 },
  
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, gap: 20 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#e2e8f0', borderRadius: 10, alignSelf: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', marginLeft: 4 },
  input: { height: 56, backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, fontSize: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  primaryBtn: { flex: 2, height: 56, backgroundColor: '#0f172a', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: { flex: 1, height: 56, backgroundColor: '#f1f5f9', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { color: '#475569', fontWeight: '700' },
  
  confirmBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', padding: 24 },
  confirmCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, gap: 16 },
  confirmText: { fontSize: 16, color: '#475569', lineHeight: 24 },
  dangerBtn: { flex: 1, height: 56, backgroundColor: '#ef4444', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 12 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: '#94a3b8', fontWeight: '600' }
});