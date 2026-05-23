import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { User } from '@/shared/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
  role: 'SUBSCRIBER' | 'AUTHOR'
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<AuthResponse>(API.auth.login, data).then((r) => r.data),

  register: (data: RegisterPayload) =>
    api.post<AuthResponse>(API.auth.register, data).then((r) => r.data),

  logout: (refreshToken: string) =>
    api.post(API.auth.logout, { refreshToken }).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>(API.auth.refresh, { refreshToken }).then((r) => r.data),

  me: () => api.get<User>(API.auth.me).then((r) => r.data),
}
