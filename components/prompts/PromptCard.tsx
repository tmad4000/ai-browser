import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { SitePrompt } from '../../types/prompts';
import { SCHEMA_DISPLAY_NAMES } from '../../lib/schemas/builtin';

interface PromptCardProps {
  prompt: SitePrompt;
  onPress: () => void;
  onToggle: (enabled: boolean) => void;
  onLongPress?: () => void;
}

export function PromptCard({ prompt, onPress, onToggle, onLongPress }: PromptCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.info}>
        <Text style={styles.name}>{prompt.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {SCHEMA_DISPLAY_NAMES[prompt.outputSchema] || prompt.outputSchema}
          {' · '}
          {prompt.matchPatterns.map(p => p.pattern).join(', ')}
        </Text>
      </View>
      <Switch
        value={prompt.enabled}
        onValueChange={onToggle}
        trackColor={{ true: '#007AFF' }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    color: '#888',
  },
});
