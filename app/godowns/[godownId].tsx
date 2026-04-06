import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { useInventory } from '@/context/inventory-context';

type ActionTab = 'in' | 'out';

export default function GodownDetailsScreen() {
  const router = useRouter();
  const { godownId } = useLocalSearchParams<{ godownId: string }>();
  const { products, godowns, stock, addStockIn, addStockOut } = useInventory();

  const godown = godowns.find((g) => g.id === godownId);

  const [tab, setTab] = useState<ActionTab>('in');
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const [showProductOptions, setShowProductOptions] = useState(false);

  useEffect(() => {
    if (products.length === 1) setProductId(products[0].id);
  }, [products]);

  const godownStock = useMemo(() => stock.filter((s) => s.godownId === godownId), [godownId, stock]);
  const totalStock = godownStock.reduce((sum, s) => sum + s.quantity, 0);

  const submit = () => {
    const value = Number(qty);
    if (!productId || !Number.isFinite(value) || value <= 0) {
      setError('Select product and valid quantity.');
      return;
    }
    if (tab === 'in') {
      addStockIn(productId, godownId, value, notes.trim());
    } else {
      const ok = addStockOut(productId, godownId, value, notes.trim());
      if (!ok) {
        setError('Not enough stock for this product.');
        return;
      }
    }

    setError('');
    setQty('');
    setNotes('');
    setProductId(products.length === 1 ? products[0].id : '');
    setShowProductOptions(false);
  };

  if (!godown) {
    return (
      <View style={styles.center}>
        <Text>Godown not found.</Text>
      </View>
    );
  }

  const selectedProduct = products.find((p) => p.id === productId);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <Pressable onPress={() => router.push('/godowns')} style={styles.backBtn} accessibilityRole="button">
          <ChevronLeft size={20} color="#1473e6" />
        </Pressable>
        <Text style={styles.navTitle}>{godown.name}</Text>
        <View style={styles.navRightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageHeading}>{godown.name}</Text>
        <Text style={styles.pageSubheading}>{godown.location || 'No location'}</Text>
        <Text style={styles.pageTotal}>Total stock in this godown: {totalStock}</Text>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            <Pressable style={[styles.tabBtn, tab === 'in' && styles.tabBtnActive]} onPress={() => setTab('in')}>
              <Text style={[styles.tabText, tab === 'in' && styles.tabTextActive]}>Stock In</Text>
            </Pressable>
            <Pressable style={[styles.tabBtn, tab === 'out' && styles.tabBtnActive]} onPress={() => setTab('out')}>
              <Text style={[styles.tabText, tab === 'out' && styles.tabTextActive]}>Stock Out</Text>
            </Pressable>
          </View>

          <Text style={styles.fieldLabel}>Product</Text>
          <Pressable style={styles.selectTrigger} onPress={() => setShowProductOptions((v) => !v)}>
            <Text style={productId ? styles.selectText : styles.selectPlaceholder}>
              {productId ? selectedProduct?.name ?? productId : 'Select product'}
            </Text>
          </Pressable>
          {showProductOptions && (
            <View style={styles.dropdown}>
              {products.map((p) => {
                const isSelected = p.id === productId;
                return (
                  <Pressable
                    key={p.id}
                    style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                    onPress={() => {
                      setProductId(p.id);
                      setShowProductOptions(false);
                    }}>
                    <Text style={styles.dropdownTitle}>{p.name}</Text>
                    <Text style={styles.dropdownSubtitle}>{p.sku}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Quantity"
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
          />
          <TextInput style={styles.input} placeholder="Notes (optional)" value={notes} onChangeText={setNotes} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.primaryBtn} onPress={submit}>
            <Text style={styles.primaryText}>{tab === 'in' ? 'Add Stock' : 'Remove Stock'}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Stock by Product</Text>
          {godownStock.map((entry) => {
            const product = products.find((p) => p.id === entry.productId);
            return (
              <View key={`${entry.productId}-${entry.godownId}`} style={styles.stockRow}>
                <Text>{product?.name ?? entry.productId}</Text>
                <Text style={styles.qty}>{entry.quantity}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
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

  pageHeading: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  pageSubheading: { color: '#6b7280', marginTop: 2 },
  pageTotal: { fontWeight: '700', marginTop: 6 },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e8f0',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },

  tabRow: { flexDirection: 'row', gap: 10 },
  tabBtn: { flex: 1, borderWidth: 1, borderColor: '#d8dfeb', borderRadius: 12, paddingVertical: 12, backgroundColor: '#fff' },
  tabBtnActive: { backgroundColor: '#1473e6', borderColor: '#1473e6' },
  tabText: { textAlign: 'center', fontWeight: '700', color: '#0f172a' },
  tabTextActive: { color: '#fff' },

  fieldLabel: { fontSize: 12, fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
  selectTrigger: { borderWidth: 1, borderColor: '#d8dfeb', borderRadius: 12, padding: 12, backgroundColor: '#f8fafc' },
  selectText: { color: '#111827', fontWeight: '700' },
  selectPlaceholder: { color: '#8e8e93', fontWeight: '600' },

  dropdown: {
    borderWidth: 1,
    borderColor: '#d8dfeb',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    backgroundColor: '#fff',
  },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eef2f7' },
  dropdownItemSelected: { backgroundColor: '#eef5ff' },
  dropdownTitle: { fontWeight: '700', color: '#111827' },
  dropdownSubtitle: { color: '#64748b', fontSize: 12, marginTop: 2 },

  input: { borderWidth: 1, borderColor: '#e7e7ee', borderRadius: 12, padding: 12, backgroundColor: '#fafafa' },
  error: { color: '#dc2626', fontWeight: '700' },
  primaryBtn: { backgroundColor: '#1473e6', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800' },

  sectionTitle: { fontWeight: '900', marginBottom: 6 },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f2f2f7', paddingVertical: 10 },
  qty: { fontWeight: '900' },
});

/*
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

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

  useEffect(() => {
    if (products.length === 1) {
      setProductId(products[0].id);
    }
  }, [products]);

  const godown = godowns.find((g) => g.id === godownId);
  const godownStock = useMemo(() => stock.filter((s) => s.godownId === godownId), [godownId, stock]);
  const totalStock = godownStock.reduce((sum, s) => sum + s.quantity, 0);

  const submit = () => {
    const value = Number(qty);
    if (!productId || !Number.isFinite(value) || value <= 0) {
      return setError('Select product and valid quantity.');
    }
    if (tab === 'in') {
      addStockIn(productId, godownId, value, notes.trim());
    } else {
      const ok = addStockOut(productId, godownId, value, notes.trim());
      if (!ok) return setError('Not enough stock for this product.');
    }

    setError('');
    setProductId(products.length === 1 ? products[0].id : '');
    setQty('');
    setNotes('');
  };

  if (!godown) {
    return (
      <View style={styles.center}>
        <Text>Godown not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <Pressable
          onPress={() => router.push('/godowns')}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to godowns">
          <ChevronLeft size={20} color="#1473e6" />
        </Pressable>
        <Text style={styles.navTitle}>{godown.name}</Text>
        <View style={styles.navRightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={styles.heading}>{godown.name}</Text>
          <Text style={styles.subheading}>{godown.location || 'No location'}</Text>
          <Text style={styles.total}>Total stock in this godown: {totalStock}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            {(['in', 'out'] as ActionTab[]).map((t) => (
              <Pressable
                key={t}
                style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                onPress={() => setTab(t)}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'in' ? 'Stock In' : 'Stock Out'}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Product</Text>
            <View style={styles.selectWrap}>
              <Pressable style={styles.selectTrigger} onPress={() => setShowProductOptions((v) => !v)}>
                <View style={styles.selectCopy}>
                  <Text style={productId ? styles.selectText : styles.selectPlaceholder}>
                    {productId ? products.find((p) => p.id === productId)?.name ?? productId : 'Select product'}
                  </Text>
                  <Text style={styles.selectMeta}>{productId ? 'Selected item' : 'Tap to choose'}</Text>
                </View>
              </Pressable>

              {showProductOptions && (
                <View style={styles.dropdown}>
                  {products.map((p, index) => (
                    <Pressable
                      key={p.id}
                      style={[
                        styles.dropdownItem,
                        index === products.length - 1 && styles.dropdownItemLast,
                        p.id === productId && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setProductId(p.id);
                        setShowProductOptions(false);
                      }}>
                      <Text style={[styles.dropdownTitle, p.id === productId && styles.dropdownTitleSelected]}>{p.name}</Text>
                      <Text style={styles.dropdownSubtitle}>{p.sku}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>

          <TextInput style={styles.input} placeholder="Quantity" value={qty} onChangeText={setQty} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Notes (optional)" value={notes} onChangeText={setNotes} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.primaryBtn} onPress={submit}>
            <Text style={styles.primaryText}>{tab === 'in' ? 'Add Stock' : 'Remove Stock'}</Text>
          </Pressable>
          <Text style={styles.hint}>Stock will be updated for the selected product.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Stock by Product</Text>
          {godownStock.map((entry) => {
            const product = products.find((p) => p.id === entry.productId);
            return (
              <View key={`${entry.productId}-${entry.godownId}`} style={styles.stockRow}>
                <Text>{product?.name ?? entry.productId}</Text>
                <Text style={styles.qty}>{entry.quantity}</Text>
              </View>
            );
          })}
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
  qty: { fontWeight: '800', fontSize: 18, color: '#111827' },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

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

  useEffect(() => {
    if (products.length === 1) {
      setProductId(products[0].id);
    }
  }, [products]);

  const godown = godowns.find((g) => g.id === godownId);

  const godownStock = useMemo(() => stock.filter((s) => s.godownId === godownId), [godownId, stock]);
  const totalStock = godownStock.reduce((sum, s) => sum + s.quantity, 0);

  const submit = () => {
    const value = Number(qty);
    if (!productId || !Number.isFinite(value) || value <= 0) {
      return setError('Select product and valid quantity.');
    }
    if (tab === 'in') {
      addStockIn(productId, godownId, value, notes.trim());
    } else {
      const ok = addStockOut(productId, godownId, value, notes.trim());
      if (!ok) return setError('Not enough stock for this product.');
    }
    setError('');
    setProductId(products.length === 1 ? products[0].id : '');
    setQty('');
    setNotes('');
  };

  if (!godown) {
    return (
      <View style={styles.center}>
        <Text>Godown not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <Pressable
          onPress={() => router.push('/godowns')}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to godowns">
          <ChevronLeft size={20} color="#1473e6" />
        </Pressable>
        <Text style={styles.navTitle}>{godown.name}</Text>
        <View style={styles.navRightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={styles.heading}>{godown.name}</Text>
          <Text style={styles.subheading}>{godown.location || 'No location'}</Text>
          <Text style={styles.total}>Total stock in this godown: {totalStock}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            {(['in', 'out'] as ActionTab[]).map((t) => (
              <Pressable
                key={t}
                style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                onPress={() => setTab(t)}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'in' ? 'Stock In' : 'Stock Out'}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Product</Text>
            <View style={styles.selectWrap}>
              <Pressable style={styles.selectTrigger} onPress={() => setShowProductOptions((v) => !v)}>
                <View style={styles.selectCopy}>
                  <Text style={productId ? styles.selectText : styles.selectPlaceholder}>
                    {productId ? products.find((p) => p.id === productId)?.name ?? productId : 'Select product'}
                  </Text>
                  <Text style={styles.selectMeta}>{productId ? 'Selected item' : 'Tap to choose'}</Text>
                </View>
              </Pressable>

              {showProductOptions && (
                <View style={styles.dropdown}>
                  {products.map((p, index) => (
                    <Pressable
                      key={p.id}
                      style={[
                        styles.dropdownItem,
                        index === products.length - 1 && styles.dropdownItemLast,
                        p.id === productId && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setProductId(p.id);
                        setShowProductOptions(false);
                      }}>
                      <Text style={[styles.dropdownTitle, p.id === productId && styles.dropdownTitleSelected]}>{p.name}</Text>
                      <Text style={styles.dropdownSubtitle}>{p.sku}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>

          <TextInput style={styles.input} placeholder="Quantity" value={qty} onChangeText={setQty} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Notes (optional)" value={notes} onChangeText={setNotes} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.primaryBtn} onPress={submit}>
            <Text style={styles.primaryText}>{tab === 'in' ? 'Add Stock' : 'Remove Stock'}</Text>
          </Pressable>
          <Text style={styles.hint}>Stock will be updated for the selected product.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Stock by Product</Text>
          {godownStock.map((entry) => {
            const product = products.find((p) => p.id === entry.productId);
            return (
              <View key={`${entry.productId}-${entry.godownId}`} style={styles.stockRow}>
                <Text>{product?.name ?? entry.productId}</Text>
                <Text style={styles.qty}>{entry.quantity}</Text>
              </View>
            );
          })}
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
  qty: { fontWeight: '800', fontSize: 18, color: '#111827' },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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

  useEffect(() => {
    if (products.length === 1) {
      setProductId(products[0].id);
    }
  }, [products]);

  const godown = godowns.find((g) => g.id === godownId);
  const selectedProduct = products.find((p) => p.id === productId);
  const godownStock = useMemo(
    () => stock.filter((s) => s.godownId === godownId),
    [godownId, stock]
  );
  const totalStock = godownStock.reduce((sum, s) => sum + s.quantity, 0);

  const submit = () => {
    const value = Number(qty);
    if (!productId || !Number.isFinite(value) || value <= 0) {
      return setError('Select product and valid quantity.');
    }
    if (tab === 'in') {
      addStockIn(productId, godownId, value, notes.trim());
    } else {
      const ok = addStockOut(productId, godownId, value, notes.trim());
      if (!ok) return setError('Not enough stock for this product.');
    }
    setError('');
    setProductId(products.length === 1 ? products[0].id : '');
    setQty('');
    setNotes('');
  };

  if (!godown) {
    return (
      <View style={styles.center}>
        <Text>Godown not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.push('/godowns')}>
          <ChevronLeft size={18} color="#0f172a" />
          <Text style={styles.backText}>Back to Godowns</Text>
        </Pressable>

        <View style={styles.headerBlock}>
          <Text style={styles.heading}>{godown.name}</Text>
          <Text style={styles.subheading}>{godown.location || 'No location'}</Text>
          <Text style={styles.total}>Total stock in this godown: {totalStock}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            {(['in', 'out'] as ActionTab[]).map((t) => (
              <Pressable key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === 'in' ? 'Stock In' : 'Stock Out'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Product</Text>
            <View style={styles.selectWrap}>
              <Pressable
                style={[styles.selectTrigger, showProductOptions && styles.selectTriggerOpen]}
                onPress={() => setShowProductOptions((v) => !v)}>
                <View style={styles.selectCopy}>
                  <Text style={productId ? styles.selectText : styles.selectPlaceholder}>
                    {selectedProduct?.name ?? 'Select product'}
                  </Text>
                  <Text style={styles.selectMeta}>
                    {selectedProduct ? 'Selected product' : 'Choose which product to update'}
                  </Text>
                </View>
                <Text style={[styles.chevron, showProductOptions && styles.chevronOpen]}>⌄</Text>
              </Pressable>
              {showProductOptions && (
                <View style={styles.dropdown}>
                  {products.map((p, index) => {
                    const isSelected = p.id === productId;
                    return (
                      <Pressable
                        key={p.id}
                        style={[
                          styles.dropdownItem,
                          index === products.length - 1 && styles.dropdownItemLast,
                          isSelected && styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setProductId(p.id);
                          setShowProductOptions(false);
                        }}>
                        <Text style={[styles.dropdownTitle, isSelected && styles.dropdownTitleSelected]}>{p.name}</Text>
                        <Text style={styles.dropdownSubtitle}>{isSelected ? 'Currently selected' : 'Tap to choose'}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
          <TextInput style={styles.input} placeholder="Quantity" value={qty} onChangeText={setQty} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Notes (optional)" value={notes} onChangeText={setNotes} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.primaryBtn} onPress={submit}>
            <Text style={styles.primaryText}>{tab === 'in' ? 'Add Stock' : 'Remove Stock'}</Text>
          </Pressable>
          <Text style={styles.hint}>
            {selectedProduct ? `Stock will be ${tab === 'in' ? 'added for' : 'removed from'} ${selectedProduct.name}.` : 'Select a product to continue.'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Stock by Product</Text>
          {godownStock.map((entry) => {
            const product = products.find((p) => p.id === entry.productId);
            return (
              <View key={`${entry.productId}-${entry.godownId}`} style={styles.stockRow}>
                <Text>{product?.name ?? entry.productId}</Text>
                <Text style={styles.qty}>{entry.quantity}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { padding: 18, gap: 14, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d8dfeb',
  },
  backText: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
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
  qty: { fontWeight: '800', fontSize: 18, color: '#111827' },
});
*/
