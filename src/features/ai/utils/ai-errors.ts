import type { TFunction } from 'i18next'
import { toast } from 'sonner'
import { extractApiError } from '@/shared/api/axios'

const AI_ERROR_CODES = [
  'CHAT_LIMIT_EXCEEDED',
  'AUTHOR_AI_KEY_REQUIRED',
  'AUTHOR_AI_KEY_INVALID',
  'AI_SERVICE_UNAVAILABLE',
  'LESSON_INDEX_IN_PROGRESS',
  'LESSON_INDEX_FAILED',
] as const

type AiErrorCode = (typeof AI_ERROR_CODES)[number]

function isAiErrorCode(code: string | undefined): code is AiErrorCode {
  return AI_ERROR_CODES.includes(code as AiErrorCode)
}

export function translateAiError(code: string | undefined, t: TFunction): string | null {
  if (!code || !isAiErrorCode(code)) return null
  return t(`ai.errors.${code}`)
}

export function showAiErrorToast(err: unknown, t: TFunction, fallbackKey = 'ai.errors.generic'): void {
  const apiErr = extractApiError(err)
  const translated = translateAiError(apiErr?.message, t)
  toast.error(translated ?? t(fallbackKey))
}

export function isAiError(err: unknown, code: AiErrorCode): boolean {
  const apiErr = extractApiError(err)
  return apiErr?.message === code
}
