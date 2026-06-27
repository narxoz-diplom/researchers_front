import { api } from '@/shared/api/axios'
import { AI_ENDPOINTS } from './endpoints'
import type {
  AiModelsResponse,
  AuthorAiSettings,
  GenerateLessonContentPayload,
  GenerateLessonContentResponse,
  LessonChatPayload,
  LessonChatResponse,
  LessonGenerationJobStatus,
  StartLessonGenerationResponse,
  UpdateAuthorAiSettingsPayload,
} from './types'

const GENERATION_POLL_MS = 2000
const GENERATION_POLL_MAX_ATTEMPTS = 150

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function pollGenerationJob(
  lessonId: string,
  jobId: string,
): Promise<GenerateLessonContentResponse> {
  for (let attempt = 0; attempt < GENERATION_POLL_MAX_ATTEMPTS; attempt += 1) {
    const job = await aiApi.getGenerationJob(lessonId, jobId)

    if (job.status === 'completed') {
      if (!job.content?.trim()) {
        throw new Error('AI_SERVICE_UNAVAILABLE')
      }

      return {
        content: job.content,
        title: job.title,
        usage: job.usage,
        requestId: job.requestId,
      }
    }

    if (job.status === 'failed') {
      throw {
        response: { data: { message: job.errorCode ?? 'AI_SERVICE_UNAVAILABLE' } },
      }
    }

    await sleep(GENERATION_POLL_MS)
  }

  throw new Error('AI_SERVICE_UNAVAILABLE')
}

export const aiApi = {
  listModels: () => api.get<AiModelsResponse>(AI_ENDPOINTS.models).then((r) => r.data),

  getSettings: () => api.get<AuthorAiSettings>(AI_ENDPOINTS.settings).then((r) => r.data),

  updateSettings: (payload: UpdateAuthorAiSettingsPayload) =>
    api.patch<AuthorAiSettings>(AI_ENDPOINTS.settings, payload).then((r) => r.data),

  deleteSettings: () => api.delete<AuthorAiSettings>(AI_ENDPOINTS.settings).then((r) => r.data),

  startLessonGeneration: (lessonId: string, payload: GenerateLessonContentPayload) =>
    api
      .post<StartLessonGenerationResponse>(AI_ENDPOINTS.generate(lessonId), payload)
      .then((r) => r.data),

  getGenerationJob: (lessonId: string, jobId: string) =>
    api
      .get<LessonGenerationJobStatus>(AI_ENDPOINTS.generationJob(lessonId, jobId))
      .then((r) => r.data),

  getLatestGenerationJob: (lessonId: string) =>
    api
      .get<LessonGenerationJobStatus | null>(AI_ENDPOINTS.generationLatest(lessonId))
      .then((r) => r.data),

  generateLessonContent: async (
    lessonId: string,
    payload: GenerateLessonContentPayload,
  ): Promise<GenerateLessonContentResponse> => {
    const start = await aiApi.startLessonGeneration(lessonId, payload)
    return pollGenerationJob(lessonId, start.jobId)
  },

  chatOnLesson: (lessonId: string, payload: LessonChatPayload) =>
    api.post<LessonChatResponse>(AI_ENDPOINTS.chat(lessonId), payload).then((r) => r.data),
}

export const aiQueryKeys = {
  settings: ['ai', 'settings'] as const,
  models: ['ai', 'models'] as const,
  generationLatest: (lessonId: string) => ['ai', 'generation', lessonId, 'latest'] as const,
}
