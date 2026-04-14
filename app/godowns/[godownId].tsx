import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Store, Package, Info, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useInventory } from '@/context/inventory-context';

type ActionTab = 'in' | 'out';

export default function GodownDetailsScreen() {
  const router = useRouter();
  const { godownId } = useLocalSearchParams<{ godownId: string }>();
  const { products, godowns, stock, addStockIn, addStockOut } = useInventory();
  
  const [tab, setTab] = useState<ActionTab>('in');
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [showProductOptions, setShowProductOptions] = useState(false);

  const godown = godowns.find((g) => g.id === godownId);
  const selectedProduct = products.find((p) => p.id === productId);
  
  const godownStock = useMemo(
    () => stock.filter((s) => s.godownId === godownId),
    [godownId, stock]
  );
  const totalStock = godownStock.reduce((sum, s) => sum + s.quantity, 0);

  useEffect(() => {
    if (products.length === 1) setProductId(products[0].id);
  }, [products]);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowProductOptions(!showProductOptions);
  };

  const submit = () => {
    const value = Number(qty);
    if (!productId || !Number.isFinite(value) || value <= 0) {
      return setError('Please select a product and quantity.');
    }
    if (tab === 'in') {
      addStockIn(productId, godownId, value, notes.trim());
    } else {
      const ok = addStockOut(productId, godownId, value, notes.trim());
      if (!ok) return setError('Insufficient stock in this warehouse.');
    }
    setError('');
    setQty('');
    setNotes('');
    setShowProductOptions(false);
  };

  if (!godown) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Modern Back Navigation */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color="#0f172a" />
          <Text style={styles.backText}>All Warehouses</Text>
        </Pressable>

        {/* Hero Header */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heading}>{godown.name}</Text>
              <View style={styles.locationRow}>
                <Store size={14} color="#64748b" />
                <Text style={styles.subheading}>{godown.location || 'No location set'}</Text>
              </View>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>STOCK LEVEL</Text>
              <Text style={styles.statValue}>{totalStock}</Text>
            </View>
          </View>
        </View>

        {/* Action Card */}
        <View style={styles.card}>
          <View style={styles.tabRow}>
            <Pressable 
              style={[styles.tabBtn, tab === 'in' && styles.tabBtnActiveIn]} 
              onPress={() => setTab('in')}
            >
              <ArrowDownLeft size={16} color={tab === 'in' ? '#fff' : '#10b981'} />
              <Text style={[styles.tabText, tab === 'in' && styles.tabTextActive]}>Stock In</Text>
            </Pressable>
            <Pressable 
              style={[styles.tabBtn, tab === 'out' && styles.tabBtnActiveOut]} 
              onPress={() => setTab('out')}
            >
              <ArrowUpRight size={16} color={tab === 'out' ? '#fff' : '#ef4444'} />
              <Text style={[styles.tabText, tab === 'out' && styles.tabTextActive]}>Stock Out</Text>
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Select Product</Text>
            <Pressable
              style={[styles.selectTrigger, showProductOptions && styles.selectTriggerOpen]}
              onPress={toggleDropdown}>
              <Package size={18} color={selectedProduct ? "#2563eb" : "#94a3b8"} />
              <View style={styles.selectCopy}>
                <Text style={productId ? styles.selectText : styles.selectPlaceholder}>
                  {selectedProduct?.name ?? 'Select product...'}
                </Text>
                {selectedProduct && <Text style={styles.selectMeta}>SKU: {selectedProduct.sku}</Text>}
              </View>
              <Text style={[styles.chevron, showProductOptions && styles.chevronOpen]}>⌄</Text>
            </Pressable>
            
            {showProductOptions && (
              <View style={styles.dropdown}>
                {products.map((p) => (
                  <Pressable
                    key={p.id}
                    style={[styles.dropdownItem, p.id === productId && styles.dropdownItemSelected]}
                    onPress={() => { setProductId(p.id); toggleDropdown(); }}>
                    <Text style={[styles.dropdownTitle, p.id === productId && { color: '#2563eb' }]}>{p.name}</Text>
                    <Text style={styles.dropdownSubtitle}>{p.sku}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <TextInput 
            style={styles.input} 
            placeholder="Quantity to update" 
            value={qty} 
            onChangeText={setQty} 
            keyboardType="numeric" 
            placeholderTextColor="#94a3b8"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Notes (optional)" 
            value={notes} 
            onChangeText={setNotes} 
            placeholderTextColor="#94a3b8"
          />

          {error ? (
            <View style={styles.errorBox}>
              <Info size={14} color="#ef4444" />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          <Pressable 
            style={[styles.primaryBtn, { backgroundColor: tab === 'in' ? '#10b981' : '#ef4444' }]} 
            onPress={submit}
          >
            <Text style={styles.primaryText}>Update Warehouse Stock</Text>
          </Pressable>
        </View>

        {/* Inventory Breakdown Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Current Inventory</Text>
          {godownStock.length > 0 ? (
            godownStock.map((entry) => {
              const product = products.find((p) => p.id === entry.productId);
              return (
                <View key={entry.productId} style={styles.stockRow}>
                  <View style={styles.stockRowLeft}>
                    <Package size={16} color="#64748b" />
                    <Text style={styles.stockProductName}>{product?.name ?? 'Unknown'}</Text>
                  </View>
                  <Text style={styles.qty}>{entry.quantity} <Text style={styles.unit}>{product?.unit}</Text></Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>This warehouse is currently empty.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 4,
  },
  backText: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  headerBlock: { marginBottom: 4 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  heading: { fontSize: 32, fontWeight: '900', color: '#0f172a', letterSpacing: -1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  subheading: { color: '#64748b', fontSize: 15, fontWeight: '500' },
  statBadge: { backgroundColor: '#fff', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'flex-end' },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 },
  statValue: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  
  tabRow: { flexDirection: 'row', gap: 12, backgroundColor: '#f1f5f9', padding: 4, borderRadius: 16 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
  tabBtnActiveIn: { backgroundColor: '#10b981', shadowColor: '#10b981', shadowOpacity: 0.2, shadowRadius: 8 },
  tabBtnActiveOut: { backgroundColor: '#ef4444', shadowColor: '#ef4444', shadowOpacity: 0.2, shadowRadius: 8 },
  tabText: { fontWeight: '700', fontSize: 14, color: '#64748b' },
  tabTextActive: { color: '#fff' },
  
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginLeft: 4 },
  selectTrigger: { height: 60, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  selectTriggerOpen: { borderColor: '#2563eb', backgroundColor: '#fff' },
  selectCopy: { flex: 1 },
  selectText: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  selectPlaceholder: { fontSize: 16, color: '#94a3b8' },
  selectMeta: { fontSize: 11, color: '#94a3b8', fontWeight: '700', marginTop: 2 },
  chevron: { fontSize: 20, color: '#94a3b8' },
  chevronOpen: { transform: [{ rotate: '180deg' }], color: '#2563eb' },
  
  dropdown: { marginTop: 4, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  dropdownItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownItemSelected: { backgroundColor: '#f0f7ff' },
  dropdownTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  dropdownSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  
  input: { height: 56, backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, fontSize: 16, color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  error: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  primaryBtn: { height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  stockRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stockProductName: { fontSize: 15, fontWeight: '600', color: '#334155' },
  qty: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
  unit: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginVertical: 20 },
});