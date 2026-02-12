import { SchemaOutput, SchemaType } from '../../types/schemas';

export function validateSchemaOutput(data: any): { valid: boolean; type?: SchemaType; errors?: string[] } {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Response is not an object'] };
  }

  const type = data.type as SchemaType;
  if (!type) {
    // Try to infer type from shape
    if (data.items && Array.isArray(data.items)) {
      data.type = 'feed';
      return { valid: true, type: 'feed' };
    }
    if (data.body && Array.isArray(data.body)) {
      data.type = 'article';
      return { valid: true, type: 'article' };
    }
    if (data.price) {
      data.type = 'product';
      return { valid: true, type: 'product' };
    }
    if (data.results && Array.isArray(data.results)) {
      data.type = 'search';
      return { valid: true, type: 'search' };
    }
    return { valid: false, errors: ['Missing "type" field and could not infer type'] };
  }

  const validators: Record<string, (d: any) => string[]> = {
    feed: validateFeed,
    article: validateArticle,
    product: validateProduct,
    search: validateSearch,
    profile: validateProfile,
  };

  const validator = validators[type];
  if (!validator) {
    return { valid: false, errors: [`Unknown schema type: ${type}`] };
  }

  const errors = validator(data);
  return errors.length === 0
    ? { valid: true, type }
    : { valid: false, type, errors };
}

function validateFeed(data: any): string[] {
  const errors: string[] = [];
  if (!Array.isArray(data.items)) errors.push('Feed must have an "items" array');
  return errors;
}

function validateArticle(data: any): string[] {
  const errors: string[] = [];
  if (!data.title) errors.push('Article must have a "title"');
  if (!Array.isArray(data.body)) errors.push('Article must have a "body" array');
  return errors;
}

function validateProduct(data: any): string[] {
  const errors: string[] = [];
  if (!data.name) errors.push('Product must have a "name"');
  if (!data.price) errors.push('Product must have a "price"');
  return errors;
}

function validateSearch(data: any): string[] {
  const errors: string[] = [];
  if (!Array.isArray(data.results)) errors.push('Search must have a "results" array');
  return errors;
}

function validateProfile(data: any): string[] {
  const errors: string[] = [];
  if (!data.name) errors.push('Profile must have a "name"');
  return errors;
}
