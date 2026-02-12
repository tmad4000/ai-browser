import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { ArticleSchema, ArticleBlock } from '../../types/schemas';

interface ArticleRendererProps {
  data: ArticleSchema;
}

export function ArticleRenderer({ data }: ArticleRendererProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {data.heroImage && (
        <Image
          source={{ uri: data.heroImage.url }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.header}>
        <Text style={styles.title}>{data.title}</Text>
        {data.subtitle && <Text style={styles.subtitle}>{data.subtitle}</Text>}

        <View style={styles.meta}>
          {data.authors.length > 0 && (
            <Text style={styles.authors}>
              {data.authors.map(a => a.name).join(', ')}
            </Text>
          )}
          <View style={styles.metaRow}>
            {data.source && (
              <Text style={styles.source}>{data.source.name}</Text>
            )}
            {data.publishedAt && (
              <Text style={styles.date}>{formatDate(data.publishedAt)}</Text>
            )}
            {data.readingTimeMinutes && (
              <Text style={styles.readTime}>{data.readingTimeMinutes} min read</Text>
            )}
          </View>
        </View>

        {data.tags && data.tags.length > 0 && (
          <View style={styles.tags}>
            {data.tags.slice(0, 5).map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.body}>
        {data.body.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </View>
    </ScrollView>
  );
}

function BlockRenderer({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <Text style={styles.paragraph}>{block.text}</Text>;

    case 'heading':
      const headingStyle = [
        styles.h1, styles.h2, styles.h3,
        styles.h4, styles.h4, styles.h4,
      ][block.level - 1] || styles.h3;
      return <Text style={headingStyle}>{block.text}</Text>;

    case 'image':
      return (
        <View style={styles.imageBlock}>
          <Image
            source={{ uri: block.url }}
            style={styles.bodyImage}
            resizeMode="cover"
          />
          {block.caption && (
            <Text style={styles.imageCaption}>{block.caption}</Text>
          )}
        </View>
      );

    case 'blockquote':
      return (
        <View style={styles.blockquote}>
          <Text style={styles.blockquoteText}>{block.text}</Text>
          {block.attribution && (
            <Text style={styles.attribution}>-- {block.attribution}</Text>
          )}
        </View>
      );

    case 'code':
      return (
        <View style={styles.codeBlock}>
          {block.language && (
            <Text style={styles.codeLanguage}>{block.language}</Text>
          )}
          <Text style={styles.codeText}>{block.code}</Text>
        </View>
      );

    case 'list':
      return (
        <View style={styles.listBlock}>
          {block.items.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.listBullet}>
                {block.ordered ? `${i + 1}.` : '•'}
              </Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );

    case 'separator':
      return <View style={styles.separatorLine} />;

    default:
      return null;
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 220,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginTop: 8,
    lineHeight: 24,
  },
  meta: {
    marginTop: 16,
  },
  authors: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  source: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  readTime: {
    fontSize: 14,
    color: '#888',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#555',
  },
  body: {
    padding: 20,
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 27,
    color: '#222',
    marginBottom: 16,
  },
  h1: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    marginTop: 28,
    marginBottom: 12,
    lineHeight: 32,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginTop: 24,
    marginBottom: 10,
    lineHeight: 28,
  },
  h3: {
    fontSize: 19,
    fontWeight: '600',
    color: '#222',
    marginTop: 20,
    marginBottom: 8,
    lineHeight: 24,
  },
  h4: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 6,
  },
  imageBlock: {
    marginVertical: 16,
  },
  bodyImage: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  imageCaption: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#ddd',
    paddingLeft: 16,
    marginVertical: 16,
    marginLeft: 4,
  },
  blockquoteText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#444',
    fontStyle: 'italic',
  },
  attribution: {
    fontSize: 14,
    color: '#888',
    marginTop: 6,
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
  },
  codeLanguage: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  codeText: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: '#d4d4d4',
    lineHeight: 20,
  },
  listBlock: {
    marginVertical: 8,
    marginLeft: 4,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  listBullet: {
    fontSize: 17,
    color: '#444',
    width: 24,
    lineHeight: 27,
  },
  listText: {
    fontSize: 17,
    lineHeight: 27,
    color: '#222',
    flex: 1,
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 24,
  },
});
