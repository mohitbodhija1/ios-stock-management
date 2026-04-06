import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useInventory } from '@/context/inventory-context';

type MoveTab = 'in' | 'out' | 'transfer';

export default function MovementsScreen() {
  const { products, godowns, movements, addStockIn, addStockOut, transferStock } = useInventory();

  const [tab, setTab] = useState<MoveTab>('transfer');
  const [productId, setProductId] = useState('');
  const [fromGodownId, setFromGodownId] = useState('');
  const [toGodownId, setToGodownId] = useState('');
  const [qty, setQty] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [showProductOptions, setShowProductOptions] = useState(false);
  const [showFromGodownOptions, setShowFromGodownOptions] = useState(false);
  const [showToGodownOptions, setShowToGodownOptions] = useState(false);

  useEffect(() => {
    if (products.length === 1) {
      setProductId(products[0].id);
    }
  }, [products]);

  const submit = () => {
    const value = Number(qty);
    if (!productId || !Number.isFinite(value) || value <= 0) {
      setError('Select product and enter valid quantity.');
      return;
    }

    if (tab === 'in') {
      if (!toGodownId) return setError('Select destination godown.');
      addStockIn(productId, toGodownId, value, notes.trim());
    } else if (tab === 'out') {
      if (!fromGodownId) return setError('Select source godown.');
      const ok = addStockOut(productId, fromGodownId, value, notes.trim());
      if (!ok) return setError('Not enough stock in source godown.');
    } else {
      if (!fromGodownId || !toGodownId || fromGodownId === toGodownId) {
        return setError('Select different source and destination godowns.');
      }
      const ok = transferStock(productId, fromGodownId, toGodownId, value, notes.trim());
      if (!ok) return setError('Transfer failed. Check source stock.');
    }

    setError('');
    setProductId(products.length === 1 ? products[0].id : '');
    setFromGodownId('');
    setToGodownId('');
    setQty('');
    setNotes('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Stock Movements</Text>
        <Text style={styles.subheading}>Record stock in, out, and transfers</Text>

      <View style={styles.form}>
        <View style={styles.tabRow}>
          {(['in', 'out', 'transfer'] as MoveTab[]).map((t) => (
            <Pressable key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.input} onPress={() => setShowProductOptions((v) => !v)}>
          <Text style={productId ? styles.selectText : styles.selectPlaceholder}>
            {productId ? products.find((p) => p.id === productId)?.name ?? productId : 'Select product'}
          </Text>
        </Pressable>
        {showProductOptions && (
          <View style={styles.dropdown}>
            {products.map((p) => (
              <Pressable
                key={p.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setProductId(p.id);
                  setShowProductOptions(false);
                }}>
                <Text>{p.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {(tab === 'out' || tab === 'transfer') && (
          <>
            <Pressable style={styles.input} onPress={() => setShowFromGodownOptions((v) => !v)}>
              <Text style={fromGodownId ? styles.selectText : styles.selectPlaceholder}>
                {fromGodownId ? godowns.find((g) => g.id === fromGodownId)?.name ?? fromGodownId : 'Select source godown'}
              </Text>
            </Pressable>
            {showFromGodownOptions && (
              <View style={styles.dropdown}>
                {godowns.map((g) => (
                  <Pressable
                    key={g.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFromGodownId(g.id);
                      setShowFromGodownOptions(false);
                    }}>
                    <Text>{g.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}
        {(tab === 'in' || tab === 'transfer') && (
          <>
            <Pressable style={styles.input} onPress={() => setShowToGodownOptions((v) => !v)}>
              <Text style={toGodownId ? styles.selectText : styles.selectPlaceholder}>
                {toGodownId ? godowns.find((g) => g.id === toGodownId)?.name ?? toGodownId : 'Select destination godown'}
              </Text>
            </Pressable>
            {showToGodownOptions && (
              <View style={styles.dropdown}>
                {godowns.map((g) => (
                  <Pressable
                    key={g.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setToGodownId(g.id);
                      setShowToGodownOptions(false);
                    }}>
                    <Text>{g.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}
        <TextInput style={styles.input} placeholder="Quantity" value={qty} onChangeText={setQty} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Notes (optional)" value={notes} onChangeText={setNotes} />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.primaryBtn} onPress={submit}>
          <Text style={styles.primaryText}>{tab === 'in' ? 'Add Stock' : tab === 'out' ? 'Remove Stock' : 'Transfer Stock'}</Text>
        </Pressable>

        <Text style={styles.hint}>Pick product and godown from dropdowns.</Text>
      </View>

      <View style={styles.list}>
        <Text style={styles.sectionTitle}>Movement History</Text>
        {movements.map((m) => {
          const product = products.find((p) => p.id === m.productId);
          const from = godowns.find((g) => g.id === m.fromGodownId);
          const to = godowns.find((g) => g.id === m.toGodownId);
          return (
            <View key={m.id} style={styles.historyRow}>
              <View>
                <Text style={styles.rowTitle}>{product?.name ?? m.productId}</Text>
                <Text style={styles.muted}>
                  {m.type === 'in' && `IN -> ${to?.name ?? m.toGodownId}`}
                  {m.type === 'out' && `OUT <- ${from?.name ?? m.fromGodownId}`}
                  {m.type === 'transfer' && `${from?.name ?? m.fromGodownId} -> ${to?.name ?? m.toGodownId}`}
                </Text>
              </View>
              <View>
                <Text style={styles.qty}>{m.quantity}</Text>
                <Text style={styles.muted}>{new Date(m.date).toLocaleDateString()}</Text>
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
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  heading: { fontSize: 34, fontWeight: '700', letterSpacing: 0.3 },
  subheading: { color: '#8e8e93' },
  form: { borderWidth: 1, borderColor: '#ebebf0', borderRadius: 14, padding: 12, gap: 8, backgroundColor: '#fff' },
  tabRow: { flexDirection: 'row', gap: 8 },
  tabBtn: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingVertical: 8, backgroundColor: '#fff' },
  tabBtnActive: { backgroundColor: '#007aff', borderColor: '#007aff' },
  tabText: { textAlign: 'center', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#ebebf0', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: '#fafafa' },
  selectText: { color: '#111827' },
  selectPlaceholder: { color: '#8e8e93' },
  dropdown: { borderWidth: 1, borderColor: '#ebebf0', borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff' },
  dropdownItem: { paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f2f2f7' },
  primaryBtn: { backgroundColor: '#007aff', paddingVertical: 10, borderRadius: 10, marginTop: 4 },
  primaryText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  hint: { fontSize: 12, color: '#8e8e93' },
  error: { color: '#dc2626', fontSize: 12 },
  list: { borderWidth: 1, borderColor: '#ebebf0', borderRadius: 14, padding: 12, gap: 8, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f2f2f7', paddingVertical: 8 },
  rowTitle: { fontWeight: '600' },
  qty: { fontWeight: '700', textAlign: 'right' },
  muted: { color: '#8e8e93', fontSize: 12 },
});
