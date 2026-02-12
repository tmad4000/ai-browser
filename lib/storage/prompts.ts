import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { SitePrompt, MatchPattern } from '../../types/prompts';

const PROMPTS_KEY = 'ai_browser_prompts';

export async function getAllPrompts(): Promise<SitePrompt[]> {
  try {
    const stored = await AsyncStorage.getItem(PROMPTS_KEY);
    if (!stored) return getBuiltinPrompts();
    const prompts = JSON.parse(stored) as SitePrompt[];
    return prompts.length > 0 ? prompts : getBuiltinPrompts();
  } catch {
    return getBuiltinPrompts();
  }
}

export async function savePrompt(prompt: SitePrompt): Promise<void> {
  const prompts = await getAllPrompts();
  const index = prompts.findIndex(p => p.id === prompt.id);
  if (index >= 0) {
    prompts[index] = { ...prompt, updatedAt: Date.now(), version: prompt.version + 1 };
  } else {
    prompts.push({ ...prompt, createdAt: Date.now(), updatedAt: Date.now() });
  }
  await AsyncStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
}

export async function deletePrompt(id: string): Promise<void> {
  const prompts = await getAllPrompts();
  const filtered = prompts.filter(p => p.id !== id);
  await AsyncStorage.setItem(PROMPTS_KEY, JSON.stringify(filtered));
}

export function matchUrlToPrompt(url: string, prompts: SitePrompt[]): SitePrompt | null {
  const enabled = prompts.filter(p => p.enabled);
  const sorted = enabled.sort((a, b) => b.priority - a.priority);

  for (const prompt of sorted) {
    for (const pattern of prompt.matchPatterns) {
      if (matchesPattern(url, pattern)) {
        return prompt;
      }
    }
  }

  return null;
}

function matchesPattern(url: string, pattern: MatchPattern): boolean {
  switch (pattern.type) {
    case 'exact':
      return url === pattern.pattern;
    case 'glob':
      return matchGlob(url, pattern.pattern);
    case 'regex':
      try {
        return new RegExp(pattern.pattern).test(url);
      } catch {
        return false;
      }
    default:
      return false;
  }
}

function matchGlob(url: string, pattern: string): boolean {
  // Convert glob to regex
  const regex = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  try {
    return new RegExp(`^${regex}$`).test(url);
  } catch {
    return false;
  }
}

export function createPrompt(partial: Partial<SitePrompt>): SitePrompt {
  return {
    id: Crypto.randomUUID(),
    name: partial.name || 'New Prompt',
    matchPatterns: partial.matchPatterns || [],
    priority: partial.priority || 0,
    prompt: partial.prompt || '',
    outputSchema: partial.outputSchema || 'article',
    provider: partial.provider,
    model: partial.model,
    enabled: partial.enabled ?? true,
    version: 1,
    category: partial.category || 'custom',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function getBuiltinPrompts(): SitePrompt[] {
  return [
    createPrompt({
      id: 'builtin-twitter',
      name: 'Twitter / X',
      matchPatterns: [
        { type: 'glob', pattern: 'https://twitter.com/*' },
        { type: 'glob', pattern: 'https://x.com/*' },
        { type: 'glob', pattern: 'https://mobile.twitter.com/*' },
      ],
      priority: 10,
      prompt: 'Extract all tweets/posts visible on this page as a feed. For each tweet, extract the author (name, handle, verified status), full text content, any media (images, videos), engagement metrics (likes, retweets, replies, views), and timestamp. Skip promoted/sponsored tweets by setting isPromoted to true. {{schema:feed}}',
      outputSchema: 'feed',
      category: 'social',
    }),
    createPrompt({
      id: 'builtin-hackernews',
      name: 'Hacker News',
      matchPatterns: [
        { type: 'glob', pattern: 'https://news.ycombinator.com/*' },
      ],
      priority: 10,
      prompt: 'Extract all stories/posts from this Hacker News page as a feed. For each item, the author is the submitter, content text is the title (and any link URL), engagement should include the points count and comment count. Include the link URL as a media item of type "link" if present. {{schema:feed}}',
      outputSchema: 'feed',
      category: 'news',
    }),
    createPrompt({
      id: 'builtin-reddit',
      name: 'Reddit',
      matchPatterns: [
        { type: 'glob', pattern: 'https://www.reddit.com/*' },
        { type: 'glob', pattern: 'https://old.reddit.com/*' },
      ],
      priority: 10,
      prompt: 'Extract all posts from this Reddit page as a feed. For each post, extract the author, title and content text, subreddit, upvotes, and comment count. Include any thumbnail or media. {{schema:feed}}',
      outputSchema: 'feed',
      category: 'social',
    }),
    createPrompt({
      id: 'builtin-amazon',
      name: 'Amazon Product',
      matchPatterns: [
        { type: 'regex', pattern: 'https://(www\\.)?amazon\\.(com|co\\.uk|ca|de|fr|it|es)/.*/(dp|gp/product)/.*' },
      ],
      priority: 10,
      prompt: 'Extract the product information from this Amazon page. Include the product name, brand, price (with any discounts), all product images, star rating and review count, full description, bullet-point features as specs, availability status, and top customer reviews. {{schema:product}}',
      outputSchema: 'product',
      category: 'shopping',
    }),
    createPrompt({
      id: 'builtin-google-search',
      name: 'Google Search',
      matchPatterns: [
        { type: 'glob', pattern: 'https://www.google.com/search*' },
      ],
      priority: 10,
      prompt: 'Extract the search results from this Google search page. Include the search query, any featured snippet at the top, all organic search results (title, URL, snippet text), and related searches at the bottom. Skip ads. {{schema:search}}',
      outputSchema: 'search',
      category: 'search',
    }),
  ];
}
