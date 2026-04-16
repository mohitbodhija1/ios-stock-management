import { ArrowRight } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const warehouseImage = require('@/assets/images/box.png');

type Props = {
  onNext: () => void;
  onSkip: () => void;
};

export function OnboardingWelcomeStep({ onNext, onSkip }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Image source={warehouseImage} style={styles.image} resizeMode="contain" />
        <Text style={styles.title}>Inventory, Simplified.</Text>
        <Text style={styles.subtitle}>
          Effortlessly manage your stock, godowns, and products in one elegant place.
        </Text>
      </View>
      <View style={styles.footer}>
        <Pressable style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} onPress={onNext}>
          <Text style={styles.btnText}>Get Started</Text>
          <ArrowRight size={20} color="#fff" />
        </Pressable>
        <Pressable style={styles.skip} onPress={onSkip} hitSlop={12}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 20,
    justifyContent: 'space-between',
    backgroundColor: '#fafafa',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  image: { width: 260, height: 260, marginBottom: 28 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  footer: { width: '100%', maxWidth: 400, alignSelf: 'center', gap: 14 },
  btn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#0f172a',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  btnPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  skip: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 16, fontWeight: '600', color: '#64748b' },
});
