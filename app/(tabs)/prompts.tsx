import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SitePrompt } from '../../types/prompts';
import { getAllPrompts, savePrompt, deletePrompt } from '../../lib/storage/prompts';
import { SCHEMA_DISPLAY_NAMES } from '../../lib/schemas/builtin';

const CATEGORY_ORDER = ['social', 'news', 'shopping', 'search', 'custom'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  social: 'Social',
  news: 'News',
  shopping: 'Shopping',
  search: 'Search',
  custom: 'Custom',
};

export default function PromptsScreen() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<SitePrompt[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadPrompts();
    }, [])
  );

  const loadPrompts = async () => {
    const loaded = await getAllPrompts();
    setPrompts(loaded);
  };

  const handleToggle = async (prompt: SitePrompt) => {
    const updated = { ...prompt, enabled: !prompt.enabled };
    await savePrompt(updated);
    await loadPrompts();
  };

  const handleDelete = (prompt: SitePrompt) => {
    Alert.alert(
      'Delete Prompt',
      `Are you sure you want to delete "${prompt.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePrompt(prompt.id);
            await loadPrompts();
          },
        },
      ]
    );
  };

  const groupedPrompts = CATEGORY_ORDER.map(category => ({
    category,
    label: CATEGORY_LABELS[category],
    prompts: prompts.filter(p => (p.category || 'custom') === category),
  })).filter(g => g.prompts.length > 0);

  return (
    <View style={styles.container}>
      <FlatList
        data={groupedPrompts}
        keyExtractor={item => item.category}
        renderItem={({ item: group }) => (
          <View style={styles.group}>
            <Text style={styles.groupTitle}>{group.label}</Text>
            {group.prompts.map(prompt => (
              <TouchableOpacity
                key={prompt.id}
                style={styles.promptCard}
                onPress={() => router.push({ pathname: '/prompt-editor', params: { id: prompt.id } })}
                onLongPress={() => handleDelete(prompt)}
                activeOpacity={0.7}
              >
                <View style={styles.promptInfo}>
                  <Text style={styles.promptName}>{prompt.name}</Text>
                  <Text style={styles.promptMeta}>
                    {SCHEMA_DISPLAY_NAMES[prompt.outputSchema] || prompt.outputSchema}
                    {' \u00B7 '}
                    {prompt.matchPatterns.map(p => p.pattern).join(', ')}
                  </Text>
                </View>
                <Switch
                  value={prompt.enabled}
                  onValueChange={() => handleToggle(prompt)}
                  trackColor={{ true: '#007AFF' }}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No prompts yet</Text>
            <Text style={styles.emptySubtext}>Tap + to create your first site prompt</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/prompt-editor')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  list: { padding: 16 },
  group: { marginBottom: 24 },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  promptCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  promptInfo: { flex: 1, marginRight: 12 },
  promptName: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 2 },
  promptMeta: { fontSize: 13, color: '#888' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333' },
  emptySubtext: { fontSize: 14, color: '#888', marginTop: 4 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { fontSize: 28, color: '#fff', fontWeight: '300', marginTop: -2 },
});
