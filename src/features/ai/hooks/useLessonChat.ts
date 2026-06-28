import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { extractApiError } from '@/shared/api/axios'
import { aiApi } from '../api'

export interface LessonChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function nextMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useLessonChat(lessonId: string) {
  const [messages, setMessages] = useState<LessonChatMessage[]>([])
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null)
  const [limitReached, setLimitReached] = useState(false)

  const mutation = useMutation({
    mutationFn: (message: string) => aiApi.chatOnLesson(lessonId, { message }),
    onMutate: (message) => {
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId(), role: 'user', content: message },
      ])
    },
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId(), role: 'assistant', content: response.answer },
      ])
      if (response.remainingMessages !== undefined) {
        setRemainingMessages(response.remainingMessages)
        setLimitReached(response.remainingMessages <= 0)
      }
    },
    onError: (err) => {
      if (extractApiError(err)?.message === 'CHAT_LIMIT_EXCEEDED') {
        setLimitReached(true)
        setRemainingMessages(0)
      }
    },
  })

  const sendMessage = useCallback(
    (message: string) => {
      const trimmed = message.trim()
      if (!trimmed || mutation.isPending || limitReached) return
      mutation.mutate(trimmed)
    },
    [limitReached, mutation],
  )

  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    sendMessage,
    clearChat,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    resetError: mutation.reset,
    remainingMessages,
    limitReached,
  }
}
