import { ExtractedContent, TransformResult } from '../../types/ai';
import { SitePrompt, GlobalConfig, DEFAULT_GLOBAL_CONFIG } from '../../types/prompts';
import { SchemaOutput } from '../../types/schemas';
import { createProvider } from './providers';
import { buildSystemPrompt, buildUserPrompt } from './prompt-builder';
import { matchUrlToPrompt } from '../storage/prompts';
import { getSettings } from '../storage/settings';
import { getCachedResult, setCachedResult } from '../storage/cache';
import { computeContentHash } from '../extraction/content-processor';
import { logger } from '../logger';

export async function transformContent(
  extracted: ExtractedContent,
  sitePrompts: SitePrompt[]
): Promise<TransformResult> {
  try {
    const settings = await getSettings();
    const globalConfig: GlobalConfig = {
      ...DEFAULT_GLOBAL_CONFIG,
      ...settings,
    };

    // Find matching prompt for this URL
    const matchedPrompt = matchUrlToPrompt(extracted.url, sitePrompts);

    // Unsupported pages should degrade to a raw preview instead of forcing article JSON.
    if (!matchedPrompt && extracted.contentType === 'unknown') {
      return {
        success: false,
        raw: buildRawPreview(extracted),
      };
    }

    // Check cache
    const contentHash = computeContentHash(extracted.content);
    const cacheKey = `${extracted.url}:${matchedPrompt?.id || 'default'}:${matchedPrompt?.version || 0}:${contentHash}`;
    const cached = await getCachedResult(cacheKey);
    if (cached) {
      return { success: true, data: cached, schemaType: cached.type };
    }

    // Determine provider
    const providerName = matchedPrompt?.provider || globalConfig.defaultProvider;
    const providerConfig = globalConfig.providers[providerName];
    logger.info('Using provider', { provider: providerName, hasKey: !!providerConfig?.apiKey, matchedPrompt: matchedPrompt?.name });
    if (!providerConfig?.apiKey) {
      logger.error('No API key', { provider: providerName, availableProviders: Object.keys(globalConfig.providers) });
      return {
        success: false,
        error: `No API key configured for ${providerName}. Go to Settings to add one.`,
      };
    }

    const provider = createProvider(providerName, providerConfig);

    // Build prompts
    const domain = new URL(extracted.url).hostname;
    const systemPrompt = buildSystemPrompt(globalConfig);
    const userPrompt = buildUserPrompt(
      matchedPrompt,
      {
        url: extracted.url,
        domain,
        title: extracted.title,
        contentType: extracted.contentType,
      },
      extracted.content,
      globalConfig
    );

    // Call AI
    logger.info('Calling AI', { provider: providerName, contentLen: extracted.content.length });
    const response = await provider.complete(systemPrompt, userPrompt, true);
    logger.info('AI response received', { responseLen: response.length });

    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        error: 'AI response did not contain valid JSON',
        raw: response,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]) as SchemaOutput;

    // Cache the result
    await setCachedResult(cacheKey, parsed);

    return {
      success: true,
      data: parsed,
      schemaType: parsed.type,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown transformation error',
    };
  }
}

function buildRawPreview(extracted: ExtractedContent): string {
  const header = [`# ${extracted.title || 'Untitled Page'}`, '', `Source: ${extracted.url}`];
  const metaEntries = Object.entries(extracted.meta || {}).slice(0, 5);
  const metaSection = metaEntries.length > 0
    ? ['', '## Metadata', ...metaEntries.map(([key, value]) => `- ${key}: ${value}`)]
    : [];

  return [
    ...header,
    ...metaSection,
    '',
    '## Extracted Content',
    extracted.content || '_No extractable content found._',
  ].join('\n');
}
