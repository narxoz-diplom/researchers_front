import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { LoadingState } from '@/shared/ui/LoadingState'
import type { Role } from '@/shared/types'

interface Props {
  allowedRoles?: Role[]
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <LoadingState />
  if (!user) return <Navigate to="/auth/login" state={{ from: location }} replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
