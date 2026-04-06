import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Boxes, Building2, ChartColumnBig, Check } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const steps = [
  { title: 'Add godown', icon: Building2, tone: '#1473e6' },
  { title: 'Create product', icon: Boxes, tone: '#dd6b20' },
  { title: 'Set opening stock', icon: ChartColumnBig, tone: '#0f766e' },
];

export default function GetStartedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#0f172a" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Get started</Text>
          <Text style={styles.title}>A compact setup flow with zero scrolling.</Text>
          <Text style={styles.subtitle}>
            We’ve broken onboarding into short screens so everything stays visible and easy to complete.
          </Text>
        </View>

        <View style={styles.timeline}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <View key={step.title} style={styles.stepCard}>
                <View style={[styles.stepIcon, { backgroundColor: step.tone }]}>
                  <Icon size={18} color="#ffffff" />
                </View>
                <View style={styles.stepCopy}>
                  <Text style={styles.stepIndex}>0{index + 1}</Text>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.promiseCard}>
          <View style={styles.promiseRow}>
            <Check size={16} color="#1473e6" />
            <Text style={styles.promiseText}>Every onboarding screen fits without vertical scroll</Text>
          </View>
          <View style={styles.promiseRow}>
            <Check size={16} color="#1473e6" />
            <Text style={styles.promiseText}>You finish with live stock already recorded</Text>
          </View>
          <View style={styles.promiseRow}>
            <Check size={16} color="#1473e6" />
            <Text style={styles.promiseText}>The app opens directly into stock management</Text>
          </View>
        </View>

        <Pressable style={styles.primaryBtn} onPress={() => router.push('/setup')}>
          <Text style={styles.primaryBtnText}>Continue setup</Text>
          <ArrowRight size={18} color="#ffffff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f7fb' },
  content: { flex: 1, padding: 20, gap: 18 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  backText: { color: '#0f172a', fontWeight: '700' },
  header: { gap: 10 },
  eyebrow: { color: '#1473e6', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.1 },
  title: { fontSize: 32, lineHeight: 38, fontWeight: '900', color: '#0f172a', letterSpacing: -1 },
  subtitle: { fontSize: 15, lineHeight: 22, color: '#64748b' },
  timeline: { gap: 12 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dce6f2',
  },
  stepIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepCopy: { gap: 2 },
  stepIndex: { color: '#64748b', fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  stepTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  promiseCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 28,
    padding: 20,
    justifyContent: 'center',
    gap: 14,
  },
  promiseRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  promiseText: { color: '#dbeafe', fontSize: 14, lineHeight: 20, flex: 1 },
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
});
