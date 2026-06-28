import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { AuthResponse } from '@/features/auth/api'
import { authStorage } from './auth-storage'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { getApiBaseUrl } from './base-url'

export const api = axios.create({ baseURL: getApiBaseUrl() })

api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const access = useAuthStore.getState().accessToken
  if (access) cfg.headers.Authorization = `Bearer ${access}`
  return cfg
})

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let refreshing: Promise<string | null> | null = null

api.interceptors.response.use(undefined, async (err: AxiosError) => {
  const original = err.config as RetryConfig | undefined
  const status = err.response?.status
  if (!original || status !== 401 || original._retry) throw err

  original._retry = true
  refreshing ??= (async () => {
    try {
      const rt = authStorage.getRefresh()
      if (!rt) return null
      const { data } = await axios.post<AuthResponse>(
        `${getApiBaseUrl()}/auth/refresh`,
        { refreshToken: rt },
      )
      useAuthStore.getState().setUser(data.user)
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
      authStorage.setRefresh(data.refreshToken)
      return data.accessToken
    } catch {
      useAuthStore.getState().logout()
      return null
    } finally {
      refreshing = null
    }
  })()

  const newAccess = await refreshing
  if (!newAccess) throw err
  original.headers!.Authorization = `Bearer ${newAccess}`
  return api(original)
})

export function extractApiError(err: unknown): { message: string } | null {
  const e = err as AxiosError<{ message: string }>
  return e.response?.data ?? null
}
