import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'ai_cache_';
const CACHE_INDEX_KEY = 'ai_cache_index';
const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_ENTRIES = 200;

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
  size: number;
}

interface CacheIndex {
  entries: { key: string; timestamp: number; size: number }[];
}

export async function getCachedResult(key: string): Promise<any | null> {
  try {
    const stored = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!stored) return null;

    const entry: CacheEntry = JSON.parse(stored);
    const now = Date.now();

    if (now - entry.timestamp > entry.ttl) {
      // Expired — remove it
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export async function setCachedResult(key: string, data: any, ttl = DEFAULT_TTL): Promise<void> {
  try {
    const serialized = JSON.stringify(data);
    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl,
      size: serialized.length,
    };

    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));

    // Update index
    await updateCacheIndex(key, entry.timestamp, entry.size);
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

async function updateCacheIndex(key: string, timestamp: number, size: number): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    const index: CacheIndex = stored ? JSON.parse(stored) : { entries: [] };

    // Remove existing entry for this key
    index.entries = index.entries.filter(e => e.key !== key);
    index.entries.push({ key, timestamp, size });

    // Evict oldest entries if over limit
    if (index.entries.length > MAX_CACHE_ENTRIES) {
      index.entries.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = index.entries.splice(0, index.entries.length - MAX_CACHE_ENTRIES);
      for (const entry of toRemove) {
        await AsyncStorage.removeItem(CACHE_PREFIX + entry.key);
      }
    }

    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.error('Cache index error:', error);
  }
}

export async function clearCache(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    if (stored) {
      const index: CacheIndex = JSON.parse(stored);
      for (const entry of index.entries) {
        await AsyncStorage.removeItem(CACHE_PREFIX + entry.key);
      }
    }
    await AsyncStorage.removeItem(CACHE_INDEX_KEY);
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

export async function getCacheSize(): Promise<{ entries: number; estimatedBytes: number }> {
  try {
    const stored = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    if (!stored) return { entries: 0, estimatedBytes: 0 };

    const index: CacheIndex = JSON.parse(stored);
    const totalSize = index.entries.reduce((sum, e) => sum + e.size, 0);
    return { entries: index.entries.length, estimatedBytes: totalSize };
  } catch {
    return { entries: 0, estimatedBytes: 0 };
  }
}
