const CONSUMED_PREFIX = 'ai-gen-consumed:'

export function getConsumedGenerationJobId(lessonId: string): string | null {
  try {
    return sessionStorage.getItem(`${CONSUMED_PREFIX}${lessonId}`)
  } catch {
    return null
  }
}

export function markGenerationJobConsumed(lessonId: string, jobId: string): void {
  try {
    sessionStorage.setItem(`${CONSUMED_PREFIX}${lessonId}`, jobId)
  } catch {
    // ignore quota / private mode
  }
}

export function clearConsumedGenerationJob(lessonId: string): void {
  try {
    sessionStorage.removeItem(`${CONSUMED_PREFIX}${lessonId}`)
  } catch {
    // ignore
  }
}
