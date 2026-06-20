import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '../api'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
    staleTime: 60_000,
  })
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoriesApi.listAll(),
  })
}
