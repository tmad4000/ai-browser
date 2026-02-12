import { ContentType, ExtractedContent } from '../../types/ai';

interface RawExtraction {
  type: 'extraction';
  url: string;
  title: string;
  content: string;
  contentType: ContentType;
  meta: Record<string, string>;
  jsonLd?: any;
  feedItems?: string[];
  timestamp: number;
}

interface NavigationEvent {
  type: 'navigation';
  url: string;
  title: string;
}

interface ExtractionError {
  type: 'extraction_error';
  error: string;
  url: string;
}

export type WebViewMessage = RawExtraction | NavigationEvent | ExtractionError;

export function parseWebViewMessage(data: string): WebViewMessage | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed.type === 'extraction' || parsed.type === 'navigation' || parsed.type === 'extraction_error') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function processExtraction(raw: RawExtraction): ExtractedContent {
  let content = raw.content;

  // If we have feed items, format them as numbered list for the LLM
  if (raw.feedItems && raw.feedItems.length > 0) {
    const feedContent = raw.feedItems
      .map((item, i) => `--- Item ${i + 1} ---\n${item}`)
      .join('\n\n');
    content = feedContent;
  }

  // Truncate if too long (stay well within context limits)
  if (content.length > 80000) {
    content = content.substring(0, 80000) + '\n\n[Content truncated]';
  }

  return {
    url: raw.url,
    title: raw.title,
    content,
    contentType: raw.contentType,
    meta: raw.meta || {},
    jsonLd: raw.jsonLd,
    feedItems: raw.feedItems,
  };
}

export function computeContentHash(content: string): string {
  // Simple hash for cache keys
  let hash = 0;
  for (let i = 0; i < Math.min(content.length, 10000); i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
