import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useAuthStore } from '../store/auth.store'
import { authStorage } from '@/shared/api/auth-storage'

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => {
      const rt = authStorage.getRefresh()
      return rt ? authApi.logout(rt) : Promise.resolve()
    },
    onSettled: () => {
      // Leave the protected page first, so ProtectedRoute does not remember it as the
      // place to return to after the next login (possibly by a user with another role).
      void navigate('/auth/login', { replace: true, state: null })
      logout()
      qc.clear()
    },
  })
}
