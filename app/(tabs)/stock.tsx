import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Layers, Globe } from 'lucide-react-native';

import { useInventory } from '@/context/inventory-context';

export default function StockOverviewScreen() {
  const { products, godowns, stock } = useInventory();
  const { width: windowWidth } = useWindowDimensions();

  // Define column widths for consistency
  const PRODUCT_COL_WIDTH = 140;
  const DATA_COL_WIDTH = 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Decorative Background Auras */}
      <View style={styles.backdrop} pointerEvents="none">
        <View style={styles.blueAura} />
        <View style={styles.goldAura} />
        <View style={styles.tealAura} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Globe size={24} color="#0f172a" />
            <Text style={styles.heading}>Global Stock</Text>
          </View>
          <Text style={styles.subheading}>Live inventory distribution across all locations</Text>
        </View>

        {/* The Matrix Table */}
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Table Header */}
              <View style={[styles.row, styles.headerRow]}>
                <View style={[styles.cell, { width: PRODUCT_COL_WIDTH }]}>
                  <Text style={styles.headerLabel}>PRODUCT</Text>
                </View>
                {godowns.map((g) => (
                  <View key={g.id} style={[styles.cell, { width: DATA_COL_WIDTH }]}>
                    <Text style={styles.headerLabel} numberOfLines={1}>{g.name.toUpperCase()}</Text>
                  </View>
                ))}
                <View style={[styles.cell, { width: DATA_COL_WIDTH }]}>
                  <Text style={[styles.headerLabel, { color: '#2563eb' }]}>TOTAL</Text>
                </View>
              </View>

              {/* Table Body */}
              {products.map((p, index) => {
                const quantities = godowns.map((g) => {
                  const entry = stock.find((s) => s.productId === p.id && s.godownId === g.id);
                  return entry?.quantity ?? 0;
                });
                const total = quantities.reduce((acc, value) => acc + value, 0);

                return (
                  <View key={p.id} style={[styles.row, index === products.length - 1 && styles.lastRow]}>
                    <View style={[styles.cell, styles.stickyColumn, { width: PRODUCT_COL_WIDTH }]}>
                      <Box size={14} color="#64748b" style={{ marginRight: 6 }} />
                      <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                    </View>
                    
                    {quantities.map((q, i) => (
                      <View key={`${p.id}-${godowns[i].id}`} style={[styles.cell, { width: DATA_COL_WIDTH }]}>
                        <Text style={[styles.dataText, q === 0 && styles.dimmedText]}>
                          {q}
                        </Text>
                      </View>
                    ))}

                    <View style={[styles.cell, { width: DATA_COL_WIDTH }]}>
                      <View style={styles.totalBadge}>
                        <Text style={styles.totalText}>{total}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  backdrop: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  
  // Auras
  blueAura: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#E0F2FE', top: -50, right: -100, opacity: 0.6 },
  goldAura: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#FEF3C7', bottom: -50, left: -100, opacity: 0.5 },
  tealAura: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#F0FDFA', top: '30%', right: -80, opacity: 0.4 },

  header: { marginBottom: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  heading: { fontSize: 32, fontWeight: '900', color: '#0f172a', letterSpacing: -1 },
  subheading: { fontSize: 15, color: '#64748b', fontWeight: '500' },

  tableContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  lastRow: { borderBottomWidth: 0 },
  headerRow: { backgroundColor: 'rgba(248, 250, 252, 0.8)', height: 50 },
  
  cell: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyColumn: { justifyContent: 'flex-start' },
  headerLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 1 },
  productName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  dataText: { fontSize: 15, fontWeight: '600', color: '#475569', textAlign: 'center' },
  dimmedText: { color: '#cbd5e1', fontWeight: '400' },
  
  totalBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  totalText: { fontSize: 14, fontWeight: '800', color: '#2563eb' },
});