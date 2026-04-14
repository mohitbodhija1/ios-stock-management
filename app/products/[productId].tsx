import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Animated, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Store, History, Info } from 'lucide-react-native';

import { useInventory } from '@/context/inventory-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

type ActionTab = 'in' | 'out';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { products, godowns, stock, movements, addStockIn, addStockOut } = useInventory();

  const [tab, setTab] = useState<ActionTab>('in');
  const [godownId, setGodownId] = useState('');
  const [qty, setQty] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [showGodownOptions, setShowGodownOptions] = useState(false);

  const product = products.find((p) => p.id === productId);
  const selectedGodown = godowns.find((g) => g.id === godownId);

  const productStock = useMemo(() => stock.filter((s) => s.productId === productId), [productId, stock]);
  const productMovements = useMemo(() => 
    [...movements].filter((m) => m.productId === productId).reverse(), 
    [movements, productId]
  );
  const totalStock = productStock.reduce((sum, s) => sum + s.quantity, 0);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowGodownOptions(!showGodownOptions);
  };

  const submit = () => {
    const value = Number(qty);
    if (!godownId || !Number.isFinite(value) || value <= 0) {
      return setError('Please select a warehouse and enter a valid quantity.');
    }
    if (tab === 'in') {
      addStockIn(productId, godownId, value, notes.trim());
    } else {
      const ok = addStockOut(productId, godownId, value, notes.trim());
      if (!ok) return setError('Insufficient stock in selected warehouse.');
    }

    setError('');
    setGodownId('');
    setQty('');
    setNotes('');
    setShowGodownOptions(false);
  };

  if (!product) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Premium Navigation Header */}
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#0f172a" />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>{product.name}</Text>
        <View style={styles.navRight}>
          <IconSymbol name="chart.bar.fill" size={20} color="#64748b" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTop}>
             <View>
               <Text style={styles.heading}>{product.name}</Text>
               <View style={styles.metaRow}>
                 <Text style={styles.metaBadge}>{product.sku}</Text>
                 <Text style={styles.metaText}>• {product.unit}</Text>
               </View>
             </View>
             <View style={styles.totalBadge}>
                <Text style={styles.totalLabel}>TOTAL STOCK</Text>
                <Text style={styles.totalValue}>{totalStock}</Text>
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
            <Text style={styles.fieldLabel}>Select Warehouse</Text>
            <Pressable 
              style={[styles.selectTrigger, showGodownOptions && styles.selectTriggerOpen]} 
              onPress={toggleDropdown}
            >
              <Store size={18} color={selectedGodown ? "#2563eb" : "#94a3b8"} />
              <View style={styles.selectCopy}>
                <Text style={selectedGodown ? styles.selectText : styles.selectPlaceholder}>
                  {selectedGodown?.name ?? 'Select Godown...'}
                </Text>
              </View>
              <Text style={[styles.chevron, showGodownOptions && styles.chevronOpen]}>⌄</Text>
            </Pressable>

            {showGodownOptions && (
              <View style={styles.dropdown}>
                {godowns.map((g) => (
                  <Pressable 
                    key={g.id} 
                    style={[styles.dropdownItem, g.id === godownId && styles.dropdownItemSelected]}
                    onPress={() => { setGodownId(g.id); toggleDropdown(); }}
                  >
                    <Text style={[styles.dropdownTitle, g.id === godownId && { color: '#2563eb' }]}>{g.name}</Text>
                    <Text style={styles.dropdownSubtitle}>{g.location || 'Primary Location'}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <TextInput 
            style={styles.input} 
            placeholder="Quantity (0.00)" 
            value={qty} 
            onChangeText={setQty} 
            keyboardType="numeric" 
            placeholderTextColor="#94a3b8"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Notes (e.g. Purchase order #123)" 
            value={notes} 
            onChangeText={setNotes} 
            placeholderTextColor="#94a3b8"
          />

          {error ? <View style={styles.errorContainer}><Info size={14} color="#ef4444" /><Text style={styles.error}>{error}</Text></View> : null}

          <Pressable style={[styles.primaryBtn, { backgroundColor: tab === 'in' ? '#10b981' : '#ef4444' }]} onPress={submit}>
            <Text style={styles.primaryText}>{tab === 'in' ? 'Confirm Addition' : 'Confirm Removal'}</Text>
          </Pressable>
        </View>

        {/* Stock Breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Warehouse Breakdown</Text>
          {productStock.map((entry) => {
            const godown = godowns.find((g) => g.id === entry.godownId);
            return (
              <View key={entry.godownId} style={styles.stockRow}>
                <View style={styles.stockRowLeft}>
                  <Store size={16} color="#64748b" />
                  <Text style={styles.stockGodownName}>{godown?.name ?? 'Unknown'}</Text>
                </View>
                <Text style={styles.stockQty}>{entry.quantity} <Text style={styles.stockUnit}>{product.unit}</Text></Text>
              </View>
            );
          })}
        </View>

        {/* History Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <History size={18} color="#0f172a" />
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          {productMovements.length ? (
            productMovements.map((movement) => (
              <View key={movement.id} style={styles.historyRow}>
                <View style={[styles.historyIcon, { backgroundColor: movement.type === 'in' ? '#ecfdf5' : '#fef2f2' }]}>
                  {movement.type === 'in' ? <ArrowDownLeft size={14} color="#10b981" /> : <ArrowUpRight size={14} color="#ef4444" />}
                </View>
                <View style={styles.historyCopy}>
                  <Text style={styles.historyTitle}>
                    {movement.type === 'in' ? 'Added to ' : 'Removed from '}
                    {godowns.find(g => g.id === (movement.type === 'in' ? movement.toGodownId : movement.fromGodownId))?.name}
                  </Text>
                  <Text style={styles.historyMeta}>{new Date(movement.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {movement.notes || 'No notes'}</Text>
                </View>
                <Text style={[styles.historyQty, { color: movement.type === 'in' ? '#059669' : '#dc2626' }]}>
                  {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No activity recorded yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56, backgroundColor: '#f8fafc' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  navTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  navRight: { width: 40, alignItems: 'center' },

  headerBlock: { marginBottom: 4 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heading: { fontSize: 32, fontWeight: '900', color: '#0f172a', letterSpacing: -1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaBadge: { fontSize: 12, fontWeight: '700', color: '#64748b', backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  metaText: { fontSize: 14, color: '#94a3b8', fontWeight: '500' },
  totalBadge: { alignItems: 'flex-end', backgroundColor: '#fff', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  totalLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 },
  totalValue: { fontSize: 24, fontWeight: '900', color: '#0f172a' },

  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, gap: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  
  tabRow: { flexDirection: 'row', gap: 12, backgroundColor: '#f1f5f9', padding: 4, borderRadius: 16 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
  tabBtnActiveIn: { backgroundColor: '#10b981', shadowColor: '#10b981', shadowOpacity: 0.2, shadowRadius: 8 },
  tabBtnActiveOut: { backgroundColor: '#ef4444', shadowColor: '#ef4444', shadowOpacity: 0.2, shadowRadius: 8 },
  tabText: { fontWeight: '700', fontSize: 14, color: '#64748b' },
  tabTextActive: { color: '#fff' },

  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginLeft: 4 },
  selectTrigger: { height: 56, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  selectTriggerOpen: { borderColor: '#2563eb', backgroundColor: '#fff' },
  selectCopy: { flex: 1 },
  selectText: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  selectPlaceholder: { fontSize: 16, color: '#94a3b8' },
  chevron: { fontSize: 20, color: '#94a3b8' },
  chevronOpen: { transform: [{ rotate: '180deg' }], color: '#2563eb' },

  dropdown: { marginTop: 4, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  dropdownItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownItemSelected: { backgroundColor: '#f0f7ff' },
  dropdownTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  dropdownSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },

  input: { height: 56, backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, fontSize: 16, color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0' },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  error: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  
  primaryBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.15, shadowRadius: 10, elevation: 4 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  stockRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stockGodownName: { fontSize: 15, fontWeight: '600', color: '#334155' },
  stockQty: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  stockUnit: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },

  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  historyIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  historyCopy: { flex: 1 },
  historyTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  historyMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  historyQty: { fontSize: 15, fontWeight: '800' },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginVertical: 20 },
});