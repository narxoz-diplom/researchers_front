import { useQuery } from '@tanstack/react-query'
import { aiApi, aiQueryKeys } from '../api'

export function useLatestLessonGenerationJob(lessonId: string) {
  return useQuery({
    queryKey: aiQueryKeys.generationLatest(lessonId),
    queryFn: () => aiApi.getLatestGenerationJob(lessonId),
    refetchInterval: (query) =>
      query.state.data?.status === 'processing' ? 2000 : false,
  })
}
