import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { resetOnboarding } from '@/lib/onboarding-storage';

/**
 * Renders inside Stack headerRight so touches are not swallowed by native tab scenes.
 */
export function LogoutControl() {
  const router = useRouter();
  const { signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#f1f5f9' : '#0f172a';

  const confirmAndLogout = () => {
    Alert.alert(
      'Log out',
      'You will be signed out. When you sign in again, onboarding will start from the beginning.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await resetOnboarding();
            await signOut();
            router.replace('/login');
          },
        },
      ],
    );
  };

  return (
    <Pressable
      onPress={confirmAndLogout}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.75 }]}
      accessibilityRole="button"
      accessibilityLabel="Log out"
      hitSlop={12}>
      <LogOut size={22} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginRight: 4,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
});
