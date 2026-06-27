import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiApi, aiQueryKeys } from '../api'

export function useAuthorAiSettings(enabled = true) {
  return useQuery({
    queryKey: aiQueryKeys.settings,
    queryFn: aiApi.getSettings,
    enabled,
  })
}

export function useSaveAuthorAiSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: aiApi.updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(aiQueryKeys.settings, data)
    },
  })
}

export function useDeleteAuthorAiSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: aiApi.deleteSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(aiQueryKeys.settings, data)
    },
  })
}
