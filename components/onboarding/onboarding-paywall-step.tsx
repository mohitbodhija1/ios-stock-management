import { BlurView } from 'expo-blur';
import { Check, Cloud, FileText, Package, Warehouse, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  onClose: () => void;
};

export function OnboardingPaywallStep({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly');

  const blurTint: 'light' | 'dark' = scheme === 'dark' ? 'dark' : 'light';

  const benefits = [
    { Icon: Warehouse, label: 'Unlimited Godowns' },
    { Icon: Package, label: 'Unlimited Products' },
    { Icon: Cloud, label: 'Real-time Cloud Sync' },
    { Icon: FileText, label: 'Advanced PDF Reporting' },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={48} tint={blurTint} style={StyleSheet.absoluteFill} />
      <View style={[styles.inner, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={16}>
          <X size={20} color="#64748b" />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✨ StockKeeper Pro</Text>
          </View>
          <Text style={styles.title}>Unlock Unlimited Potential.</Text>
        </View>

        <View style={styles.benefits}>
          {benefits.map(({ Icon, label }) => (
            <View key={label} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Icon size={18} color="#0f172a" />
              </View>
              <Text style={styles.benefitLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.trialBanner}>
          <Text style={styles.trialText}>
            Start your <Text style={styles.trialBold}>7-Day Free Trial</Text> now. Cancel anytime.
          </Text>
        </View>

        <View style={styles.plans}>
          <Pressable
            style={[styles.planCard, plan === 'monthly' && styles.planCardActive]}
            onPress={() => setPlan('monthly')}>
            {plan === 'monthly' ? (
              <View style={styles.planCheck}>
                <Check size={12} color="#fff" strokeWidth={3} />
              </View>
            ) : null}
            <Text style={styles.planMeta}>Monthly</Text>
            <Text style={styles.planPrice}>$9.99</Text>
            <Text style={styles.planSuffix}>/month</Text>
          </Pressable>

          <Pressable
            style={[styles.planCard, plan === 'yearly' && styles.planCardActive]}
            onPress={() => setPlan('yearly')}>
            <View style={styles.savePill}>
              <Text style={styles.savePillText}>Save 50%</Text>
            </View>
            {plan === 'yearly' ? (
              <View style={styles.planCheck}>
                <Check size={12} color="#fff" strokeWidth={3} />
              </View>
            ) : null}
            <Text style={styles.planMeta}>Yearly</Text>
            <Text style={styles.planPrice}>$59.99</Text>
            <Text style={styles.planSuffix}>/year</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1 }} />

        <Pressable style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]} onPress={onClose}>
          <Text style={styles.ctaText}>Start Free Trial & Subscribe</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerLink}>Restore Purchases</Text>
          <Text style={styles.footerDot}>·</Text>
          <Text style={styles.footerLink}>Terms</Text>
          <Text style={styles.footerDot}>·</Text>
          <Text style={styles.footerLink}>Privacy</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, paddingHorizontal: 24 },
  closeBtn: {
    alignSelf: 'flex-start',
    padding: 10,
    marginLeft: -8,
    borderRadius: 999,
    backgroundColor: 'rgba(248, 250, 252, 0.85)',
  },
  header: { marginTop: 12, marginBottom: 20 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    marginBottom: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  benefits: { gap: 12, marginBottom: 20 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitLabel: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  trialBanner: {
    backgroundColor: 'rgba(224, 242, 254, 0.85)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  trialText: { fontSize: 14, fontWeight: '600', color: '#0f172a', textAlign: 'center' },
  trialBold: { fontWeight: '800' },
  plans: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  planCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  planCardActive: { borderColor: '#0f172a', backgroundColor: 'rgba(15, 23, 42, 0.04)' },
  planCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planMeta: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 4 },
  planPrice: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  planSuffix: { fontSize: 12, color: '#64748b', marginTop: 2 },
  savePill: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -44,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#0f172a',
  },
  savePillText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  cta: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  footerLink: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  footerDot: { fontSize: 11, color: '#cbd5e1' },
});
