import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SCHEMA_DEFINITIONS, SCHEMA_DISPLAY_NAMES } from '../lib/schemas/builtin';

export default function SchemaViewerScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const schemaType = type || 'article';
  const definition = SCHEMA_DEFINITIONS[schemaType] || 'No schema found';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{SCHEMA_DISPLAY_NAMES[schemaType] || schemaType} Schema</Text>
      <Text style={styles.code}>{definition}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 16 },
  code: {
    fontFamily: 'Courier',
    fontSize: 13,
    lineHeight: 20,
    color: '#333',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
