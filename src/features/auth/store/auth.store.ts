import { create } from 'zustand'
import type { User } from '@/shared/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  setUser: (user: User) => void
  setTokens: (access: string, refresh: string) => void
  login: (user: User, access: string, refresh: string) => void
  logout: () => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setTokens: (accessToken, _refresh) => set({ accessToken }),
  login: (user, accessToken, _refresh) => set({ user, accessToken, isLoading: false }),
  logout: () => {
    set({ user: null, accessToken: null, isLoading: false })
    localStorage.removeItem('r_rt')
  },
  setLoading: (isLoading) => set({ isLoading }),
}))
