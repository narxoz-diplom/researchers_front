import { useQuery } from '@tanstack/react-query'
import { aiApi, aiQueryKeys } from '../api'

export function useAiModels(enabled = true) {
  return useQuery({
    queryKey: aiQueryKeys.models,
    queryFn: aiApi.listModels,
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
