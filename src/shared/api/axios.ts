import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { authStorage } from './auth-storage'
import { useAuthStore } from '@/features/auth/store/auth.store'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL as string })

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
      const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${import.meta.env.VITE_API_URL as string}/auth/refresh`,
        { refreshToken: rt },
      )
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
