import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  const toggleOpen = () => {
    // Adds a smooth spring animation when opening/closing
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((value) => !value);
  };

  const iconColor = theme === 'light' ? '#6B7280' : '#9CA3AF'; // Using a neutral gray for a professional look

  return (
    <ThemedView style={[styles.container, isOpen && styles.containerActive]}>
      <TouchableOpacity
        style={styles.heading}
        onPress={toggleOpen}
        activeOpacity={0.7}
      >
        <ThemedText type="defaultSemiBold" style={styles.titleText}>
          {title}
        </ThemedText>
        
        <IconSymbol
          name="chevron.right"
          size={16}
          weight="semibold"
          color={iconColor}
          style={{ 
            transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
            opacity: 0.8
          }}
        />
      </TouchableOpacity>

      {isOpen && (
        <ThemedView style={styles.content}>
          {children}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150, 150, 150, 0.2)', // Subtle border for definition
    backgroundColor: 'rgba(150, 150, 150, 0.05)', // Very light background tint
  },
  containerActive: {
    backgroundColor: 'transparent', // Optional: change background when open
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Pushes chevron to the right for a cleaner iOS look
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  titleText: {
    fontSize: 16,
    letterSpacing: -0.3, // Tighter tracking for that modern typography feel
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
});