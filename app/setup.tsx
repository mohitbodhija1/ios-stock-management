import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Boxes, Building2, ChartColumnBig, CheckCircle2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View, Animated as RNAnimated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInventory } from '@/context/inventory-context';

type SetupStep = 0 | 1 | 2;

export default function SetupScreen() {
  const router = useRouter();
  const { addGodown, addProduct, addStockIn } = useInventory();

  const [step, setStep] = useState<SetupStep>(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Form State
  const [godownName, setGodownName] = useState('');
  const [godownLocation, setGodownLocation] = useState('');
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('Pieces');
  const [category, setCategory] = useState('');
  const [openingQty, setOpeningQty] = useState('');
  const [error, setError] = useState('');

  const stepMeta = useMemo(() => [
    { title: 'Setup Warehouse', subtitle: 'Where is your inventory stored?', icon: Building2, tone: '#2563eb' },
    { title: 'First Product', subtitle: 'What are you tracking today?', icon: Boxes, tone: '#7c3aed' },
    { title: 'Inventory Start', subtitle: 'Set your initial stock levels.', icon: ChartColumnBig, tone: '#059669' },
  ], []);

  const current = stepMeta[step];
  const CurrentIcon = current.icon;

  const goNext = () => {
    if (step === 0) {
      if (!godownName.trim()) return setError('Warehouse name is required');
      setError(''); setStep(1);
    } else if (step === 1) {
      if (!productName.trim() || !sku.trim()) return setError('Name and SKU are required');
      setError(''); setStep(2);
    }
  };

  const finishSetup = async () => {
    const qty = Number(openingQty);
    if (!Number.isFinite(qty) || qty <= 0) return setError('Invalid quantity');
    try {
      const gId = await addGodown({ name: godownName.trim(), location: godownLocation.trim() });
      const pId = await addProduct({ name: productName.trim(), sku: sku.trim(), unit: unit.trim() || 'Pieces', category: category.trim() });
      await addStockIn(pId, gId, qty, 'Initial Setup');
      router.replace('/(tabs)/stock');
    } catch (err: any) {
      setError(err.message || 'Setup failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          {/* Top Navigation */}
          <View style={styles.navHeader}>
            <Pressable style={styles.backBtn} onPress={() => step === 0 ? router.back() : setStep((step - 1) as SetupStep)}>
              <ArrowLeft size={22} color="#1e293b" />
            </Pressable>
            <View style={styles.progressContainer}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.progressBar, i <= step && { backgroundColor: current.tone }, i < step && { opacity: 0.5 }]} />
              ))}
            </View>
            <View style={{ width: 40 }} /> 
          </View>

          {/* Header Section */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: current.tone + '15' }]}>
              <CurrentIcon size={28} color={current.tone} />
            </View>
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.subtitle}>{current.subtitle}</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formArea}>
            {step === 0 && (
              <View style={styles.inputGroup}>
                <CustomInput label="Warehouse Name" placeholder="e.g. North Side Hub" value={godownName} onChange={setGodownName} onFocus={() => setFocusedField('gn')} isFocused={focusedField === 'gn'} />
                <CustomInput label="Location" placeholder="e.g. New Delhi, IN" value={godownLocation} onChange={setGodownLocation} onFocus={() => setFocusedField('gl')} isFocused={focusedField === 'gl'} />
              </View>
            )}

            {step === 1 && (
              <View style={styles.inputGroup}>
                <CustomInput label="Product Name" placeholder="e.g. Wireless Mouse" value={productName} onChange={setProductName} onFocus={() => setFocusedField('pn')} isFocused={focusedField === 'pn'} />
                <CustomInput label="SKU / ID" placeholder="e.g. WM-001" value={sku} onChange={setSku} onFocus={() => setFocusedField('sku')} isFocused={focusedField === 'sku'} />
                <View style={styles.row}>
                  <View style={{ flex: 1 }}><CustomInput label="Unit" placeholder="Pcs" value={unit} onChange={setUnit} onFocus={() => setFocusedField('ut')} isFocused={focusedField === 'ut'} /></View>
                  <View style={{ flex: 1 }}><CustomInput label="Category" placeholder="Tech" value={category} onChange={setCategory} onFocus={() => setFocusedField('ct')} isFocused={focusedField === 'ct'} /></View>
                </View>
              </View>
            )}

            {step === 2 && (
              <View style={styles.inputGroup}>
                <View style={styles.summaryCard}>
                  <SummaryRow label="Storing in" value={godownName} />
                  <SummaryRow label="Item" value={productName} />
                  <SummaryRow label="SKU" value={sku} />
                </View>
                <CustomInput label="Opening Quantity" placeholder="0.00" value={openingQty} onChange={setOpeningQty} keyboardType="numeric" onFocus={() => setFocusedField('qty')} isFocused={focusedField === 'qty'} />
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Pressable style={[styles.mainBtn, { backgroundColor: current.tone }]} onPress={step === 2 ? finishSetup : goNext}>
              <Text style={styles.mainBtnText}>{step === 2 ? 'Complete Setup' : 'Next Step'}</Text>
              <ArrowRight size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Sub-components for cleaner UI
const CustomInput = ({ label, isFocused, ...props }: any) => (
  <View style={styles.inputWrapper}>
    <Text style={[styles.inputLabel, isFocused && { color: '#2563eb' }]}>{label}</Text>
    <TextInput {...props} style={[styles.input, isFocused && styles.inputFocused]} placeholderTextColor="#94a3b8" onBlur={() => props.onFocus(null)} />
  </View>
);

const SummaryRow = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
  progressContainer: { flexDirection: 'row', gap: 6, flex: 1, paddingHorizontal: 20 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0' },
  header: { marginTop: 20, marginBottom: 32 },
  iconCircle: { width: 64, height: 64, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 4 },
  formArea: { flex: 1 },
  inputGroup: { gap: 20 },
  inputWrapper: { gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginLeft: 4 },
  input: { height: 56, backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, fontSize: 16, color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0' },
  inputFocused: { borderColor: '#2563eb', backgroundColor: '#fff', shadowColor: '#2563eb', shadowOpacity: 0.1, shadowRadius: 8 },
  row: { flexDirection: 'row', gap: 12 },
  summaryCard: { backgroundColor: '#f8fafc', borderRadius: 20, padding: 20, gap: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: '#64748b', fontSize: 14 },
  summaryValue: { fontWeight: '700', color: '#0f172a', fontSize: 14 },
  footer: { paddingVertical: 24, gap: 16 },
  mainBtn: { height: 64, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  errorText: { color: '#ef4444', textAlign: 'center', fontWeight: '600' }
});