import { StyleSheet, Text, type TextProps, Platform } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'smallMuted';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  // We prioritize light mode for this professional business look
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        styles[type],
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1e293b', // Slate 800 for better readability than pure black
    fontWeight: '400',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: '#0f172a', // Slate 900
    letterSpacing: -0.2,
  },
  title: {
    fontSize: 34,
    fontWeight: '800', // Extra bold for primary headings
    lineHeight: 40,
    color: '#0f172a',
    letterSpacing: -1.2, // Tight tracking for premium look
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2563eb', 
    fontWeight: '600',
  },
  smallMuted: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748b', 
    fontWeight: '500',
  },
});