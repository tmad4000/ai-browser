import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { GlobalConfig, DEFAULT_GLOBAL_CONFIG } from '../../types/prompts';

const SETTINGS_KEY = 'ai_browser_settings';
const PROVIDER_KEY_PREFIX = 'ai_browser_key_';

// API keys should be entered in Settings, not hardcoded
const DEFAULT_API_KEYS: Record<string, string> = {};

export async function getSettings(): Promise<GlobalConfig> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    const settings = stored ? JSON.parse(stored) : {};

    // Merge with defaults
    const config: GlobalConfig = {
      ...DEFAULT_GLOBAL_CONFIG,
      ...settings,
      preferences: {
        ...DEFAULT_GLOBAL_CONFIG.preferences,
        ...(settings.preferences || {}),
      },
      providers: {},
    };

    // Load API keys from SecureStore
    const providerNames = ['anthropic', 'openai', 'google'];
    for (const name of providerNames) {
      const apiKey = await SecureStore.getItemAsync(`${PROVIDER_KEY_PREFIX}${name}`) || DEFAULT_API_KEYS[name];
      if (apiKey) {
        config.providers[name] = {
          apiKey,
          models: [],
        };
      }
    }

    return config;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_GLOBAL_CONFIG;
  }
}

export async function saveSettings(settings: Partial<GlobalConfig>): Promise<void> {
  try {
    // Don't store API keys in AsyncStorage
    const { providers, ...rest } = settings;
    const current = await AsyncStorage.getItem(SETTINGS_KEY);
    const existing = current ? JSON.parse(current) : {};

    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...existing, ...rest })
    );
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}

export async function saveApiKey(provider: string, apiKey: string): Promise<void> {
  await SecureStore.setItemAsync(`${PROVIDER_KEY_PREFIX}${provider}`, apiKey);
}

export async function getApiKey(provider: string): Promise<string | null> {
  return await SecureStore.getItemAsync(`${PROVIDER_KEY_PREFIX}${provider}`);
}

export async function deleteApiKey(provider: string): Promise<void> {
  await SecureStore.deleteItemAsync(`${PROVIDER_KEY_PREFIX}${provider}`);
}
