export const AI_ENDPOINTS = {
  models: '/ai/models',
  settings: '/users/me/ai-settings',
  generate: (lessonId: string) => `/lessons/${lessonId}/generate`,
  generationJob: (lessonId: string, jobId: string) =>
    `/lessons/${lessonId}/generate/jobs/${jobId}`,
  generationLatest: (lessonId: string) => `/lessons/${lessonId}/generate/latest`,
  chat: (lessonId: string) => `/lessons/${lessonId}/chat`,
} as const
