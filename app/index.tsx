import { useRouter } from 'expo-router';
import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react-native';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SERIF_FONT = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
const cubeImage = require('@/assets/images/box.png');
const notebookImage = require('@/assets/images/notebook.png');

function StepCard({
  step,
  title,
  imageSource,
  tone,
}: {
  step: string;
  title: string;
  imageSource: number;
  tone: 'cool' | 'warm';
}) {
  return (
    <View style={[styles.stepCard, tone === 'cool' ? styles.stepCardCool : styles.stepCardWarm]}>
      <View style={styles.stepChip}>
        <Text style={styles.stepChipText}>{step}</Text>
      </View>
      <View style={styles.illustrationShell}>
        <View style={styles.illustrationGlow} />
        <Image source={imageSource} style={styles.illustrationImage} resizeMode="contain" />
      </View>
      <View style={styles.stepFooter}>
        <Text style={styles.stepTitle}>{title}</Text>
      </View>
    </View>
  );
}

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.backdrop}>
        <View style={styles.blueAura} />
        <View style={styles.goldAura} />
        <View style={styles.tealAura} />
      </View>

      <View style={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.topRow}>
            <View style={styles.badge}>
              <Sparkles size={14} color="#111827" />
              <Text style={styles.badgeText}>Fast inventory onboarding</Text>
            </View>
          </View>

          <View style={styles.headlineBlock}>
            <Text style={styles.title}>StockKeeper</Text>
            <Text style={styles.subtitle}>
              Create your first godown, product, and opening stock in a guided setup that feels tidy from the first screen.
            </Text>
          </View>

          <View style={styles.cardsRow}>
            <StepCard
              step="Step 1"
              title="Add godown"
              tone="cool"
              imageSource={cubeImage}
            />
            <StepCard
              step="Step 2"
              title="Create product"
              tone="warm"
              imageSource={notebookImage}
            />
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <View style={styles.stepChip}>
                <Text style={styles.stepChipText}>Step 3</Text>
              </View>
              <Text style={styles.summaryTitle}>Start maintaining stock instantly.</Text>
              <Text style={styles.summaryText}>
                We&apos;ll take you into the stock screen with your first setup already saved.
              </Text>
            </View>
            <View style={styles.calendarOrb}>
              <CalendarDays size={34} color="#2b6cb0" strokeWidth={2} />
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryBtn} onPress={() => router.push('/setup')}>
            <Text style={styles.primaryBtnText}>Start onboarding</Text>
            <ArrowRight size={20} color="#ffffff" />
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
  container: { flex: 1, backgroundColor: '#f5f1e8' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f5f1e8',
  },
  blueAura: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(137, 207, 240, 0.42)',
    top: -20,
    right: -70,
  },
  goldAura: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 214, 140, 0.35)',
    bottom: 70,
    left: -80,
  },
  tealAura: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(141, 211, 199, 0.22)',
    bottom: 170,
    right: -50,
  },
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 16, gap: 16 },
  heroCard: {
    flex: 1,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    backgroundColor: 'rgba(255,250,242,0.58)',
    padding: 20,
    gap: 18,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  topRow: { alignItems: 'flex-start' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(222, 212, 192, 0.9)',
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#111827' },
  headlineBlock: { gap: 10, paddingTop: 4 },
  title: {
    fontFamily: SERIF_FONT,
    fontSize: 38,
    lineHeight: 44,
    color: '#111827',
    fontWeight: '700',
    letterSpacing: -1.1,
  },
  subtitle: {
    maxWidth: '86%',
    fontSize: 15,
    lineHeight: 23,
    color: '#1f2937',
  },
  cardsRow: { flexDirection: 'row', gap: 14 },
  stepCard: {
    flex: 1,
    borderRadius: 24,
    padding: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
  },
  stepCardCool: { backgroundColor: 'rgba(213, 236, 243, 0.5)' },
  stepCardWarm: { backgroundColor: 'rgba(255, 237, 205, 0.52)' },
  stepChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(230, 221, 203, 0.9)',
  },
  stepChipText: { fontSize: 11, fontWeight: '700', color: '#111827' },
  illustrationShell: {
    flex: 1,
    minHeight: 124,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  illustrationGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  illustrationImage: {
    width: 118,
    height: 118,
  },
  stepFooter: { gap: 4 },
  stepTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  summaryCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(247, 250, 250, 0.58)',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.72)',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 146,
  },
  summaryContent: { flex: 1, gap: 8 },
  summaryTitle: { fontSize: 18, lineHeight: 24, fontWeight: '800', color: '#111827' },
  summaryText: { fontSize: 14, lineHeight: 21, color: '#374151' },
  calendarOrb: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(221,230,238,0.9)',
  },
  actions: { gap: 12 },
  primaryBtn: {
    minHeight: 62,
    borderRadius: 999,
    backgroundColor: '#0b6aa8',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#0b6aa8',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  primaryBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  secondaryBtn: {
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { color: '#6b7280', fontSize: 16, fontWeight: '500' },
});
