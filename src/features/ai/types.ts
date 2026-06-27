export type LessonOutputLanguage = 'ru' | 'en' | 'kz'

export type LessonDepth = 'shallow' | 'medium' | 'deep'

export type LessonTargetAudience = 'school' | 'bachelor' | 'pro'

export type LessonOutputFormat = 'structured' | 'lecture' | 'seminar' | 'expert_brief'

export type LessonGenerationPhase = 'outline' | 'content'

export interface LlmUsageInfo {
  llmModelId: string
  provider: string
  providerModelId: string
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  usageSource?: string
}

export interface AiModel {
  id: string
  label: string
  provider: string
  recommendedForQuality?: boolean
}

export interface AiModelsResponse {
  models: AiModel[]
}

export interface AuthorAiSettings {
  hasApiKey: boolean
  keyHint?: string
}

export interface UpdateAuthorAiSettingsPayload {
  apiKey: string
}

export interface GenerateLessonContentPayload {
  language: LessonOutputLanguage
  brief: string
  llmModelId: string
  depth?: LessonDepth
  targetAudience?: LessonTargetAudience
  outputFormat?: LessonOutputFormat
  phase?: LessonGenerationPhase
  approvedOutline?: string
}

export interface GenerateLessonContentResponse {
  content: string
  title?: string
  usage?: LlmUsageInfo
  requestId?: string
}

export interface StartLessonGenerationResponse {
  jobId: string
  status: 'processing'
}

export interface LessonGenerationJobStatus {
  jobId: string
  status: 'processing' | 'completed' | 'failed'
  content?: string
  title?: string
  usage?: LlmUsageInfo
  errorCode?: string
  errorMessage?: string
  requestId?: string
  generationPhase?: LessonGenerationPhase
  outputFormat?: LessonOutputFormat
}

export interface LessonChatPayload {
  message: string
}

export interface LessonChatResponse {
  answer: string
  usage?: LlmUsageInfo
  remainingMessages?: number
  requestId?: string
}
