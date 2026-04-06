import { useRouter } from 'expo-router';
import { ArrowRight, Boxes, Building2, Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.orbLarge} />
          <View style={styles.orbSmall} />

          <View style={styles.topBlock}>
            <View style={styles.badge}>
              <Sparkles size={14} color="#0f172a" />
              <Text style={styles.badgeText}>Fast inventory onboarding</Text>
            </View>

            <View style={styles.copy}>
              <Text style={styles.title}>StockKeeper</Text>
              <Text style={styles.subtitle}>
                Create your first godown, product, and opening stock in a guided setup that feels tidy from the first screen.
              </Text>
            </View>
          </View>

          <View style={styles.featureStack}>
            <View style={styles.stepRow}>
              <View style={styles.stepCard}>
                <Building2 size={18} color="#1473e6" />
                <Text style={styles.stepEyebrow}>Step 1</Text>
                <Text style={styles.stepLabel}>Add godown</Text>
              </View>
              <View style={styles.stepCardDark}>
                <Boxes size={18} color="#ffffff" />
                <Text style={styles.stepEyebrowDark}>Step 2</Text>
                <Text style={styles.stepLabelDark}>Create product</Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryEyebrow}>Step 3</Text>
              <Text style={styles.summaryTitle}>Start maintaining stock instantly.</Text>
              <Text style={styles.summaryText}>We’ll take you into the stock screen with your first setup already saved.</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.primaryBtn} onPress={() => router.push('/get-started')}>
            <Text style={styles.primaryBtnText}>Start onboarding</Text>
            <ArrowRight size={18} color="#ffffff" />
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.secondaryBtnText}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f4ee' },
  content: { flex: 1, padding: 20, gap: 16 },
  hero: {
    flex: 1,
    backgroundColor: '#fffaf2',
    borderRadius: 30,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eedfca',
    gap: 22,
  },
  orbLarge: {
    position: 'absolute',
    width: 208,
    height: 208,
    borderRadius: 104,
    backgroundColor: '#c8e6ff',
    top: -56,
    right: -48,
  },
  orbSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffd89e',
    bottom: -30,
    left: -22,
  },
  topBlock: { gap: 24 },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#eadfce',
  },
  badgeText: { color: '#334155', fontSize: 12, fontWeight: '700' },
  copy: { gap: 14, paddingRight: 92 },
  title: { fontSize: 40, lineHeight: 44, fontWeight: '900', color: '#0f172a', letterSpacing: -1.1 },
  subtitle: { fontSize: 15, lineHeight: 23, color: '#475569' },
  featureStack: { marginTop: 'auto', gap: 14 },
  stepRow: { flexDirection: 'row', gap: 10 },
  stepCard: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: '#ece4d7',
    gap: 8,
  },
  stepCardDark: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
    backgroundColor: '#0f172a',
    gap: 8,
  },
  stepEyebrow: { color: '#64748b', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  stepEyebrowDark: { color: '#93c5fd', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  stepLabel: { color: '#0f172a', fontSize: 17, fontWeight: '800' },
  stepLabelDark: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  summaryCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: '#f4ecdf',
    borderWidth: 1,
    borderColor: '#ebdcc4',
    gap: 6,
  },
  summaryEyebrow: { color: '#64748b', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  summaryTitle: { color: '#0f172a', fontSize: 18, fontWeight: '800', lineHeight: 24 },
  summaryText: { color: '#475569', fontSize: 13, lineHeight: 20 },
  footer: { gap: 12 },
  primaryBtn: {
    backgroundColor: '#1473e6',
    borderRadius: 22,
    minHeight: 58,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  secondaryBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e6ddd0',
  },
  secondaryBtnText: { color: '#0f172a', fontSize: 15, fontWeight: '700' },
});
