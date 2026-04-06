import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useInventory } from '@/context/inventory-context';

export default function DashboardScreen() {
  const { products, godowns, movements } = useInventory();
  const recentMovements = movements.slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Dashboard</Text>
        <Text style={styles.subheading}>Overview of your inventory</Text>

        <View style={styles.row}>
          <Link href="/(tabs)/products" asChild>
            <Pressable style={styles.card}>
              <Text style={styles.cardLabel}>Products</Text>
              <Text style={styles.cardValue}>{products.length}</Text>
            </Pressable>
          </Link>
          <Link href="/(tabs)/godowns" asChild>
            <Pressable style={styles.card}>
              <Text style={styles.cardLabel}>Godowns</Text>
              <Text style={styles.cardValue}>{godowns.length}</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Recent Movements</Text>
          {recentMovements.length === 0 ? (
            <Text style={styles.muted}>No movements yet.</Text>
          ) : (
            recentMovements.map((m) => {
              const product = products.find((p) => p.id === m.productId);
              const from = godowns.find((g) => g.id === m.fromGodownId);
              const to = godowns.find((g) => g.id === m.toGodownId);
              return (
                <View key={m.id} style={styles.movementRow}>
                  <View>
                    <Text style={styles.movementName}>{product?.name ?? 'Unknown Product'}</Text>
                    <Text style={styles.muted}>
                      {m.type === 'in' && `Stock In -> ${to?.name ?? 'Unknown'}`}
                      {m.type === 'out' && `Stock Out <- ${from?.name ?? 'Unknown'}`}
                      {m.type === 'transfer' && `${from?.name ?? 'Unknown'} -> ${to?.name ?? 'Unknown'}`}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.movementQty}>
                      {m.type === 'in' ? '+' : m.type === 'out' ? '-' : '<>'}
                      {m.quantity}
                    </Text>
                    <Text style={styles.muted}>{new Date(m.date).toLocaleDateString()}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  heading: { fontSize: 34, fontWeight: '700', letterSpacing: 0.3 },
  subheading: { color: '#6b7280', marginBottom: 2 },
  row: { flexDirection: 'row', gap: 12 },
  card: { flex: 1, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#ebebf0', backgroundColor: '#fff' },
  cardLabel: { color: '#8e8e93', marginBottom: 6 },
  cardValue: { fontSize: 22, fontWeight: '700' },
  panel: { marginTop: 8, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#ebebf0', backgroundColor: '#fff', gap: 10 },
  panelTitle: { fontSize: 16, fontWeight: '600' },
  movementRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f2f2f7', paddingVertical: 9 },
  movementName: { fontWeight: '600' },
  movementQty: { textAlign: 'right', fontWeight: '700' },
  muted: { color: '#8e8e93', fontSize: 12 },
});
