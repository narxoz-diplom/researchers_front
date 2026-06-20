import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { MyLibrary } from '../types'

export function useMyLibrary() {
  return useQuery({
    queryKey: ['library', 'mine'],
    queryFn: () => api.get<MyLibrary>(API.purchases.library).then((r) => r.data),
  })
}
