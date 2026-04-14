import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

const HEADER_HEIGHT = 280; // Slightly taller for a more premium feel

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const { width } = useWindowDimensions();
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value, 
            [-HEADER_HEIGHT, 0], 
            [2, 1], 
            'clamp' // Prevents the image from shrinking smaller than 1
          ),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        style={{ backgroundColor, flex: 1 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        
        <Animated.View
          style={[
            styles.header,
            { 
              backgroundColor: headerBackgroundColor[colorScheme],
              width: width 
            },
            headerAnimatedStyle,
          ]}>
          {headerImage}
        </Animated.View>

        <ThemedView style={styles.content}>
          {/* Subtle indicator bar for the 'Sheet' look */}
          <ThemedView style={styles.sheetIndicator} />
          {children}
        </ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24, // Standard iOS padding
    paddingTop: 20,
    paddingBottom: 40,
    marginTop: -28, // This creates the "overlap" effect
    borderTopLeftRadius: 32, // Professional rounded sheet look
    borderTopRightRadius: 32,
    gap: 20,
    // Add a shadow/elevation for the floating sheet effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  sheetIndicator: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
    alignSelf: 'center',
    marginBottom: 8,
  },
});