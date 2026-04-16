import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Store, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Activity } from 'lucide-react-native';

import { useInventory } from '@/context/inventory-context';

export default function DashboardScreen() {
  const { products, godowns, movements } = useInventory();
  
  // Get the 5 most recent movements, sorted by date
  const recentMovements = [...movements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Dynamic Background Design */}
      <View style={styles.backdrop} pointerEvents="none">
        <View style={styles.blueAura} />
        <View style={styles.goldAura} />
        <View style={styles.tealAura} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.heading}>Dashboard</Text>
          <Text style={styles.subheading}>Real-time inventory insights</Text>
        </View>

        {/* Quick Stat Cards */}
        <View style={styles.statsRow}>
          <Link href="/(tabs)/products" asChild>
            <Pressable style={styles.card} android_ripple={{ color: 'rgba(0,0,0,0.05)' }}>
              <View style={[styles.iconCircle, { backgroundColor: '#eff6ff' }]}>
                <Package size={20} color="#2563eb" />
              </View>
              <Text style={styles.cardValue}>{products.length}</Text>
              <Text style={styles.cardLabel}>Total Products</Text>
            </Pressable>
          </Link>

          <Link href="/(tabs)/godowns" asChild>
            <Pressable style={styles.card} android_ripple={{ color: 'rgba(0,0,0,0.05)' }}>
              <View style={[styles.iconCircle, { backgroundColor: '#fef2f2' }]}>
                <Store size={20} color="#dc2626" />
              </View>
              <Text style={styles.cardValue}>{godowns.length}</Text>
              <Text style={styles.cardLabel}>Warehouses</Text>
            </Pressable>
          </Link>
        </View>

        {/* Activity Feed */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Activity size={18} color="#0f172a" />
            <Text style={styles.panelTitle}>Recent Activity</Text>
          </View>

          {recentMovements.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.muted}>No inventory movements recorded yet.</Text>
            </View>
          ) : (
            recentMovements.map((m) => {
              const product = products.find((p) => p.id === m.productId);
              const from = godowns.find((g) => g.id === m.fromGodownId);
              const to = godowns.find((g) => g.id === m.toGodownId);
              
              const isStockIn = m.type === 'in';
              const isStockOut = m.type === 'out';

              return (
                <View key={m.id} style={styles.movementRow}>
                  <View style={[
                    styles.movementIcon, 
                    { backgroundColor: isStockIn ? '#ecfdf5' : isStockOut ? '#fff1f2' : '#f0f9ff' }
                  ]}>
                    {isStockIn && <ArrowDownLeft size={16} color="#10b981" />}
                    {isStockOut && <ArrowUpRight size={16} color="#ef4444" />}
                    {m.type === 'transfer' && <ArrowRightLeft size={16} color="#3b82f6" />}
                  </View>

                  <View style={styles.movementInfo}>
                    <Text style={styles.movementName} numberOfLines={1}>
                      {product?.name ?? 'Unknown Item'}
                    </Text>
                    <Text style={styles.muted} numberOfLines={1}>
                      {isStockIn && `To ${to?.name}`}
                      {isStockOut && `From ${from?.name}`}
                      {m.type === 'transfer' && `${from?.name} → ${to?.name}`}
                    </Text>
                  </View>

                  <View style={styles.movementMeta}>
                    <Text style={[
                      styles.movementQty, 
                      { color: isStockIn ? '#059669' : isStockOut ? '#dc2626' : '#1e293b' }
                    ]}>
                      {isStockIn ? '+' : isStockOut ? '-' : ''}{m.quantity}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Reset App Storage (Dev only) */}
        <View style={styles.devSection}>
          <Pressable 
            style={styles.resetButton} 
            onPress={async () => {
              const { resetOnboarding } = await import('@/lib/onboarding-storage');
              await resetOnboarding();
              // Forcing a reload or navigation back to / can be done via router
              const { router } = await import('expo-router');
              router.replace('/');
            }}
          >
            <Text style={styles.resetButtonText}>Reset Onboarding Flow</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  
  // Professional Background Elements
  blueAura: { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: 'rgba(186, 230, 253, 0.4)', top: -100, right: -100 },
  goldAura: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(254, 243, 199, 0.4)', bottom: -50, left: -100 },
  tealAura: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(204, 251, 241, 0.3)', top: '40%', right: -80 },

  content: { padding: 20, gap: 20 },
  header: { marginBottom: 10 },
  heading: { fontSize: 36, fontWeight: '900', color: '#0f172a', letterSpacing: -1.2 },
  subheading: { fontSize: 16, color: '#64748b', fontWeight: '500' },

  statsRow: { flexDirection: 'row', gap: 16 },
  card: { 
    flex: 1, 
    padding: 20, 
    borderRadius: 24, 
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3
  },
  iconCircle: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardValue: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
  cardLabel: { fontSize: 13, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },

  panel: { 
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    borderRadius: 28, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 15 
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  panelTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },

  movementRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(241, 245, 249, 0.8)' 
  },
  movementIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  movementInfo: { flex: 1 },
  movementName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  movementMeta: { alignItems: 'flex-end' },
  movementQty: { fontSize: 16, fontWeight: '800' },
  dateText: { fontSize: 11, color: '#94a3b8', fontWeight: '700', marginTop: 2 },
  
  muted: { color: '#94a3b8', fontSize: 14, fontWeight: '500' },
  emptyState: { paddingVertical: 30, alignItems: 'center' },
  devSection: { marginTop: 20, marginBottom: 40, alignItems: 'center' },
  resetButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  resetButtonText: { color: '#ef4444', fontWeight: '700', fontSize: 14, letterSpacing: 0.3 },
});