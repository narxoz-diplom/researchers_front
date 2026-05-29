const API_PREFIX = '/api/v1'

/** Ensures base URL always ends with `/api/v1` (GitHub var often omits the suffix). */
export function normalizeApiBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, '')
  if (trimmed.endsWith(API_PREFIX)) return trimmed
  return `${trimmed}${API_PREFIX}`
}

/** API base URL baked at build time; falls back to same-origin /api/v1 in production. */
export function getApiBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_API_URL as string | undefined)?.trim()
  const isLocalDevUrl =
    !!fromEnv && /localhost|127\.0\.0\.1/i.test(fromEnv)

  if (fromEnv && !(import.meta.env.PROD && isLocalDevUrl)) {
    return normalizeApiBaseUrl(fromEnv)
  }

  if (import.meta.env.PROD && typeof window !== 'undefined') {
    return normalizeApiBaseUrl(window.location.origin)
  }

  return 'http://localhost:8080/api/v1'
}
