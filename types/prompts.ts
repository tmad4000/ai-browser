export interface MatchPattern {
  type: 'exact' | 'glob' | 'regex';
  pattern: string;
}

export interface SitePrompt {
  id: string;
  name: string;
  matchPatterns: MatchPattern[];
  priority: number;
  prompt: string;
  outputSchema: string; // "feed" | "article" | "product" | "search" | "profile" | "raw"
  provider?: string;
  model?: string;
  enabled: boolean;
  version: number;
  category?: 'social' | 'news' | 'shopping' | 'search' | 'custom';
  createdAt: number;
  updatedAt: number;
}

export interface ProviderConfig {
  apiKey: string;
  models: string[];
}

export interface GlobalConfig {
  systemPrompt: string;
  defaultProvider: string;
  defaultModel: string;
  providers: Record<string, ProviderConfig>;
  preferences: {
    language: string;
    hideAds: boolean;
    displayDensity: 'compact' | 'comfortable' | 'spacious';
  };
}

export const DEFAULT_SYSTEM_PROMPT = `You are a content extraction AI. Given a webpage's content, extract structured data according to the provided schema.

Rules:
- Extract ONLY factual content from the page
- Do NOT invent or hallucinate any information
- If a field cannot be determined, use null
- Return valid JSON matching the schema exactly
- For timestamps, use ISO 8601 format
- For content text, preserve original wording
- Strip ads, navigation, footers, and other non-content elements`;

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  defaultProvider: 'google',
  defaultModel: 'gemini-2.5-flash-preview-05-20',
  providers: {},
  preferences: {
    language: 'en',
    hideAds: true,
    displayDensity: 'comfortable',
  },
};
