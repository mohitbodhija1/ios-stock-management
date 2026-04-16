import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useInventory } from '@/context/inventory-context';
import { setOnboardingComplete } from '@/lib/onboarding-storage';

import { OnboardingGodownStep } from './onboarding-godown-step';
import { OnboardingPaywallStep } from './onboarding-paywall-step';
import type { ProductDraft } from './onboarding-product-step';
import { OnboardingProductStep } from './onboarding-product-step';
import { OnboardingQuantityStep } from './onboarding-quantity-step';
import { OnboardingWelcomeStep } from './onboarding-welcome-step';

type Step = 'welcome' | 'godown' | 'product' | 'quantity' | 'paywall';

const PROGRESS_STEPS: Step[] = ['welcome', 'godown', 'product', 'quantity'];

export default function OnboardingFlow() {
  const router = useRouter();
  const { addGodown, addProduct, addStockIn } = useInventory();

  const [step, setStep] = useState<Step>('welcome');
  const [godownName, setGodownName] = useState('');
  const [godownLocation, setGodownLocation] = useState('');
  const [product, setProduct] = useState<ProductDraft>({ name: '', sku: '', unit: '' });
  const [openingQty, setOpeningQty] = useState('');
  const [movementNotes, setMovementNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const skipToApp = useCallback(async () => {
    await setOnboardingComplete(true);
    router.replace('/(tabs)/stock');
  }, [router]);

  const finalizeAndEnterApp = useCallback(async () => {
    const qty = Number(openingQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      Alert.alert('Missing quantity', 'Go back and enter a valid opening quantity.');
      return;
    }
    setSubmitting(true);
    try {
      const gId = await addGodown({ name: godownName, location: godownLocation });
      const pId = await addProduct({
        name: product.name,
        sku: product.sku,
        unit: product.unit || 'Pieces',
        category: '',
      });
      const note = movementNotes.trim() || 'Initial setup';
      await addStockIn(pId, gId, qty, note);
      await setOnboardingComplete(true);
      router.replace('/(tabs)/stock');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Setup failed';
      Alert.alert('Could not save', message);
    } finally {
      setSubmitting(false);
    }
  }, [
    addGodown,
    addProduct,
    addStockIn,
    godownLocation,
    godownName,
    movementNotes,
    openingQty,
    product.name,
    product.sku,
    product.unit,
    router,
  ]);

  const progressIndex = PROGRESS_STEPS.indexOf(step);
  const showProgress = step !== 'paywall';

  return (
    <View style={styles.root}>
      {showProgress ? (
        <SafeAreaView edges={['top']} style={styles.progressSafe}>
          <View style={styles.progressRow}>
            {PROGRESS_STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i <= progressIndex ? styles.dotActive : styles.dotInactive,
                  i <= progressIndex ? { width: 22 } : { width: 6 },
                ]}
              />
            ))}
          </View>
          {step !== 'welcome' ? (
            <Pressable style={styles.skipTop} onPress={skipToApp} hitSlop={12}>
              <Text style={styles.skipTopText}>Skip</Text>
            </Pressable>
          ) : null}
        </SafeAreaView>
      ) : null}

      <View style={styles.flex}>
        {step === 'welcome' ? (
          <OnboardingWelcomeStep onNext={() => setStep('godown')} onSkip={skipToApp} />
        ) : null}

        {step === 'godown' ? (
          <OnboardingGodownStep
            initialName={godownName}
            initialLocation={godownLocation}
            onBack={() => setStep('welcome')}
            onNext={(name, location) => {
              setGodownName(name);
              setGodownLocation(location);
              setStep('product');
            }}
          />
        ) : null}

        {step === 'product' ? (
          <OnboardingProductStep
            initial={product}
            onBack={() => setStep('godown')}
            onNext={(draft) => {
              setProduct(draft);
              setStep('quantity');
            }}
          />
        ) : null}

        {step === 'quantity' ? (
          <OnboardingQuantityStep
            godownName={godownName}
            product={product}
            initialQty={openingQty}
            initialNotes={movementNotes}
            onBack={() => setStep('product')}
            onNext={(qty, notes) => {
              setOpeningQty(String(qty));
              setMovementNotes(notes);
              setStep('paywall');
            }}
          />
        ) : null}

        {step === 'paywall' ? (
          <View style={styles.flex}>
            <OnboardingPaywallStep onClose={() => void finalizeAndEnterApp()} />
            {submitting ? (
              <View style={styles.blocking}>
                <Text style={styles.blockingText}>Saving your workspace…</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fafafa' },
  flex: { flex: 1 },
  progressSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 8,
    pointerEvents: 'box-none',
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { height: 6, borderRadius: 3, backgroundColor: '#cbd5e1' },
  dotActive: { backgroundColor: '#0f172a' },
  dotInactive: { backgroundColor: 'rgba(100,116,139,0.28)' },
  skipTop: { position: 'absolute', right: 16, top: 8, paddingVertical: 6, paddingHorizontal: 4 },
  skipTopText: { fontSize: 15, fontWeight: '700', color: '#64748b' },
  blocking: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockingText: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
});
