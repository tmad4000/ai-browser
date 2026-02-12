import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface NavigationControlsProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  onMenu: () => void;
}

export function NavigationControls({
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onMenu,
}: NavigationControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onGoBack}
        disabled={!canGoBack}
        activeOpacity={0.6}
      >
        <Text style={[styles.icon, !canGoBack && styles.disabled]}>{'\u2039'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={onGoForward}
        disabled={!canGoForward}
        activeOpacity={0.6}
      >
        <Text style={[styles.icon, !canGoForward && styles.disabled]}>{'\u203A'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  button: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
    fontWeight: '300',
    color: '#007AFF',
    marginTop: -2,
  },
  disabled: {
    color: '#ccc',
  },
});
