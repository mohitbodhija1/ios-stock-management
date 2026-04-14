import { Link } from 'expo-router';
import { StyleSheet, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ModalScreen() {
  const theme = useColorScheme() ?? 'light';
  const accentColor = '#2563eb'; // Deep blue for professional action

  return (
    <ThemedView style={styles.container}>
      {/* Decorative Icon Section */}
      <View style={[styles.iconContainer, { backgroundColor: theme === 'light' ? '#f1f5f9' : '#1e293b' }]}>
        <IconSymbol 
          name="paperplane.fill" 
          size={42} 
          color={accentColor} 
          weight="semibold"
        />
      </View>

      <ThemedText type="title" style={styles.title}>
        Action Required
      </ThemedText>
      
      <ThemedText style={styles.description}>
        This is a modal view. You can use this space for quick settings, 
        stock confirmations, or detailed item information.
      </ThemedText>

      <View style={styles.buttonGap} />

      {/* Primary Action Button */}
      <Link href="/" dismissTo asChild>
        <Pressable style={[styles.primaryButton, { backgroundColor: accentColor }]}>
          <ThemedText style={styles.primaryButtonText}>Return to Dashboard</ThemedText>
        </Pressable>
      </Link>

      {/* Secondary Dismiss Action */}
      <Link href="/" dismissTo asChild>
        <Pressable style={styles.secondaryButton}>
          <ThemedText style={[styles.secondaryButtonText, { color: theme === 'light' ? '#64748b' : '#94a3b8' }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#64748b',
    paddingHorizontal: 10,
  },
  buttonGap: {
    height: 40,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});