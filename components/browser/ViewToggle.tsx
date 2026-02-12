import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ViewToggleProps {
  mode: 'ai' | 'web';
  onToggle: (mode: 'ai' | 'web') => void;
  disabled?: boolean;
}

export function ViewToggle({ mode, onToggle, disabled }: ViewToggleProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, mode === 'ai' && styles.activeButton]}
        onPress={() => onToggle('ai')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, mode === 'ai' && styles.activeText]}>AI</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, mode === 'web' && styles.activeButton]}
        onPress={() => onToggle('web')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, mode === 'web' && styles.activeText]}>Web</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    padding: 2,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  activeText: {
    color: '#000',
  },
});
