// Feed Schema
export interface FeedItem {
  id: string;
  author: {
    name: string;
    handle?: string;
    avatarUrl?: string;
    verified?: boolean;
  };
  content: {
    text: string;
    html?: string;
  };
  media?: {
    type: 'image' | 'video' | 'link';
    url: string;
    thumbnailUrl?: string;
    alt?: string;
    width?: number;
    height?: number;
  }[];
  engagement?: {
    likes?: number;
    reposts?: number;
    replies?: number;
    views?: number;
  };
  timestamp?: string;
  permalink?: string;
  isPromoted?: boolean;
}

export interface FeedSchema {
  type: 'feed';
  title?: string;
  items: FeedItem[];
  nextPageUrl?: string;
}

// Article Schema
export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: 'image'; url: string; caption?: string; alt?: string }
  | { type: 'blockquote'; text: string; attribution?: string }
  | { type: 'code'; language?: string; code: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'separator' };

export interface ArticleSchema {
  type: 'article';
  title: string;
  subtitle?: string;
  authors: { name: string; url?: string }[];
  publishedAt?: string;
  updatedAt?: string;
  source: { name: string; url: string };
  body: ArticleBlock[];
  readingTimeMinutes?: number;
  tags?: string[];
  heroImage?: { url: string; caption?: string };
}

// Product Schema
export interface ProductSchema {
  type: 'product';
  name: string;
  brand?: string;
  price: {
    amount: number;
    currency: string;
    originalAmount?: number;
    discount?: string;
  };
  images: { url: string; alt?: string }[];
  rating?: {
    score: number;
    maxScore: number;
    count: number;
  };
  description?: string;
  specs?: { label: string; value: string }[];
  availability?: 'in_stock' | 'out_of_stock' | 'limited' | 'preorder';
  reviews?: {
    author: string;
    rating: number;
    text: string;
    date?: string;
  }[];
  url: string;
}

// Search Results Schema
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
  siteDisplayName?: string;
}

export interface SearchResultsSchema {
  type: 'search';
  query: string;
  featuredSnippet?: {
    title: string;
    content: string;
    sourceUrl: string;
  };
  results: SearchResult[];
  relatedSearches?: string[];
  totalResults?: string;
}

// Profile Schema
export interface ProfileSchema {
  type: 'profile';
  name: string;
  handle?: string;
  avatarUrl?: string;
  bio?: string;
  verified?: boolean;
  stats?: { label: string; value: string | number }[];
  links?: { label: string; url: string }[];
  location?: string;
  joinedDate?: string;
}

// Union type
export type SchemaOutput =
  | FeedSchema
  | ArticleSchema
  | ProductSchema
  | SearchResultsSchema
  | ProfileSchema;

export type SchemaType = SchemaOutput['type'];

// Extraction result
export interface ExtractionResult {
  url: string;
  schema: SchemaOutput;
  provider: string;
  model: string;
  extractedAt: number;
  cachedAt?: number;
  promptId?: string;
}
