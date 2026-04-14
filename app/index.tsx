import { useRouter } from 'expo-router';
import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react-native';
import { Image, Platform, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
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
      <View style={styles.stepHeader}>
        <View style={styles.stepChip}>
          <Text style={styles.stepChipText}>{step}</Text>
        </View>
      </View>
      <View style={styles.illustrationShell}>
        <View style={styles.illustrationGlow} />
        <Image source={imageSource} style={styles.illustrationImage} resizeMode="contain" />
      </View>
      <Text style={styles.stepTitle}>{title}</Text>
    </View>
  );
}

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Dynamic Background Auras */}
      <View style={styles.backdrop}>
        <View style={styles.blueAura} />
        <View style={styles.goldAura} />
        <View style={styles.tealAura} />
      </View>

      <View style={styles.content}>
        {/* Main Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.badge}>
            <Sparkles size={14} color="#2563eb" />
            <Text style={styles.badgeText}>Onboarding Guided by AI</Text>
          </View>

          <View style={styles.headlineBlock}>
            <Text style={styles.title}>StockKeeper</Text>
            <Text style={styles.subtitle}>
              Master your inventory with a guided setup designed for clarity and speed.
            </Text>
          </View>

          <View style={styles.cardsRow}>
            <StepCard
              step="01"
              title="Add Godown"
              tone="cool"
              imageSource={cubeImage}
            />
            <StepCard
              step="02"
              title="New Product"
              tone="warm"
              imageSource={notebookImage}
            />
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <View style={[styles.stepChip, { backgroundColor: '#ffffff', marginBottom: 8 }]}>
                <Text style={styles.stepChipText}>03</Text>
              </View>
              <Text style={styles.summaryTitle}>Go Live</Text>
              <Text style={styles.summaryText}>
                Your first batch is ready. Start tracking movements instantly.
              </Text>
            </View>
            <View style={styles.calendarOrb}>
              <CalendarDays size={32} color="#0b6aa8" strokeWidth={1.5} />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable 
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]} 
            onPress={() => router.push('/setup')}
          >
            <Text style={styles.primaryBtnText}>Start Onboarding</Text>
            <ArrowRight size={20} color="#ffffff" />
          </Pressable>

          <Pressable 
             style={({ pressed }) => [styles.secondaryBtn, pressed && { backgroundColor: 'rgba(255,255,255,0.6)' }]} 
             onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.secondaryBtnText}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  backdrop: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  blueAura: { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: '#E0F2FE', top: -100, right: -100, opacity: 0.6 },
  goldAura: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#FEF3C7', bottom: -50, left: -100, opacity: 0.5 },
  tealAura: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#F0FDFA', top: '40%', right: -50, opacity: 0.4 },
  
  content: { flex: 1, paddingHorizontal: 20, paddingVertical: 20, gap: 20 },
  
  heroCard: {
    flex: 1,
    borderRadius: 36,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#1E293B', letterSpacing: 0.2 },
  
  headlineBlock: { marginBottom: 24 },
  title: { fontFamily: SERIF_FONT, fontSize: 42, fontWeight: '800', color: '#0F172A', letterSpacing: -1.5, marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 24, color: '#475569', maxWidth: '90%' },
  
  cardsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  stepCard: {
    flex: 1,
    padding: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  stepCardCool: { backgroundColor: '#F0F9FF' },
  stepCardWarm: { backgroundColor: '#FFFBEB' },
  stepHeader: { marginBottom: 12 },
  stepChip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: '#E2E8F0' },
  stepChipText: { fontSize: 12, fontWeight: '800', color: '#1E293B' },
  
  illustrationShell: { height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  illustrationGlow: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', opacity: 0.5 },
  illustrationImage: { width: 80, height: 80 },
  stepTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
  
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    gap: 16,
  },
  summaryContent: { flex: 1 },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  summaryText: { fontSize: 14, color: '#64748B', lineHeight: 20 },
  calendarOrb: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  
  actions: { gap: 12, paddingBottom: 10 },
  primaryBtn: { height: 64, borderRadius: 22, backgroundColor: '#0F172A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#0F172A', shadowOpacity: 0.2, shadowRadius: 15, shadowOffset: { width: 0, height: 5 } },
  primaryBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  secondaryBtn: { height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWeight: 1, borderColor: '#E2E8F0' },
  secondaryBtnText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
});