import React from 'react';
import { View, StyleSheet } from 'react-native';
import Markdown from 'react-native-marked';

interface RawRendererProps {
  content: string;
}

export function RawRenderer({ content }: RawRendererProps) {
  return (
    <View style={styles.container}>
      <Markdown
        value={content}
        styles={{ content: styles.content }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
});
