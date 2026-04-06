import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useInventory } from '@/context/inventory-context';

export default function StockOverviewScreen() {
  const { products, godowns, stock } = useInventory();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.backdrop}>
        <View style={styles.blueAura} />
        <View style={styles.goldAura} />
        <View style={styles.tealAura} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Stock Overview</Text>
        <Text style={styles.subheading}>Current inventory across all godowns</Text>

      <View style={styles.table}>
        <View style={[styles.row, styles.header]}>
          <Text style={[styles.cell, styles.productCell, styles.headerText]}>Product</Text>
          {godowns.map((g) => (
            <Text key={g.id} style={[styles.cell, styles.headerText]}>
              {g.name}
            </Text>
          ))}
          <Text style={[styles.cell, styles.headerText]}>Total</Text>
        </View>

        {products.map((p) => {
          const quantities = godowns.map((g) => {
            const entry = stock.find((s) => s.productId === p.id && s.godownId === g.id);
            return entry?.quantity ?? 0;
          });
          const total = quantities.reduce((acc, value) => acc + value, 0);

          return (
            <View key={p.id} style={styles.row}>
              <Text style={[styles.cell, styles.productCell]}>{p.name}</Text>
              {quantities.map((q, i) => (
                <Text key={`${p.id}-${godowns[i].id}`} style={styles.cell}>
                  {q || '-'}
                </Text>
              ))}
              <Text style={[styles.cell, styles.total]}>{total}</Text>
            </View>
          );
        })}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f1e8' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#f5f1e8' },
  blueAura: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(137, 207, 240, 0.35)', top: -30, right: -80 },
  goldAura: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255, 214, 140, 0.28)', bottom: 80, left: -70 },
  tealAura: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(141, 211, 199, 0.2)', bottom: 180, right: -50 },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  heading: { fontSize: 34, fontWeight: '700', letterSpacing: 0.3, color: '#111827' },
  subheading: { color: '#6b7280' },
  table: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.76)', borderRadius: 14, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.5)' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(226,232,240,0.7)' },
  header: { backgroundColor: 'rgba(255,255,255,0.6)' },
  cell: { flex: 1, padding: 10, fontSize: 12, textAlign: 'center', color: '#111827' },
  productCell: { flex: 2, textAlign: 'left' },
  headerText: { fontWeight: '700', color: '#111827' },
  total: { fontWeight: '700', color: '#111827' },
});
