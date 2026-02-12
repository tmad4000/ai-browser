import { SCHEMA_DEFINITIONS, SCHEMA_TYPES } from './builtin';

export function getSchemaDefinition(type: string): string | null {
  return SCHEMA_DEFINITIONS[type] || null;
}

export function getAllSchemaTypes(): string[] {
  return [...SCHEMA_TYPES];
}

export function isValidSchemaType(type: string): boolean {
  return type in SCHEMA_DEFINITIONS;
}
