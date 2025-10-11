type Environment = 'development' | 'uat' | 'production'

const DEFAULT_CORE_url_BASE_URL: Record<Environment, string> = {
  development: 'http://localhost:3000',
  uat: 'https://example.com',
  production: 'https://example.com',
}

const resolveEnvironment = (): Environment => {
  const mode = (import.meta.env.MODE || 'development').toLowerCase()

  if (mode === 'uat') {
    return 'uat'
  }

  if (mode === 'production') {
    return 'production'
  }

  return 'development'
}

const currentEnv = resolveEnvironment()

const stripTrailingSlash = (value?: string) => value?.replace(/\/$/, '')

const url = {
  core:
    stripTrailingSlash(import.meta.env.VITE_url_BASE_URL as string | undefined) ||
    DEFAULT_CORE_url_BASE_URL[currentEnv],
}

export const appConfig = {
  env: currentEnv,
  url,
} as const

export type AppConfig = typeof appConfig
