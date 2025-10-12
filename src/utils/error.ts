export const normalizeError = (value: unknown): string | null =>
  value instanceof Error ? value.message : typeof value === 'string' ? value : null
