import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SitePrompt, MatchPattern } from '../../types/prompts';
import { SCHEMA_DISPLAY_NAMES, SCHEMA_TYPES } from '../../lib/schemas/builtin';
import { MatchPatternInput } from './MatchPatternInput';

interface PromptEditorProps {
  prompt: Partial<SitePrompt>;
  onSave: (prompt: Partial<SitePrompt>) => void;
  onCancel: () => void;
}

export function PromptEditor({ prompt, onSave, onCancel }: PromptEditorProps) {
  const [name, setName] = useState(prompt.name || '');
  const [patterns, setPatterns] = useState<MatchPattern[]>(
    prompt.matchPatterns?.length ? prompt.matchPatterns : [{ type: 'glob', pattern: '' }]
  );
  const [promptText, setPromptText] = useState(prompt.prompt || '');
  const [outputSchema, setOutputSchema] = useState(prompt.outputSchema || 'article');

  const handleSave = () => {
    onSave({
      ...prompt,
      name,
      matchPatterns: patterns.filter(p => p.pattern.trim()),
      prompt: promptText,
      outputSchema,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g., Twitter Feed"
      />

      <Text style={styles.label}>URL Match Patterns</Text>
      {patterns.map((pattern, i) => (
        <MatchPatternInput
          key={i}
          pattern={pattern}
          onChange={(updated) => {
            const newPatterns = [...patterns];
            newPatterns[i] = updated;
            setPatterns(newPatterns);
          }}
          onRemove={patterns.length > 1 ? () => {
            setPatterns(patterns.filter((_, idx) => idx !== i));
          } : undefined}
        />
      ))}
      <TouchableOpacity
        onPress={() => setPatterns([...patterns, { type: 'glob', pattern: '' }])}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>+ Add Pattern</Text>
      </TouchableOpacity>

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

      <Text style={styles.label}>Extraction Prompt</Text>
      <TextInput
        style={styles.promptInput}
        value={promptText}
        onChangeText={setPromptText}
        multiline
        placeholder="Extract content from this page..."
        textAlignVertical="top"
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#111',
  },
  addButton: { marginTop: 4, marginLeft: 4 },
  addButtonText: { fontSize: 14, color: '#007AFF', fontWeight: '500' },
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
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  cancelButtonText: { fontSize: 17, fontWeight: '600', color: '#333' },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  saveButtonText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
