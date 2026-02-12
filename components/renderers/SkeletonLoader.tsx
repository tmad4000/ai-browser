import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface SkeletonLoaderProps {
  type?: 'feed' | 'article' | 'product' | 'search' | 'generic';
}

export function SkeletonLoader({ type = 'generic' }: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const renderSkeleton = () => {
    switch (type) {
      case 'feed':
        return (
          <>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={styles.feedCard}>
                <View style={styles.feedHeader}>
                  <Animated.View style={[styles.circle, { opacity }]} />
                  <View style={styles.feedHeaderText}>
                    <Animated.View style={[styles.bar, styles.barShort, { opacity }]} />
                    <Animated.View style={[styles.bar, styles.barTiny, { opacity }]} />
                  </View>
                </View>
                <Animated.View style={[styles.bar, styles.barFull, { opacity }]} />
                <Animated.View style={[styles.bar, styles.barMedium, { opacity }]} />
                <Animated.View style={[styles.bar, styles.barLong, { opacity }]} />
              </View>
            ))}
          </>
        );

      case 'article':
        return (
          <View style={styles.articleSkeleton}>
            <Animated.View style={[styles.heroSkeleton, { opacity }]} />
            <View style={{ padding: 20 }}>
              <Animated.View style={[styles.bar, styles.barFull, styles.barTall, { opacity }]} />
              <Animated.View style={[styles.bar, styles.barLong, styles.barTall, { opacity }]} />
              <View style={{ marginTop: 16 }}>
                <Animated.View style={[styles.bar, styles.barShort, { opacity }]} />
              </View>
              <View style={{ marginTop: 24 }}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <Animated.View key={i} style={[styles.bar, styles.barFull, { opacity, marginBottom: 10 }]} />
                ))}
              </View>
            </View>
          </View>
        );

      default:
        return (
          <View style={{ padding: 20 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <Animated.View
                key={i}
                style={[
                  styles.bar,
                  i % 3 === 0 ? styles.barLong : styles.barFull,
                  { opacity, marginBottom: 12 },
                ]}
              />
            ))}
          </View>
        );
    }
  };

  return <View style={styles.container}>{renderSkeleton()}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  feedCard: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  feedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  feedHeaderText: { marginLeft: 10, flex: 1 },
  circle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e0e0e0' },
  bar: { height: 12, backgroundColor: '#e0e0e0', borderRadius: 6, marginBottom: 6 },
  barTiny: { width: '30%' },
  barShort: { width: '40%' },
  barMedium: { width: '60%' },
  barLong: { width: '80%' },
  barFull: { width: '100%' },
  barTall: { height: 20 },
  heroSkeleton: { width: '100%', height: 200, backgroundColor: '#e8e8e8' },
  articleSkeleton: {},
});
