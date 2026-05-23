import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api'
import { useAuthStore } from '../store/auth.store'
import { authStorage } from '@/shared/api/auth-storage'

export function useRegister() {
  const login = useAuthStore((s) => s.login)

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken)
      authStorage.setRefresh(data.refreshToken)
    },
  })
}
