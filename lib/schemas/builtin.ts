export const SCHEMA_DEFINITIONS: Record<string, string> = {
  feed: `{
  "type": "feed",
  "title": "string | null (feed title)",
  "items": [
    {
      "id": "string (unique identifier)",
      "author": {
        "name": "string",
        "handle": "string | null (@username)",
        "avatarUrl": "string | null (URL to avatar image)",
        "verified": "boolean | null"
      },
      "content": {
        "text": "string (plain text content)",
        "html": "string | null (rich HTML content)"
      },
      "media": [
        {
          "type": "'image' | 'video' | 'link'",
          "url": "string",
          "thumbnailUrl": "string | null",
          "alt": "string | null"
        }
      ] | null,
      "engagement": {
        "likes": "number | null",
        "reposts": "number | null",
        "replies": "number | null",
        "views": "number | null"
      } | null,
      "timestamp": "string | null (ISO 8601)",
      "permalink": "string | null (URL to original post)",
      "isPromoted": "boolean (true if sponsored/promoted)"
    }
  ]
}`,

  article: `{
  "type": "article",
  "title": "string",
  "subtitle": "string | null",
  "authors": [{ "name": "string", "url": "string | null" }],
  "publishedAt": "string | null (ISO 8601)",
  "updatedAt": "string | null (ISO 8601)",
  "source": { "name": "string", "url": "string" },
  "body": [
    { "type": "paragraph", "text": "string" },
    { "type": "heading", "level": "1-6", "text": "string" },
    { "type": "image", "url": "string", "caption": "string | null", "alt": "string | null" },
    { "type": "blockquote", "text": "string", "attribution": "string | null" },
    { "type": "code", "language": "string | null", "code": "string" },
    { "type": "list", "ordered": "boolean", "items": ["string"] },
    { "type": "separator" }
  ],
  "readingTimeMinutes": "number | null",
  "tags": ["string"] | null,
  "heroImage": { "url": "string", "caption": "string | null" } | null
}`,

  product: `{
  "type": "product",
  "name": "string",
  "brand": "string | null",
  "price": {
    "amount": "number",
    "currency": "string (e.g. 'USD')",
    "originalAmount": "number | null (before discount)",
    "discount": "string | null (e.g. '20% off')"
  },
  "images": [{ "url": "string", "alt": "string | null" }],
  "rating": {
    "score": "number",
    "maxScore": "number",
    "count": "number"
  } | null,
  "description": "string | null",
  "specs": [{ "label": "string", "value": "string" }] | null,
  "availability": "'in_stock' | 'out_of_stock' | 'limited' | 'preorder' | null",
  "reviews": [
    {
      "author": "string",
      "rating": "number",
      "text": "string",
      "date": "string | null"
    }
  ] | null,
  "url": "string"
}`,

  search: `{
  "type": "search",
  "query": "string",
  "featuredSnippet": {
    "title": "string",
    "content": "string",
    "sourceUrl": "string"
  } | null,
  "results": [
    {
      "title": "string",
      "url": "string",
      "snippet": "string",
      "favicon": "string | null",
      "siteDisplayName": "string | null"
    }
  ],
  "relatedSearches": ["string"] | null,
  "totalResults": "string | null"
}`,

  profile: `{
  "type": "profile",
  "name": "string",
  "handle": "string | null",
  "avatarUrl": "string | null",
  "bio": "string | null",
  "verified": "boolean | null",
  "stats": [{ "label": "string", "value": "string | number" }] | null,
  "links": [{ "label": "string", "url": "string" }] | null,
  "location": "string | null",
  "joinedDate": "string | null"
}`,

  raw: `Return the content as clean markdown text. Structure it with appropriate headings, lists, and formatting.`,
};

export const SCHEMA_DISPLAY_NAMES: Record<string, string> = {
  feed: 'Feed',
  article: 'Article',
  product: 'Product',
  search: 'Search Results',
  profile: 'Profile',
  raw: 'Raw (Markdown)',
};

export const SCHEMA_TYPES = Object.keys(SCHEMA_DEFINITIONS);
