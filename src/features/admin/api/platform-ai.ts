import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { AuthorAiSettings, UpdateAuthorAiSettingsPayload } from '@/features/ai/types'

export const platformAiApi = {
  getSubscriberChatSettings: () =>
    api.get<AuthorAiSettings>(API.admin.subscriberChatAi).then((r) => r.data),

  updateSubscriberChatSettings: (payload: UpdateAuthorAiSettingsPayload) =>
    api.patch<AuthorAiSettings>(API.admin.subscriberChatAi, payload).then((r) => r.data),

  deleteSubscriberChatSettings: () =>
    api.delete<AuthorAiSettings>(API.admin.subscriberChatAi).then((r) => r.data),
}

export const platformAiQueryKeys = {
  subscriberChat: ['admin', 'ai', 'subscriber-chat'] as const,
}
