import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, LayoutAnimation, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRightLeft, MoveDown, MoveUp, Package, Store, History, Info } from 'lucide-react-native';

import { useInventory } from '@/context/inventory-context';

type MoveTab = 'in' | 'out' | 'transfer';

export default function MovementsScreen() {
  const { products, godowns, movements, addStockIn, addStockOut, transferStock } = useInventory();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [tab, setTab] = useState<MoveTab>('transfer');
  const [productId, setProductId] = useState('');
  const [fromGodownId, setFromGodownId] = useState('');
  const [toGodownId, setToGodownId] = useState('');
  const [qty, setQty] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const [showProductOptions, setShowProductOptions] = useState(false);
  const [showFromOptions, setShowFromOptions] = useState(false);
  const [showToOptions, setShowToOptions] = useState(false);

  const selectedProduct = products.find(p => p.id === productId);
  const sourceGodown = godowns.find(g => g.id === fromGodownId);
  const destGodown = godowns.find(g => g.id === toGodownId);

  useEffect(() => {
    if (products.length === 1) setProductId(products[0].id);
  }, [products]);

  const handleTabChange = (t: MoveTab) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(t);
    setError('');
  };

  const submit = () => {
    const value = Number(qty);
    if (!productId || !Number.isFinite(value) || value <= 0) {
      return setError('Please select a product and valid quantity.');
    }

    if (tab === 'in') {
      if (!toGodownId) return setError('Select destination warehouse.');
      addStockIn(productId, toGodownId, value, notes.trim());
    } else if (tab === 'out') {
      if (!fromGodownId) return setError('Select source warehouse.');
      const ok = addStockOut(productId, fromGodownId, value, notes.trim());
      if (!ok) return setError('Insufficient stock in source.');
    } else {
      if (!fromGodownId || !toGodownId || fromGodownId === toGodownId) {
        return setError('Source and destination must be different.');
      }
      const ok = transferStock(productId, fromGodownId, toGodownId, value, notes.trim());
      if (!ok) return setError('Transfer failed. Check source stock.');
    }

    setError('');
    setQty('');
    setNotes('');
  };

  const accentColor = tab === 'in' ? '#10b981' : tab === 'out' ? '#ef4444' : '#3b82f6';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.backdrop} pointerEvents="none">
        <View style={styles.blueAura} />
        <View style={styles.goldAura} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.heading}>Movements</Text>
          <Text style={styles.subheading}>Manage stock flow across warehouses</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tabBtn, tab === 'in' && { backgroundColor: '#10b981' }]} 
            onPress={() => handleTabChange('in')}
          >
            <MoveDown size={16} color={tab === 'in' ? '#fff' : '#64748b'} />
            <Text style={[styles.tabText, tab === 'in' && styles.tabTextActive]}>IN</Text>
          </Pressable>
          <Pressable 
            style={[styles.tabBtn, tab === 'transfer' && { backgroundColor: '#3b82f6' }]} 
            onPress={() => handleTabChange('transfer')}
          >
            <ArrowRightLeft size={16} color={tab === 'transfer' ? '#fff' : '#64748b'} />
            <Text style={[styles.tabText, tab === 'transfer' && styles.tabTextActive]}>MOVE</Text>
          </Pressable>
          <Pressable 
            style={[styles.tabBtn, tab === 'out' && { backgroundColor: '#ef4444' }]} 
            onPress={() => handleTabChange('out')}
          >
            <MoveUp size={16} color={tab === 'out' ? '#fff' : '#64748b'} />
            <Text style={[styles.tabText, tab === 'out' && styles.tabTextActive]}>OUT</Text>
          </Pressable>
        </View>

        {/* Dynamic Form Card */}
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>ITEM TO MOVE</Text>
            <Pressable style={styles.selector} onPress={() => setShowProductOptions(!showProductOptions)}>
              <Package size={18} color="#94a3b8" />
              <Text style={productId ? styles.selectText : styles.selectPlaceholder}>
                {selectedProduct?.name ?? 'Select Product...'}
              </Text>
            </Pressable>
            {showProductOptions && (
              <View style={styles.dropdown}>
                {products.map(p => (
                  <Pressable key={p.id} style={styles.dropItem} onPress={() => { setProductId(p.id); setShowProductOptions(false); }}>
                    <Text style={styles.dropText}>{p.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={[styles.flowRow, isCompact && styles.flowRowCompact]}>
            {(tab === 'out' || tab === 'transfer') && (
              <View style={styles.flowColumn}>
                <Text style={styles.fieldLabel}>FROM</Text>
                <Pressable style={styles.selector} onPress={() => setShowFromOptions(!showFromOptions)}>
                  <Store size={18} color="#94a3b8" />
                  <Text style={styles.selectText} numberOfLines={1}>{sourceGodown?.name ?? 'Source'}</Text>
                </Pressable>
                {showFromOptions && (
                  <View style={styles.dropdown}>
                    {godowns.map(g => (
                      <Pressable key={g.id} style={styles.dropItem} onPress={() => { setFromGodownId(g.id); setShowFromOptions(false); }}>
                        <Text style={styles.dropText}>{g.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}

            {tab === 'transfer' && (
              <ArrowRightLeft
                size={20}
                color="#cbd5e1"
                style={isCompact ? styles.flowArrowCompact : styles.flowArrow}
              />
            )}

            {(tab === 'in' || tab === 'transfer') && (
              <View style={styles.flowColumn}>
                <Text style={styles.fieldLabel}>TO</Text>
                <Pressable style={styles.selector} onPress={() => setShowToOptions(!showToOptions)}>
                  <Store size={18} color="#94a3b8" />
                  <Text style={styles.selectText} numberOfLines={1}>{destGodown?.name ?? 'Destination'}</Text>
                </Pressable>
                {showToOptions && (
                  <View style={styles.dropdown}>
                    {godowns.map(g => (
                      <Pressable key={g.id} style={styles.dropItem} onPress={() => { setToGodownId(g.id); setShowToOptions(false); }}>
                        <Text style={styles.dropText}>{g.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={[styles.row, isCompact && styles.rowCompact]}>
            <TextInput
              style={[styles.input, styles.qtyInput, isCompact && styles.fullWidthInput]}
              placeholder="Qty"
              value={qty}
              onChangeText={setQty}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.notesInput, isCompact && styles.fullWidthInput]}
              placeholder="Reference/Notes"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {error ? <View style={styles.errorRow}><Info size={14} color="#ef4444" /><Text style={styles.errorText}>{error}</Text></View> : null}

          <Pressable style={[styles.primaryBtn, { backgroundColor: accentColor }]} onPress={submit}>
            <Text style={styles.primaryBtnText}>Confirm Movement</Text>
          </Pressable>
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <History size={18} color="#0f172a" />
            <Text style={styles.sectionTitle}>Movement Log</Text>
          </View>
          
          {movements.slice(0).reverse().map((m) => {
            const product = products.find((p) => p.id === m.productId);
            const from = godowns.find((g) => g.id === m.fromGodownId);
            const to = godowns.find((g) => g.id === m.toGodownId);
            const isTransfer = m.type === 'transfer';

            return (
              <View key={m.id} style={styles.historyCard}>
                <View style={[styles.statusLine, { backgroundColor: m.type === 'in' ? '#10b981' : m.type === 'out' ? '#ef4444' : '#3b82f6' }]} />
                <View style={styles.historyContent}>
                  <View style={styles.historyTop}>
                    <Text style={styles.historyProduct}>{product?.name ?? 'Item'}</Text>
                    <Text style={styles.historyQty}>{m.type === 'out' ? '-' : '+'}{m.quantity}</Text>
                  </View>
                  <Text style={styles.historyPath}>
                    {isTransfer ? `${from?.name} → ${to?.name}` : m.type === 'in' ? `Into ${to?.name}` : `From ${from?.name}`}
                  </Text>
                  <Text style={styles.historyDate}>{new Date(m.date).toLocaleDateString()}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  blueAura: { position: 'absolute', width: 350, height: 350, borderRadius: 175, backgroundColor: '#E0F2FE', top: -100, right: -100, opacity: 0.6 },
  goldAura: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#FEF3C7', bottom: -50, left: -100, opacity: 0.5 },
  
  content: { padding: 20, paddingBottom: 120 },
  header: { marginBottom: 24 },
  heading: { fontSize: 32, fontWeight: '900', color: '#0f172a', letterSpacing: -1 },
  subheading: { fontSize: 15, color: '#64748b', fontWeight: '500' },

  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 6, gap: 6, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  tabBtn: { flex: 1, height: 44, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  tabText: { fontWeight: '700', fontSize: 13, color: '#64748b' },
  tabTextActive: { color: '#fff' },

  card: { backgroundColor: '#fff', borderRadius: 28, padding: 20, gap: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5, marginLeft: 4 },
  selector: { height: 56, backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  selectText: { fontSize: 16, fontWeight: '600', color: '#0f172a', flexShrink: 1 },
  selectPlaceholder: { fontSize: 16, color: '#94a3b8' },

  dropdown: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 4, overflow: 'hidden' },
  dropItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropText: { fontSize: 15, fontWeight: '600', color: '#1e293b' },

  flowRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flowRowCompact: { flexDirection: 'column', alignItems: 'stretch' },
  flowColumn: { flex: 1, minWidth: 0 },
  flowArrow: { marginTop: 20 },
  flowArrowCompact: { alignSelf: 'center', transform: [{ rotate: '90deg' }] },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  rowCompact: { flexDirection: 'column', alignItems: 'stretch' },
  input: { height: 56, backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, fontSize: 16, color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0', minWidth: 0 },
  qtyInput: { flex: 1 },
  notesInput: { flex: 2 },
  fullWidthInput: { flex: 0, width: '100%' },
  
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  primaryBtn: { height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.2, shadowRadius: 10 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },

  historySection: { marginTop: 32, gap: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  historyCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
  statusLine: { width: 6 },
  historyContent: { flex: 1, padding: 16 },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyProduct: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  historyQty: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  historyPath: { fontSize: 13, color: '#64748b', marginTop: 2, fontWeight: '500' },
  historyDate: { fontSize: 11, color: '#94a3b8', marginTop: 8, fontWeight: '700' },
});