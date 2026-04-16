import * as Haptics from 'expo-haptics';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ProductDraft } from './onboarding-product-step';

const quantityImage = require('@/assets/images/box.png');

const QTY_KEYBOARD_ACCESSORY_ID = 'onboarding-qty-decimal-accessory';

type Props = {
  godownName: string;
  product: ProductDraft;
  initialQty: string;
  initialNotes: string;
  onNext: (qty: number, notes: string) => void;
  onBack: () => void;
};

export function OnboardingQuantityStep({
  godownName,
  product,
  initialQty,
  initialNotes,
  onNext,
  onBack,
}: Props) {
  const [quantity, setQuantity] = useState(initialQty);
  const [notes, setNotes] = useState(initialNotes);
  const [showCheck, setShowCheck] = useState(false);
  const [done, setDone] = useState(false);
  const [actionLabel, setActionLabel] = useState<'in' | 'out' | null>(null);
  const scale = useState(() => new Animated.Value(0))[0];
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const dismissKeyboardWithAccessoryFeedback = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
  };

  const playCheck = (label: 'in' | 'out', then: () => void) => {
    setActionLabel(label);
    setShowCheck(true);
    scale.setValue(0);
    Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    setTimeout(() => {
      setShowCheck(false);
      then();
    }, 850);
  };

  const handleIn = () => {
    const q = Number(quantity.trim());
    if (!Number.isFinite(q) || q <= 0) return;
    playCheck('in', () => {
      setDone(true);
    });
  };

  const handleOut = () => {
    Alert.alert(
      'Stock Out',
      'For your opening balance, use Stock In. You can record stock out later from the Movements tab once you have inventory.',
    );
  };

  const finish = () => {
    const q = Number(quantity.trim());
    if (!Number.isFinite(q) || q <= 0) return;
    onNext(q, notes.trim());
  };

  const qtyOk = Number.isFinite(Number(quantity.trim())) && Number(quantity.trim()) > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {Platform.OS === 'ios' ? (
        <InputAccessoryView nativeID={QTY_KEYBOARD_ACCESSORY_ID}>
          <View style={styles.accessoryBar}>
            <Pressable
              onPress={dismissKeyboardWithAccessoryFeedback}
              style={styles.accessoryDoneHit}
              hitSlop={12}>
              <Text style={styles.accessoryDoneText}>Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <View style={styles.progressSpacer} />
        <View style={styles.nav}>
          <Pressable style={styles.navBtn} onPress={onBack} hitSlop={12}>
            <ArrowLeft size={22} color="#0f172a" />
          </Pressable>
          <Text style={styles.navTitle}>Update Stock</Text>
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

        {!done ? (
          <>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              showsVerticalScrollIndicator={false}>
              <View style={styles.body}>
                <View style={styles.illustrationWrap}>
                  <Image source={quantityImage} style={styles.illustration} resizeMode="contain" />
                </View>

                <View style={styles.productHeader}>
                  <View style={styles.productIcon}>
                    <Text style={styles.productEmoji}>📦</Text>
                  </View>
                  <View>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productMeta}>
                      SKU: {product.sku} · Unit: {product.unit}
                    </Text>
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Quick Update</Text>
                  <View style={styles.totalRow}>
                    <Text style={styles.muted}>Total stock:</Text>
                    <Text style={styles.totalVal}>—</Text>
                  </View>

                  <Text style={styles.fieldLabel}>Godown</Text>
                  <View style={styles.godownPill}>
                    <Text style={styles.godownPillText}>{godownName}</Text>
                  </View>

                  <Text style={styles.fieldLabel}>Quantity</Text>
                  <TextInput
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="Enter quantity"
                    placeholderTextColor="#94a3b8"
                    keyboardType="decimal-pad"
                    inputAccessoryViewID={Platform.OS === 'ios' ? QTY_KEYBOARD_ACCESSORY_ID : undefined}
                    style={styles.input}
                  />

                  <Text style={styles.fieldLabel}>Notes (optional)</Text>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Reason or reference"
                    placeholderTextColor="#94a3b8"
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={dismissKeyboard}
                    style={styles.input}
                  />

                  <View style={styles.actions}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.btnIn,
                        pressed && { opacity: 0.9 },
                        !qtyOk && { opacity: 0.4 },
                      ]}
                      disabled={!qtyOk}
                      onPress={() => {
                        dismissKeyboard();
                        handleIn();
                      }}>
                      <Text style={styles.btnInText}>Stock In</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.btnOut,
                        pressed && { opacity: 0.9 },
                        !qtyOk && { opacity: 0.4 },
                      ]}
                      disabled={!qtyOk}
                      onPress={() => {
                        dismissKeyboard();
                        handleOut();
                      }}>
                      <Text style={styles.btnOutText}>Stock Out</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </ScrollView>

            {Platform.OS === 'android' && keyboardHeight > 0 ? (
              <View style={[styles.androidAccessory, { bottom: keyboardHeight }]}>
                <Pressable onPress={dismissKeyboardWithAccessoryFeedback} style={styles.androidAccessoryBtn}>
                  <Text style={styles.androidAccessoryText}>Done</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.doneWrap}>
            <View style={styles.celebrateCircle}>
              <Text style={styles.celebrateEmoji}>🎉</Text>
            </View>
            <Text style={styles.doneTitle}>{"You're a natural!"}</Text>
            <Text style={styles.doneSub}>
              You just did a{' '}
              <Text style={styles.doneBold}>
                {actionLabel === 'in' ? 'Stock In' : 'Stock Out'}
              </Text>{' '}
              update.
            </Text>
            <Text style={styles.doneHint}>
              {"You've learned the core features of StockKeeper."}
            </Text>
            <Pressable style={({ pressed }) => [styles.finishBtn, pressed && { opacity: 0.92 }]} onPress={finish}>
              <Text style={styles.finishBtnText}>Finish Tutorial</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f1f5f9' },
  flex: { flex: 1 },
  accessoryBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#e2e8f0',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#cbd5e1',
  },
  accessoryDoneHit: { paddingVertical: 4, paddingHorizontal: 8 },
  accessoryDoneText: { fontSize: 17, fontWeight: '600', color: '#2563eb' },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 8 },
  androidAccessory: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#e2e8f0',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#cbd5e1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  androidAccessoryBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  androidAccessoryText: { fontSize: 17, fontWeight: '600', color: '#2563eb' },
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
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  illustrationWrap: { alignItems: 'center', marginBottom: 8 },
  illustration: { width: 120, height: 120 },
  productHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productEmoji: { fontSize: 22 },
  productName: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  productMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  muted: { fontSize: 14, color: '#64748b' },
  totalVal: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginTop: 8, marginBottom: 6 },
  godownPill: {
    borderWidth: 2,
    borderColor: 'rgba(15, 23, 42, 0.15)',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  godownPillText: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
    color: '#0f172a',
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btnIn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
  },
  btnInText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnOut: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  btnOutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  doneWrap: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrateCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  celebrateEmoji: { fontSize: 40 },
  doneTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  doneSub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 8, lineHeight: 22 },
  doneBold: { fontWeight: '800', color: '#0f172a' },
  doneHint: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  finishBtn: {
    width: '100%',
    maxWidth: 360,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
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
