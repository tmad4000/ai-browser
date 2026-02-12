import { SitePrompt, GlobalConfig, DEFAULT_SYSTEM_PROMPT } from '../../types/prompts';
import { SCHEMA_DEFINITIONS } from '../schemas/builtin';

interface PageContext {
  url: string;
  domain: string;
  title: string;
  contentType: string;
}

export function buildSystemPrompt(globalConfig: GlobalConfig): string {
  return globalConfig.systemPrompt || DEFAULT_SYSTEM_PROMPT;
}

export function buildUserPrompt(
  sitePrompt: SitePrompt | null,
  pageContext: PageContext,
  content: string,
  globalConfig: GlobalConfig
): string {
  const schemaType = sitePrompt?.outputSchema || detectSchemaType(pageContext.contentType);
  const schemaDefinition = SCHEMA_DEFINITIONS[schemaType] || SCHEMA_DEFINITIONS.raw;

  let prompt = '';

  // If there's a site-specific prompt, resolve its template variables
  if (sitePrompt) {
    prompt = resolveTemplateVariables(sitePrompt.prompt, {
      page: pageContext,
      schema: schemaDefinition,
      user: globalConfig.preferences,
    });
  } else {
    // Default prompt based on detected content type
    prompt = getDefaultPrompt(schemaType);
  }

  return `${prompt}

## Output Schema
Return a JSON object matching this schema:
${schemaDefinition}

## Page Information
- URL: ${pageContext.url}
- Title: ${pageContext.title}
- Domain: ${pageContext.domain}

## Page Content
${content}`;
}

function resolveTemplateVariables(
  template: string,
  context: {
    page: PageContext;
    schema: string;
    user: GlobalConfig['preferences'];
  }
): string {
  return template
    .replace(/\{\{schema:(\w+)\}\}/g, (_, type) => SCHEMA_DEFINITIONS[type] || '')
    .replace(/\{\{page\.url\}\}/g, context.page.url)
    .replace(/\{\{page\.domain\}\}/g, context.page.domain)
    .replace(/\{\{page\.title\}\}/g, context.page.title)
    .replace(/\{\{page\.contentType\}\}/g, context.page.contentType)
    .replace(/\{\{user\.language\}\}/g, context.user.language)
    .replace(/\{\{user\.displayDensity\}\}/g, context.user.displayDensity);
}

function detectSchemaType(contentType: string): string {
  switch (contentType) {
    case 'feed': return 'feed';
    case 'article': return 'article';
    case 'product': return 'product';
    case 'search': return 'search';
    default: return 'article'; // Default to article extraction
  }
}

function getDefaultPrompt(schemaType: string): string {
  switch (schemaType) {
    case 'feed':
      return `Extract all feed items/posts from this page. For each item, extract the author information, content text, any media attachments, engagement metrics (likes, reposts, replies), and timestamp. Skip any promoted/sponsored content. Return as a feed schema.`;
    case 'article':
      return `Extract the main article content from this page. Include the title, authors, publication date, and full body content broken into structured blocks (paragraphs, headings, images, blockquotes, code blocks, lists). Calculate an estimated reading time. Return as an article schema.`;
    case 'product':
      return `Extract product information from this page. Include the product name, brand, price (with any discounts), images, rating, description, specifications, availability, and customer reviews. Return as a product schema.`;
    case 'search':
      return `Extract search results from this page. Include the search query, any featured snippet, all result items (title, URL, snippet), and related searches. Return as a search results schema.`;
    default:
      return `Extract the main content from this page in a structured format. Identify the most appropriate schema type and extract accordingly.`;
  }
}
