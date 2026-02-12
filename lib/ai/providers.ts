import { AIProvider, AIProviderConfig } from '../../types/ai';

class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private apiKey: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
  }

  async complete(system: string, userMessage: string, jsonMode?: boolean): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const textBlock = data.content?.find((b: any) => b.type === 'text');
    return textBlock?.text || '';
  }
}

class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
  }

  async complete(system: string, userMessage: string, jsonMode?: boolean): Promise<string> {
    const body: any = {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 8192,
    };

    if (jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
}

class GoogleProvider implements AIProvider {
  name = 'google';
  private apiKey: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
  }

  async complete(system: string, userMessage: string, jsonMode?: boolean): Promise<string> {
    const model = 'gemini-2.5-flash-preview-05-20';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const body: any = {
      system_instruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: userMessage }] }],
      generationConfig: {
        maxOutputTokens: 8192,
      },
    };

    if (jsonMode) {
      body.generationConfig.responseMimeType = 'application/json';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

export function createProvider(name: string, config: AIProviderConfig): AIProvider {
  switch (name) {
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'google':
      return new GoogleProvider(config);
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}

export const PROVIDER_MODELS: Record<string, string[]> = {
  anthropic: ['claude-sonnet-4-20250514', 'claude-haiku-4-20250414'],
  openai: ['gpt-4o', 'gpt-4o-mini'],
  google: ['gemini-2.5-flash-preview-05-20', 'gemini-2.0-flash'],
};

export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  anthropic: 'Anthropic (Claude)',
  openai: 'OpenAI (GPT)',
  google: 'Google (Gemini)',
};
