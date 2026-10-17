import { useQuery } from '@tanstack/react-query'
import { foundersApi } from '@/features/founders/api'

export function useFounders() {
  return useQuery({
    queryKey: ['founders', 'published'],
    queryFn: foundersApi.list,
    staleTime: 60_000,
  })
}

export function useFounder(id: string | undefined) {
  return useQuery({
    queryKey: ['founders', 'one', id],
    queryFn: () => foundersApi.get(id!),
    enabled: !!id,
  })
}

export function useAdminFounders() {
  return useQuery({
    queryKey: ['founders', 'admin'],
    queryFn: foundersApi.listAll,
  })
}
