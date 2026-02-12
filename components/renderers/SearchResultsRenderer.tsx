import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SearchResultsSchema } from '../../types/schemas';

interface SearchResultsRendererProps {
  data: SearchResultsSchema;
}

export function SearchResultsRenderer({ data }: SearchResultsRendererProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.queryLabel}>Results for: <Text style={styles.query}>{data.query}</Text></Text>
      {data.totalResults && <Text style={styles.totalResults}>{data.totalResults} results</Text>}

      {data.featuredSnippet && (
        <View style={styles.snippet}>
          <Text style={styles.snippetTitle}>{data.featuredSnippet.title}</Text>
          <Text style={styles.snippetContent}>{data.featuredSnippet.content}</Text>
          <Text style={styles.snippetSource}>{data.featuredSnippet.sourceUrl}</Text>
        </View>
      )}

      {data.results.map((result, i) => (
        <TouchableOpacity
          key={i}
          style={styles.result}
          onPress={() => Linking.openURL(result.url)}
          activeOpacity={0.7}
        >
          <Text style={styles.resultUrl} numberOfLines={1}>{result.siteDisplayName || result.url}</Text>
          <Text style={styles.resultTitle}>{result.title}</Text>
          <Text style={styles.resultSnippet} numberOfLines={3}>{result.snippet}</Text>
        </TouchableOpacity>
      ))}

      {data.relatedSearches && data.relatedSearches.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Related searches</Text>
          {data.relatedSearches.map((search, i) => (
            <View key={i} style={styles.relatedItem}>
              <Text style={styles.relatedText}>{search}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  queryLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  query: { fontWeight: '600', color: '#111' },
  totalResults: { fontSize: 13, color: '#888', marginBottom: 16 },
  snippet: { backgroundColor: '#f0f7ff', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#d0e3ff' },
  snippetTitle: { fontSize: 16, fontWeight: '700', color: '#1a0dab', marginBottom: 8 },
  snippetContent: { fontSize: 15, lineHeight: 22, color: '#333', marginBottom: 6 },
  snippetSource: { fontSize: 12, color: '#006621' },
  result: { marginBottom: 20 },
  resultUrl: { fontSize: 13, color: '#006621', marginBottom: 2 },
  resultTitle: { fontSize: 18, color: '#1a0dab', fontWeight: '500', marginBottom: 4 },
  resultSnippet: { fontSize: 14, lineHeight: 20, color: '#545454' },
  relatedSection: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 16 },
  relatedTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  relatedItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  relatedText: { fontSize: 15, color: '#1a0dab' },
});
