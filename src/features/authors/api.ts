import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { AuthorStatus } from '@/shared/types'
import type { AdminAuthor, AuthorApplicationPayload, MyAuthorApplication } from './types'

export const authorsApi = {
  mine: () =>
    api.get<MyAuthorApplication>(API.authorApplication.mine).then((r) => r.data),
  resubmit: (payload: AuthorApplicationPayload) =>
    api.put<MyAuthorApplication>(API.authorApplication.mine, payload).then((r) => r.data),
  adminList: (status?: AuthorStatus) =>
    api
      .get<AdminAuthor[]>(API.admin.authors, { params: status ? { status } : undefined })
      .then((r) => r.data),
  approve: (userId: string) =>
    api.post<AdminAuthor>(API.admin.approveAuthor(userId)).then((r) => r.data),
  reject: (userId: string, note: string) =>
    api.post<AdminAuthor>(API.admin.rejectAuthor(userId), { note }).then((r) => r.data),
}
