import { ArrowLeft, Check } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const productImage = require('@/assets/images/notebook.png');

export type ProductDraft = { name: string; sku: string; unit: string };

type Props = {
  initial: ProductDraft;
  onNext: (draft: ProductDraft) => void;
  onBack: () => void;
};

export function OnboardingProductStep({ initial, onNext, onBack }: Props) {
  const [productName, setProductName] = useState(initial.name);
  const [sku, setSku] = useState(initial.sku);
  const [unit, setUnit] = useState(initial.unit);
  const [showCheck, setShowCheck] = useState(false);
  const scale = useState(() => new Animated.Value(0))[0];

  const runCheck = () => {
    if (!productName.trim() || !sku.trim()) return;
    setShowCheck(true);
    scale.setValue(0);
    Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    setTimeout(() => {
      setShowCheck(false);
      onNext({
        name: productName.trim(),
        sku: sku.trim(),
        unit: unit.trim() || 'Pieces',
      });
    }, 720);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.progressSpacer} />
        <View style={styles.nav}>
          <Pressable style={styles.navBtn} onPress={onBack} hitSlop={12}>
            <ArrowLeft size={22} color="#0f172a" />
          </Pressable>
          <Text style={styles.navTitle}>Add Product</Text>
          <View style={{ width: 40 }} />
        </View>

        <Modal visible={showCheck} transparent animationType="fade">
          <View style={styles.overlay}>
            <Animated.View
              style={[
                styles.checkCircle,
                {
                  transform: [{ scale: scale.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }],
                },
              ]}>
              <Check size={40} color="#fff" strokeWidth={3} />
            </Animated.View>
          </View>
        </Modal>

        <View style={styles.illustrationWrap}>
          <Image source={productImage} style={styles.illustration} resizeMode="contain" />
        </View>

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Add Your First Product.</Text>
          <Text style={styles.sheetDesc}>
            Enter the product details below. You can scan barcodes later in the app.
          </Text>

          <TextInput
            value={productName}
            onChangeText={setProductName}
            placeholder="Product Name"
            placeholderTextColor="#94a3b8"
            style={[styles.input, { marginBottom: 12 }]}
          />
          <View style={styles.row}>
            <TextInput
              value={sku}
              onChangeText={setSku}
              placeholder="SKU"
              placeholderTextColor="#94a3b8"
              style={[styles.input, styles.flex1]}
            />
            <TextInput
              value={unit}
              onChangeText={setUnit}
              placeholder="Unit (e.g., pcs)"
              placeholderTextColor="#94a3b8"
              style={[styles.input, styles.flex1]}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.cta,
              (!productName.trim() || !sku.trim() || pressed) && {
                opacity: productName.trim() && sku.trim() ? 0.92 : 0.4,
              },
            ]}
            disabled={!productName.trim() || !sku.trim()}
            onPress={runCheck}>
            <Text style={styles.ctaText}>Add Product</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f1f5f9' },
  flex: { flex: 1 },
  progressSpacer: { height: 22 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  navBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  illustrationWrap: { alignItems: 'center', paddingTop: 12 },
  illustration: { width: 160, height: 160 },
  sheet: {
    flex: 1,
    marginTop: 8,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  sheetDesc: { fontSize: 14, color: '#64748b', lineHeight: 21, marginBottom: 18 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  flex1: { flex: 1 },
  input: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
    color: '#0f172a',
  },
  cta: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
