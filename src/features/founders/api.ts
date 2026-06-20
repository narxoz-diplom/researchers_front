import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { CreateFounderPayload, Founder, UpdateFounderPayload } from './types'

export const foundersApi = {
  list: () => api.get<Founder[]>(API.founders.list).then((r) => r.data),
  listAll: () => api.get<Founder[]>(API.founders.all).then((r) => r.data),
  create: (payload: CreateFounderPayload) =>
    api.post<Founder>(API.founders.create, payload).then((r) => r.data),
  update: (id: string, payload: UpdateFounderPayload) =>
    api.patch<Founder>(API.founders.update(id), payload).then((r) => r.data),
  delete: (id: string) => api.delete(API.founders.delete(id)),
}
