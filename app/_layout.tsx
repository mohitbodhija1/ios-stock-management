import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/auth-context';
import { InventoryProvider } from '@/context/inventory-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LogoutControl } from '@/components/logout-control';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getOnboardingComplete } from '@/lib/onboarding-storage';

export const unstable_settings = {
  initialRouteName: 'index',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, loading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  // Optimized Theme Colors
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? '#0f172a' : '#FAF9F6';
  const accentColor = isDark ? '#38bdf8' : '#0f172a';

  useEffect(() => {
    if (!session) {
      setOnboardingDone(null);
      return;
    }
    let cancelled = false;
    void getOnboardingComplete().then((done) => {
      if (!cancelled) setOnboardingDone(done);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (loading) return;

    const inLogin = pathname === '/login';
    const inTabs = segments[0] === '(tabs)';

    if (!session) {
      if (!inLogin) router.replace('/login');
      return;
    }

    if (onboardingDone === null) return;

    if (inLogin) {
      router.replace(onboardingDone ? '/(tabs)/stock' : '/');
      return;
    }

    const onIndex = pathname === '/' || pathname === '/index';

    if (onboardingDone && onIndex) {
      router.replace('/(tabs)/stock');
      return;
    }

    if (!onboardingDone && inTabs) {
      router.replace('/');
    }
  }, [session, loading, pathname, segments, router, onboardingDone]);

  if (loading || (session && onboardingDone === null)) {
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
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: true,
              headerTransparent: true,
              headerTitle: '',
              headerShadowVisible: false,
              headerTintColor: isDark ? '#f8fafc' : '#0f172a',
              headerStyle: { backgroundColor: 'transparent' },
              headerRight: () => <LogoutControl />,
            }}
          />
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