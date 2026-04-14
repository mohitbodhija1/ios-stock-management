import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type ViewStyle, Platform } from 'react-native';

/**
 * Enhanced mapping to include Stock Management essentials.
 * We use MaterialIcons to approximate the professional look of SF Symbols.
 */
const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  
  // Stock App Specifics
  'archivebox.fill': 'inventory',
  'chart.bar.fill': 'bar-chart',
  'plus.circle.fill': 'add-circle',
  'minus.circle.fill': 'remove-circle',
  'exclamationmark.triangle.fill': 'warning',
  'person.crop.circle.fill': 'account-circle',
  'list.bullet.rectangle.fill': 'view-list',
} as const;

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android/Web.
 * This version is optimized for a clean, professional aesthetic.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // Material Icons can look slightly larger than SF Symbols at the same point size.
  // We apply a tiny scale factor for visual balance on Android.
  const adjustedSize = Platform.OS === 'android' ? size - 2 : size;

  return (
    <MaterialIcons 
      color={color} 
      size={adjustedSize} 
      name={MAPPING[name]} 
      style={[
        { 
          textAlign: 'center',
          // Subtle opacity for icons makes the text labels pop more (Pro UI Tip)
          opacity: 0.9 
        }, 
        style as any
      ]} 
    />
  );
}