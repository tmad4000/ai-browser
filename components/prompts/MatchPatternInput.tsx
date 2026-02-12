import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MatchPattern } from '../../types/prompts';

interface MatchPatternInputProps {
  pattern: MatchPattern;
  onChange: (pattern: MatchPattern) => void;
  onRemove?: () => void;
}

const TYPES: MatchPattern['type'][] = ['glob', 'exact', 'regex'];

export function MatchPatternInput({ pattern, onChange, onRemove }: MatchPatternInputProps) {
  const cycleType = () => {
    const currentIndex = TYPES.indexOf(pattern.type);
    const nextType = TYPES[(currentIndex + 1) % TYPES.length];
    onChange({ ...pattern, type: nextType });
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.typeButton} onPress={cycleType}>
        <Text style={styles.typeText}>{pattern.type}</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={pattern.pattern}
        onChangeText={(text) => onChange({ ...pattern, pattern: text })}
        placeholder="https://example.com/*"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {onRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeText}>-</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  typeButton: {
    backgroundColor: '#e8e8e8',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    textTransform: 'uppercase',
  },
  input: {
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
  removeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
