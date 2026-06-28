import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { platformAiApi, platformAiQueryKeys } from '../api/platform-ai'

export function usePlatformSubscriberChatSettings() {
  return useQuery({
    queryKey: platformAiQueryKeys.subscriberChat,
    queryFn: platformAiApi.getSubscriberChatSettings,
  })
}

export function useSavePlatformSubscriberChatKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: platformAiApi.updateSubscriberChatSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(platformAiQueryKeys.subscriberChat, data)
    },
  })
}

export function useDeletePlatformSubscriberChatKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: platformAiApi.deleteSubscriberChatSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(platformAiQueryKeys.subscriberChat, data)
    },
  })
}
