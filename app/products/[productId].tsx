import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { useInventory } from '@/context/inventory-context';

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
  const productMovements = useMemo(() => movements.filter((movement) => movement.productId === productId), [movements, productId]);
  const totalStock = productStock.reduce((sum, s) => sum + s.quantity, 0);

  const submit = () => {
    const value = Number(qty);
    if (!godownId || !Number.isFinite(value) || value <= 0) {
      return setError('Select godown and valid quantity.');
    }
    if (tab === 'in') {
      addStockIn(productId, godownId, value, notes.trim());
    } else {
      const ok = addStockOut(productId, godownId, value, notes.trim());
      if (!ok) return setError('Not enough stock in this godown.');
    }

    setError('');
    setGodownId('');
    setQty('');
    setNotes('');
  };

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <Pressable
          onPress={() => router.push('/products')}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to products">
          <ChevronLeft size={20} color="#1473e6" />
        </Pressable>
        <Text style={styles.navTitle}>{product.name}</Text>
        <View style={styles.navRightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={styles.heading}>{product.name}</Text>
          <Text style={styles.subheading}>
            SKU: {product.sku} | Unit: {product.unit}
          </Text>
          <Text style={styles.total}>Total stock: {totalStock}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            {(['in', 'out'] as ActionTab[]).map((t) => (
              <Pressable
                key={t}
                style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                onPress={() => setTab(t)}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === 'in' ? 'Stock In' : 'Stock Out'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Godown</Text>
            <View style={styles.selectWrap}>
              <Pressable
                style={[styles.selectTrigger, showGodownOptions && styles.selectTriggerOpen]}
                onPress={() => setShowGodownOptions((v) => !v)}>
                <View style={styles.selectCopy}>
                  <Text style={godownId ? styles.selectText : styles.selectPlaceholder}>
                    {selectedGodown?.name ?? 'Select godown'}
                  </Text>
                  <Text style={styles.selectMeta}>
                    {selectedGodown ? 'Selected location' : 'Choose where stock will be updated'}
                  </Text>
                </View>
                <Text style={[styles.chevron, showGodownOptions && styles.chevronOpen]}>⌄</Text>
              </Pressable>

              {showGodownOptions && (
                <View style={styles.dropdown}>
                  {godowns.map((g, index) => {
                    const isSelected = g.id === godownId;
                    return (
                      <Pressable
                        key={g.id}
                        style={[
                          styles.dropdownItem,
                          index === godowns.length - 1 && styles.dropdownItemLast,
                          isSelected && styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setGodownId(g.id);
                          setShowGodownOptions(false);
                        }}>
                        <Text style={[styles.dropdownTitle, isSelected && styles.dropdownTitleSelected]}>
                          {g.name}
                        </Text>
                        <Text style={styles.dropdownSubtitle}>
                          {isSelected ? 'Currently selected' : 'Tap to choose'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Quantity"
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.primaryBtn} onPress={submit}>
            <Text style={styles.primaryText}>{tab === 'in' ? 'Add Stock' : 'Remove Stock'}</Text>
          </Pressable>
          <Text style={styles.hint}>
            {selectedGodown
              ? `Stock will be ${tab === 'in' ? 'added to' : 'removed from'} ${selectedGodown.name}.`
              : 'Select a godown to continue.'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Stock by Godown</Text>
          {productStock.map((entry) => {
            const godown = godowns.find((g) => g.id === entry.godownId);
            return (
              <View key={`${entry.productId}-${entry.godownId}`} style={styles.stockRow}>
                <Text>{godown?.name ?? entry.godownId}</Text>
                <Text style={styles.qty}>{entry.quantity}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {productMovements.length ? (
            productMovements.map((movement) => {
              const from = godowns.find((g) => g.id === movement.fromGodownId);
              const to = godowns.find((g) => g.id === movement.toGodownId);

              return (
                <View key={movement.id} style={styles.historyRow}>
                  <View style={styles.historyCopy}>
                    <Text style={styles.historyTitle}>
                      {movement.type === 'in' && `IN -> ${to?.name ?? movement.toGodownId ?? 'Unknown godown'}`}
                      {movement.type === 'out' && `OUT <- ${from?.name ?? movement.fromGodownId ?? 'Unknown godown'}`}
                      {movement.type === 'transfer' &&
                        `${from?.name ?? movement.fromGodownId ?? 'Unknown godown'} -> ${to?.name ?? movement.toGodownId ?? 'Unknown godown'}`}
                    </Text>
                    <Text style={styles.historyMeta}>{new Date(movement.date).toLocaleDateString()}</Text>
                    {movement.notes ? <Text style={styles.historyNote}>{movement.notes}</Text> : null}
                  </View>
                  <Text style={styles.qty}>{movement.quantity}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No transaction history for this product yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { padding: 18, gap: 14, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7',
    backgroundColor: '#f4f6fb',
    gap: 10,
  },
  backBtn: { padding: 6, marginLeft: -6, justifyContent: 'center' },
  navTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: '#0f172a' },
  navRightSpacer: { width: 28 },

  headerBlock: { gap: 8, paddingTop: 4 },
  heading: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8, color: '#0f172a' },
  subheading: { color: '#6b7280', fontSize: 15 },
  total: { fontWeight: '700', fontSize: 15, color: '#111827' },

  card: {
    borderWidth: 1,
    borderColor: '#e4e8f0',
    borderRadius: 22,
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    shadowColor: '#17324d',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 2 },
  tabBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cfd7e6',
    borderRadius: 14,
    paddingVertical: 13,
    backgroundColor: '#fff',
  },
  tabBtnActive: { backgroundColor: '#1473e6', borderColor: '#1473e6' },
  tabText: { textAlign: 'center', fontWeight: '700', fontSize: 15, color: '#0f172a' },
  tabTextActive: { color: '#fff' },

  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.6 },
  selectWrap: { position: 'relative', zIndex: 20 },
  selectTrigger: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: '#d8dfeb',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectTriggerOpen: {
    borderColor: '#1473e6',
    backgroundColor: '#eef5ff',
    shadowColor: '#1473e6',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  selectCopy: { flex: 1, gap: 4, paddingRight: 12 },

  input: {
    borderWidth: 1,
    borderColor: '#d8dfeb',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  selectText: { color: '#111827', fontSize: 18, fontWeight: '600' },
  selectPlaceholder: { color: '#8e8e93', fontSize: 18, fontWeight: '500' },
  selectMeta: { color: '#64748b', fontSize: 12, fontWeight: '500' },

  chevron: { fontSize: 24, color: '#64748b', lineHeight: 24 },
  chevronOpen: { color: '#1473e6', transform: [{ rotate: '180deg' }] },

  dropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d8dfeb',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7',
    backgroundColor: '#fff',
    gap: 3,
  },
  dropdownItemLast: { borderBottomWidth: 0 },
  dropdownItemSelected: { backgroundColor: '#eef5ff' },
  dropdownTitle: { fontSize: 16, color: '#111827', fontWeight: '600' },
  dropdownTitleSelected: { color: '#0b63ce' },
  dropdownSubtitle: { fontSize: 12, color: '#64748b' },

  primaryBtn: { backgroundColor: '#1473e6', paddingVertical: 14, borderRadius: 16, marginTop: 2 },
  primaryText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 18 },
  error: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  hint: { color: '#6b7280', fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontWeight: '800', fontSize: 16, color: '#0f172a', marginBottom: 2 },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7',
    paddingVertical: 10,
    alignItems: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7',
    paddingVertical: 12,
  },
  historyCopy: { flex: 1, gap: 4 },
  historyTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  historyMeta: { fontSize: 12, color: '#64748b' },
  historyNote: { fontSize: 13, color: '#475569', lineHeight: 18 },
  emptyText: { color: '#6b7280', fontSize: 14, lineHeight: 20 },
  qty: { fontWeight: '800', fontSize: 18, color: '#111827' },
});
