export const normalizeError = (value: unknown, fallbackMessage?: string): string | null => {
  if (value instanceof Error) return value.message
  if (typeof value === 'string') return value
  if (value && fallbackMessage) return fallbackMessage
  return null
}
