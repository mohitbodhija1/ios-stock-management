import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@stockkeeper/onboarding_complete';

export async function getOnboardingComplete(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === '1';
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(done: boolean): Promise<void> {
  try {
    if (done) await AsyncStorage.setItem(KEY, '1');
    else await AsyncStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
