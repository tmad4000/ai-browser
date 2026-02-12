export interface AIProvider {
  name: string;
  complete(system: string, userMessage: string, jsonMode?: boolean): Promise<string>;
}

export interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface TransformRequest {
  url: string;
  title: string;
  content: string;
  contentType: 'article' | 'feed' | 'product' | 'search' | 'unknown';
  meta?: Record<string, string>;
  jsonLd?: any;
}

export interface TransformResult {
  success: boolean;
  data?: any;
  schemaType?: string;
  error?: string;
  raw?: string;
}

export type ContentType = 'article' | 'feed' | 'product' | 'search' | 'profile' | 'unknown';

export interface ExtractedContent {
  url: string;
  title: string;
  content: string;
  contentType: ContentType;
  meta: Record<string, string>;
  jsonLd?: any;
  feedItems?: string[];
}
