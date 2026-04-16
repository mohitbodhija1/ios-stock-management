import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const godownImage = require('@/assets/images/box.png');

type Props = {
  initialName: string;
  initialLocation: string;
  onNext: (name: string, location: string) => void;
  onBack: () => void;
};

export function OnboardingGodownStep({
  initialName,
  initialLocation,
  onNext,
  onBack,
}: Props) {
  const [name, setName] = useState(initialName);
  const [location, setLocation] = useState(initialLocation);

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
          <Text style={styles.navTitle}>Setup</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.illustrationWrap}>
          <Image source={godownImage} style={styles.illustration} resizeMode="contain" />
        </View>

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Name Your First Godown.</Text>
          <Text style={styles.sheetDesc}>
            A godown is where you store your items (like a warehouse, garage, or store).
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g., Main Warehouse, West Wing"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
          <Text style={styles.optionalLabel}>Location (optional)</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., New Delhi, IN"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          <View style={{ flex: 1, minHeight: 8 }} />

          <Pressable
            style={({ pressed }) => [
              styles.cta,
              (!name.trim() || pressed) && { opacity: name.trim() ? 0.92 : 0.4 },
            ]}
            disabled={!name.trim()}
            onPress={() => onNext(name.trim(), location.trim())}>
            <Text style={styles.ctaText}>Continue</Text>
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
  illustrationWrap: { alignItems: 'center', paddingTop: 16, paddingBottom: 8 },
  illustration: { width: 180, height: 180 },
  sheet: {
    flex: 1,
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
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  sheetDesc: { fontSize: 14, color: '#64748b', lineHeight: 21, marginBottom: 20 },
  optionalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    width: '100%',
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
    marginTop: 16,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
