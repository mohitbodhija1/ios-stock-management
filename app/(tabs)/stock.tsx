import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useInventory } from '@/context/inventory-context';

export default function StockOverviewScreen() {
  const { products, godowns, stock } = useInventory();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  heading: { fontSize: 34, fontWeight: '700', letterSpacing: 0.3 },
  subheading: { color: '#8e8e93' },
  table: { borderWidth: 1, borderColor: '#ebebf0', borderRadius: 14, overflow: 'hidden', backgroundColor: '#fff' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f2f2f7' },
  header: { backgroundColor: '#fafafa' },
  cell: { flex: 1, padding: 10, fontSize: 12, textAlign: 'center' },
  productCell: { flex: 2, textAlign: 'left' },
  headerText: { fontWeight: '700' },
  total: { fontWeight: '700' },
});
