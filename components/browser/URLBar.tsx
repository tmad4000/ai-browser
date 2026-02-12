import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';

interface URLBarProps {
  url: string;
  isLoading: boolean;
  activePromptName?: string;
  onSubmit: (input: string) => void;
  onStopLoading: () => void;
}

export function URLBar({ url, isLoading, activePromptName, onSubmit, onStopLoading }: URLBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<TextInput>(null);

  const displayUrl = url ? new URL(url).hostname.replace('www.', '') : '';

  const handleFocus = () => {
    setIsEditing(true);
    setInputValue(url);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    let finalUrl = trimmed;
    // If it looks like a URL, ensure protocol
    if (trimmed.includes('.') && !trimmed.includes(' ')) {
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        finalUrl = 'https://' + trimmed;
      }
    } else if (!trimmed.startsWith('http')) {
      // Treat as search query
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
    }

    onSubmit(finalUrl);
    setIsEditing(false);
    Keyboard.dismiss();
  };

  if (isEditing) {
    return (
      <View style={styles.container}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleSubmit}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          keyboardType="url"
          returnKeyType="go"
          selectTextOnFocus
          placeholder="Search or enter URL"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.cancelButton} onPress={() => {
          setIsEditing(false);
          Keyboard.dismiss();
        }}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.displayContainer} onPress={handleFocus} activeOpacity={0.7}>
      <View style={styles.urlDisplay}>
        {isLoading && <Text style={styles.loadingDot}>{'\u25CF'}</Text>}
        <Text style={styles.displayText} numberOfLines={1}>
          {displayUrl || 'Search or enter URL'}
        </Text>
        {activePromptName && (
          <View style={styles.promptChip}>
            <Text style={styles.promptChipText}>{activePromptName}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 36,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#000',
  },
  cancelButton: {
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 15,
    color: '#007AFF',
  },
  displayContainer: {
    flex: 1,
  },
  urlDisplay: {
    height: 36,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 6,
  },
  loadingDot: {
    fontSize: 8,
    color: '#007AFF',
  },
  displayText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  promptChip: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  promptChipText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
});
