import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const manifestExtra = (Constants.expoConfig?.extra ?? {}) as {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || manifestExtra.supabaseUrl?.trim();
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || manifestExtra.supabasePublishableKey?.trim();

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Supabase environment variables are missing. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.'
  );
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const customStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve(null);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
