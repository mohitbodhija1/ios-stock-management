import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle, View } from 'react-native';

/**
 * An improved IconSymbol component that supports native iOS rendering modes
 * for a more premium "Apple-like" feel in your stock management app.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
  animationSpec, // Optional: for SF Symbol animations
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
  animationSpec?: SymbolViewProps['animationSpec'];
}) {
  return (
    <View style={[styles.centered, style]}>
      <SymbolView
        weight={weight}
        // Using 'hierarchical' creates a professional look by automatically 
        // applying varying opacities of your primary color.
        type="hierarchical" 
        tintColor={color}
        resizeMode="scaleAspectFit"
        name={name}
        animationSpec={animationSpec}
        style={{
          width: size,
          height: size,
        }}
      />
    </View>
  );
}

const styles = {
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
};