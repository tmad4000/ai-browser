import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { FeedSchema, FeedItem } from '../../types/schemas';

interface FeedRendererProps {
  data: FeedSchema;
}

export function FeedRenderer({ data }: FeedRendererProps) {
  const items = data.items.filter(item => !item.isPromoted);

  return (
    <FlatList
      data={items}
      keyExtractor={(item, index) => item.id || `feed-${index}`}
      renderItem={({ item }) => <FeedCard item={item} />}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const handlePress = () => {
    if (item.permalink) {
      Linking.openURL(item.permalink);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        {item.author.avatarUrl ? (
          <Image source={{ uri: item.author.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {item.author.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View style={styles.authorInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.authorName} numberOfLines={1}>
              {item.author.name}
            </Text>
            {item.author.verified && (
              <Text style={styles.verified}>✓</Text>
            )}
          </View>
          {item.author.handle && (
            <Text style={styles.handle} numberOfLines={1}>
              @{item.author.handle.replace('@', '')}
            </Text>
          )}
        </View>
        {item.timestamp && (
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        )}
      </View>

      <Text style={styles.contentText}>{item.content.text}</Text>

      {item.media && item.media.length > 0 && (
        <View style={styles.mediaContainer}>
          {item.media.slice(0, 4).map((media, i) => (
            <Image
              key={i}
              source={{ uri: media.thumbnailUrl || media.url }}
              style={[
                styles.mediaImage,
                item.media!.length === 1 && styles.mediaImageSingle,
              ]}
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      {item.engagement && (
        <View style={styles.engagement}>
          {item.engagement.replies != null && (
            <Text style={styles.engagementText}>
              💬 {formatCount(item.engagement.replies)}
            </Text>
          )}
          {item.engagement.reposts != null && (
            <Text style={styles.engagementText}>
              🔁 {formatCount(item.engagement.reposts)}
            </Text>
          )}
          {item.engagement.likes != null && (
            <Text style={styles.engagementText}>
              ♥ {formatCount(item.engagement.likes)}
            </Text>
          )}
          {item.engagement.views != null && (
            <Text style={styles.engagementText}>
              👁 {formatCount(item.engagement.views)}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

const styles = StyleSheet.create({
  list: {
    padding: 0,
  },
  separator: {
    height: 1,
    backgroundColor: '#e8e8e8',
  },
  card: {
    padding: 16,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  avatarPlaceholder: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  verified: {
    fontSize: 14,
    color: '#1d9bf0',
    marginLeft: 4,
  },
  handle: {
    fontSize: 14,
    color: '#666',
    marginTop: 1,
  },
  timestamp: {
    fontSize: 13,
    color: '#888',
  },
  contentText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#111',
    marginBottom: 8,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    gap: 2,
  },
  mediaImage: {
    width: '49%',
    aspectRatio: 16 / 9,
    backgroundColor: '#f0f0f0',
  },
  mediaImageSingle: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  engagement: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 4,
  },
  engagementText: {
    fontSize: 13,
    color: '#666',
  },
});
