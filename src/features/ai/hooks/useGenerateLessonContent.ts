import { useMutation, useQueryClient } from '@tanstack/react-query'
import { aiApi, aiQueryKeys } from '../api'
import { clearConsumedGenerationJob } from '../utils/generation-session'
import type { GenerateLessonContentPayload } from '../types'

export function useGenerateLessonContent(lessonId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: GenerateLessonContentPayload) => {
      clearConsumedGenerationJob(lessonId)
      return aiApi.generateLessonContent(lessonId, payload)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: aiQueryKeys.generationLatest(lessonId),
      })
    },
  })
}
