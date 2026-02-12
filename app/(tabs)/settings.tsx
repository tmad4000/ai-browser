import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getSettings, saveSettings, saveApiKey, getApiKey } from '../../lib/storage/settings';
import { clearCache, getCacheSize } from '../../lib/storage/cache';
import { PROVIDER_DISPLAY_NAMES, PROVIDER_MODELS } from '../../lib/ai/providers';
import { GlobalConfig, DEFAULT_SYSTEM_PROMPT } from '../../types/prompts';

const PROVIDERS = ['anthropic', 'openai', 'google'] as const;

export default function SettingsScreen() {
  const [settings, setSettings] = useState<GlobalConfig | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [cacheInfo, setCacheInfo] = useState({ entries: 0, estimatedBytes: 0 });

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    const loaded = await getSettings();
    setSettings(loaded);
    setSystemPrompt(loaded.systemPrompt);

    // Load API key presence (not actual keys, just whether they exist)
    const keys: Record<string, string> = {};
    for (const provider of PROVIDERS) {
      const key = await getApiKey(provider);
      keys[provider] = key ? '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' + key.slice(-4) : '';
    }
    setApiKeys(keys);

    const cache = await getCacheSize();
    setCacheInfo(cache);
  };

  const handleSaveKey = async (provider: string) => {
    if (keyInput.trim()) {
      await saveApiKey(provider, keyInput.trim());
      setApiKeys(prev => ({ ...prev, [provider]: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' + keyInput.trim().slice(-4) }));
    }
    setEditingKey(null);
    setKeyInput('');
  };

  const handleSetDefaultProvider = async (provider: string) => {
    if (!settings) return;
    const updated = { ...settings, defaultProvider: provider };
    await saveSettings(updated);
    setSettings(updated);
  };

  const handleSaveSystemPrompt = async () => {
    if (!settings) return;
    await saveSettings({ ...settings, systemPrompt });
    Alert.alert('Saved', 'System prompt updated.');
  };

  const handleResetSystemPrompt = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  const handleClearCache = async () => {
    Alert.alert('Clear Cache', 'Remove all cached AI extractions?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearCache();
          setCacheInfo({ entries: 0, estimatedBytes: 0 });
        },
      },
    ]);
  };

  if (!settings) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* AI Providers */}
      <Text style={styles.sectionTitle}>AI Providers</Text>
      <View style={styles.card}>
        {PROVIDERS.map((provider, i) => (
          <View key={provider}>
            {i > 0 && <View style={styles.divider} />}
            <View style={styles.providerRow}>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>
                  {PROVIDER_DISPLAY_NAMES[provider]}
                </Text>
                <Text style={styles.providerModels}>
                  {PROVIDER_MODELS[provider].join(', ')}
                </Text>
              </View>
              {settings.defaultProvider === provider && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
              {settings.defaultProvider !== provider && (
                <TouchableOpacity onPress={() => handleSetDefaultProvider(provider)}>
                  <Text style={styles.setDefaultText}>Set Default</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.keyRow}>
              {editingKey === provider ? (
                <View style={styles.keyInputRow}>
                  <TextInput
                    style={styles.keyInput}
                    value={keyInput}
                    onChangeText={setKeyInput}
                    placeholder="Paste API key..."
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                  />
                  <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveKey(provider)}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.keyDisplay}
                  onPress={() => {
                    setEditingKey(provider);
                    setKeyInput('');
                  }}
                >
                  <Text style={styles.keyText}>
                    {apiKeys[provider] || 'Tap to add API key'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* System Prompt */}
      <Text style={styles.sectionTitle}>Global System Prompt</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.systemPromptInput}
          value={systemPrompt}
          onChangeText={setSystemPrompt}
          multiline
          placeholder="System prompt sent with every AI request..."
          textAlignVertical="top"
        />
        <View style={styles.promptActions}>
          <TouchableOpacity onPress={handleResetSystemPrompt}>
            <Text style={styles.resetText}>Reset to Default</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.savePromptButton} onPress={handleSaveSystemPrompt}>
            <Text style={styles.savePromptButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cache */}
      <Text style={styles.sectionTitle}>Cache</Text>
      <View style={styles.card}>
        <View style={styles.cacheRow}>
          <View>
            <Text style={styles.cacheLabel}>Cached Extractions</Text>
            <Text style={styles.cacheValue}>
              {cacheInfo.entries} entries ({(cacheInfo.estimatedBytes / 1024).toFixed(0)} KB)
            </Text>
          </View>
          <TouchableOpacity onPress={handleClearCache}>
            <Text style={styles.clearCacheText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  providerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 16, fontWeight: '600', color: '#111' },
  providerModels: { fontSize: 12, color: '#888', marginTop: 2 },
  defaultBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  setDefaultText: { fontSize: 14, color: '#007AFF' },
  keyRow: { marginTop: 8 },
  keyInputRow: { flexDirection: 'row', gap: 8 },
  keyInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  keyDisplay: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
  },
  keyText: { fontSize: 14, color: '#666', fontFamily: 'Courier' },
  systemPromptInput: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    minHeight: 120,
  },
  promptActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  resetText: { fontSize: 14, color: '#ff3b30' },
  savePromptButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  savePromptButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  cacheRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cacheLabel: { fontSize: 15, fontWeight: '500', color: '#333' },
  cacheValue: { fontSize: 13, color: '#888', marginTop: 2 },
  clearCacheText: { fontSize: 14, color: '#ff3b30', fontWeight: '500' },
});
