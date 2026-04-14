import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/auth-context';
import { InventoryProvider } from '@/context/inventory-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Optimized Theme Colors
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? '#0f172a' : '#FAF9F6';
  const accentColor = isDark ? '#38bdf8' : '#0f172a';

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!session && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (session && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace('/(tabs)/stock');
    }
  }, [session, loading, segments, router]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <View style={styles.logoWrapper}>
          <IconSymbol name="archivebox.fill" size={48} color={accentColor} />
        </View>
        <ActivityIndicator size="small" color={accentColor} style={{ marginTop: 24 }} />
        <ThemedText style={styles.loadingText}>Initializing StockKeeper...</ThemedText>
      </View>
    );
  }

  return (
    <InventoryProvider>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
            },
            headerShadowVisible: false,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 17,
            },
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="setup" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="products/[productId]" options={{ headerShown: false }} />
          <Stack.Screen name="godowns/[godownId]" options={{ headerShown: false }} />
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal', 
              title: 'Notifications',
              headerShown: true,
              headerRight: () => null, // Placeholder for future close button
            }} 
          />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </ThemeProvider>
    </InventoryProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    opacity: 0.6,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});