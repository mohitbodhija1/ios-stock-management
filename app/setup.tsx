import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Boxes, Building2, ChartColumnBig } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useInventory } from '@/context/inventory-context';

type SetupStep = 0 | 1 | 2;

export default function SetupScreen() {
  const router = useRouter();
  const { addGodown, addProduct, addStockIn } = useInventory();

  const [step, setStep] = useState<SetupStep>(0);
  const [godownName, setGodownName] = useState('');
  const [godownLocation, setGodownLocation] = useState('');
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('Pieces');
  const [category, setCategory] = useState('');
  const [openingQty, setOpeningQty] = useState('');
  const [error, setError] = useState('');

  const stepMeta = useMemo(
    () => [
      { title: 'Add your first godown', subtitle: 'Give your warehouse a clear name and location.', icon: Building2, tone: '#1473e6' },
      { title: 'Create your first product', subtitle: 'Set the catalog basics your team will recognize instantly.', icon: Boxes, tone: '#dd6b20' },
      { title: 'Set opening stock', subtitle: 'This quantity becomes your first recorded stock movement.', icon: ChartColumnBig, tone: '#0f766e' },
    ],
    []
  );

  const current = stepMeta[step];
  const CurrentIcon = current.icon;

  const goNext = () => {
    if (step === 0) {
      if (!godownName.trim()) {
        setError('Enter a godown name to continue.');
        return;
      }
      setError('');
      setStep(1);
      return;
    }

    if (step === 1) {
      if (!productName.trim() || !sku.trim()) {
        setError('Enter a product name and SKU to continue.');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const finishSetup = () => {
    const qty = Number(openingQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Enter a valid opening quantity.');
      return;
    }

    const godownId = addGodown({
      name: godownName.trim(),
      location: godownLocation.trim(),
    });

    const productId = addProduct({
      name: productName.trim(),
      sku: sku.trim(),
      unit: unit.trim() || 'Pieces',
      category: category.trim(),
    });

    addStockIn(productId, godownId, qty, 'Opening stock from onboarding');
    router.replace('/(tabs)/stock');
  };

  const goBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    setError('');
    setStep((step - 1) as SetupStep);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Pressable style={styles.backBtn} onPress={goBack}>
            <ArrowLeft size={18} color="#0f172a" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.progressRow}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === step && styles.progressDotActive,
                  index < step && styles.progressDotDone,
                ]}
              />
            ))}
          </View>

          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: current.tone }]}>
              <CurrentIcon size={20} color="#ffffff" />
            </View>
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.subtitle}>{current.subtitle}</Text>
          </View>

          <View style={styles.card}>
            {step === 0 ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Main Warehouse"
                  placeholderTextColor="#94a3b8"
                  value={godownName}
                  onChangeText={setGodownName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Industrial Area, Sector 5"
                  placeholderTextColor="#94a3b8"
                  value={godownLocation}
                  onChangeText={setGodownLocation}
                />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="TMT Steel Bar 12mm"
                  placeholderTextColor="#94a3b8"
                  value={productName}
                  onChangeText={setProductName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="STL-12"
                  placeholderTextColor="#94a3b8"
                  value={sku}
                  onChangeText={setSku}
                />
                <View style={styles.inlineRow}>
                  <TextInput
                    style={[styles.input, styles.inlineInput]}
                    placeholder="Pieces"
                    placeholderTextColor="#94a3b8"
                    value={unit}
                    onChangeText={setUnit}
                  />
                  <TextInput
                    style={[styles.input, styles.inlineInput]}
                    placeholder="Steel"
                    placeholderTextColor="#94a3b8"
                    value={category}
                    onChangeText={setCategory}
                  />
                </View>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <View style={styles.reviewCard}>
                  <Text style={styles.reviewLabel}>Godown</Text>
                  <Text style={styles.reviewValue}>{godownName}</Text>
                  <Text style={styles.reviewMeta}>{godownLocation || 'No location added'}</Text>
                </View>

                <View style={styles.reviewCard}>
                  <Text style={styles.reviewLabel}>Product</Text>
                  <Text style={styles.reviewValue}>{productName}</Text>
                  <Text style={styles.reviewMeta}>
                    {sku} • {unit || 'Pieces'} • {category || 'No category'}
                  </Text>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="1000"
                  placeholderTextColor="#94a3b8"
                  value={openingQty}
                  onChangeText={setOpeningQty}
                  keyboardType="numeric"
                />
              </>
            ) : null}
          </View>

          <View style={styles.footer}>
            {error ? <Text style={styles.error}>{error}</Text> : <View style={styles.errorSpacer} />}
            <Pressable style={styles.primaryBtn} onPress={step === 2 ? finishSetup : goNext}>
              <Text style={styles.primaryBtnText}>{step === 2 ? 'Create setup and continue' : 'Continue'}</Text>
              <ArrowRight size={18} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8ef' },
  flex: { flex: 1 },
  content: { flex: 1, padding: 20, gap: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  backText: { color: '#0f172a', fontWeight: '700' },
  progressRow: { flexDirection: 'row', gap: 8 },
  progressDot: { flex: 1, height: 8, borderRadius: 999, backgroundColor: '#eadfd0' },
  progressDotActive: { backgroundColor: '#1473e6' },
  progressDotDone: { backgroundColor: '#7db4f1' },
  header: { gap: 10 },
  headerIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '900', color: '#0f172a', letterSpacing: -0.9 },
  subtitle: { fontSize: 15, lineHeight: 22, color: '#64748b' },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: '#efdfca',
    gap: 12,
    justifyContent: 'center',
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5dccf',
    backgroundColor: '#fcfaf7',
    paddingHorizontal: 15,
    color: '#0f172a',
    fontSize: 15,
  },
  inlineRow: { flexDirection: 'row', gap: 12 },
  inlineInput: { flex: 1 },
  reviewCard: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  reviewLabel: { fontSize: 12, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 },
  reviewValue: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  reviewMeta: { fontSize: 13, color: '#475569' },
  footer: { gap: 10 },
  error: { color: '#dc2626', fontSize: 13, fontWeight: '700' },
  errorSpacer: { height: 18 },
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
