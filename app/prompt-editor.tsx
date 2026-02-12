import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SitePrompt, MatchPattern } from '../types/prompts';
import { getAllPrompts, savePrompt, createPrompt } from '../lib/storage/prompts';
import { SCHEMA_DISPLAY_NAMES, SCHEMA_TYPES } from '../lib/schemas/builtin';

export default function PromptEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isNew = !id;

  const [name, setName] = useState('');
  const [patterns, setPatterns] = useState<MatchPattern[]>([{ type: 'glob', pattern: '' }]);
  const [prompt, setPrompt] = useState('');
  const [outputSchema, setOutputSchema] = useState('article');
  const [category, setCategory] = useState<SitePrompt['category']>('custom');
  const [existingPrompt, setExistingPrompt] = useState<SitePrompt | null>(null);

  useEffect(() => {
    if (id) {
      loadPrompt(id);
    }
  }, [id]);

  const loadPrompt = async (promptId: string) => {
    const prompts = await getAllPrompts();
    const found = prompts.find(p => p.id === promptId);
    if (found) {
      setExistingPrompt(found);
      setName(found.name);
      setPatterns(found.matchPatterns.length > 0 ? found.matchPatterns : [{ type: 'glob', pattern: '' }]);
      setPrompt(found.prompt);
      setOutputSchema(found.outputSchema);
      setCategory(found.category || 'custom');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for this prompt.');
      return;
    }

    const validPatterns = patterns.filter(p => p.pattern.trim());
    if (validPatterns.length === 0) {
      Alert.alert('Error', 'Please add at least one URL pattern.');
      return;
    }

    const promptData = existingPrompt
      ? {
          ...existingPrompt,
          name: name.trim(),
          matchPatterns: validPatterns,
          prompt: prompt.trim(),
          outputSchema,
          category,
        }
      : createPrompt({
          name: name.trim(),
          matchPatterns: validPatterns,
          prompt: prompt.trim(),
          outputSchema,
          category,
        });

    await savePrompt(promptData);
    router.back();
  };

  const addPattern = () => {
    setPatterns([...patterns, { type: 'glob', pattern: '' }]);
  };

  const updatePattern = (index: number, pattern: string) => {
    const updated = [...patterns];
    updated[index] = { ...updated[index], pattern };
    setPatterns(updated);
  };

  const removePattern = (index: number) => {
    if (patterns.length <= 1) return;
    setPatterns(patterns.filter((_, i) => i !== index));
  };

  const cyclePatternType = (index: number) => {
    const types: MatchPattern['type'][] = ['glob', 'exact', 'regex'];
    const current = patterns[index].type;
    const next = types[(types.indexOf(current) + 1) % types.length];
    const updated = [...patterns];
    updated[index] = { ...updated[index], type: next };
    setPatterns(updated);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g., Twitter Feed"
      />

      {/* URL Patterns */}
      <Text style={styles.label}>URL Match Patterns</Text>
      {patterns.map((pattern, i) => (
        <View key={i} style={styles.patternRow}>
          <TouchableOpacity style={styles.patternType} onPress={() => cyclePatternType(i)}>
            <Text style={styles.patternTypeText}>{pattern.type}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.patternInput}
            value={pattern.pattern}
            onChangeText={(text) => updatePattern(i, text)}
            placeholder="https://example.com/*"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {patterns.length > 1 && (
            <TouchableOpacity style={styles.removeButton} onPress={() => removePattern(i)}>
              <Text style={styles.removeButtonText}>-</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addPatternButton} onPress={addPattern}>
        <Text style={styles.addPatternText}>+ Add Pattern</Text>
      </TouchableOpacity>

      {/* Output Schema */}
      <Text style={styles.label}>Output Schema</Text>
      <View style={styles.schemaSelector}>
        {SCHEMA_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.schemaOption, outputSchema === type && styles.schemaOptionActive]}
            onPress={() => setOutputSchema(type)}
          >
            <Text style={[styles.schemaOptionText, outputSchema === type && styles.schemaOptionTextActive]}>
              {SCHEMA_DISPLAY_NAMES[type]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Prompt */}
      <Text style={styles.label}>Extraction Prompt</Text>
      <Text style={styles.hint}>
        Use {'{{schema:type}}'} to include schema definition. Available variables: {'{{page.url}}'}, {'{{page.domain}}'}, {'{{page.title}}'}, {'{{user.language}}'}
      </Text>
      <TextInput
        style={styles.promptInput}
        value={prompt}
        onChangeText={setPrompt}
        multiline
        placeholder="Extract content from this page..."
        textAlignVertical="top"
      />

      {/* Save */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{isNew ? 'Create Prompt' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  content: { padding: 16, paddingBottom: 40 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 4,
    marginTop: 20,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#111',
  },
  patternRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  patternType: {
    backgroundColor: '#e8e8e8',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  patternTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    textTransform: 'uppercase',
  },
  patternInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: '#111',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  addPatternButton: { marginTop: 4, marginLeft: 4 },
  addPatternText: { fontSize: 14, color: '#007AFF', fontWeight: '500' },
  schemaSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  schemaOption: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  schemaOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  schemaOptionText: { fontSize: 14, color: '#555' },
  schemaOptionTextActive: { color: '#fff', fontWeight: '600' },
  promptInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#111',
    minHeight: 150,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
