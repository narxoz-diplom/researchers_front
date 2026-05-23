import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, err: unknown) => {
        const e = err as { response?: { status?: number } }
        return (e?.response?.status ?? 0) >= 500 && count < 2
      },
    },
  },
})
