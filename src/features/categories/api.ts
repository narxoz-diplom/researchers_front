import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from './types'

export const categoriesApi = {
  list: () => api.get<Category[]>(API.categories.list).then((r) => r.data),
  listAll: () => api.get<Category[]>(API.categories.all).then((r) => r.data),
  create: (payload: CreateCategoryPayload) =>
    api.post<Category>(API.categories.create, payload).then((r) => r.data),
  update: (id: string, payload: UpdateCategoryPayload) =>
    api.patch<Category>(API.categories.update(id), payload).then((r) => r.data),
  delete: (id: string) => api.delete(API.categories.delete(id)),
}
