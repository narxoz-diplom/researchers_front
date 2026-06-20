import type { Role } from '@/shared/types'

export function getAccountHomePath(role?: Role | string): string {
  if (role === 'SUBSCRIBER') return '/my-learning'
  if (role === 'AUTHOR') return '/studio'
  if (role === 'ADMIN') return '/admin/users'
  return '/catalog'
}

export function getAccountHomeLabelKey(role?: Role | string):
  | 'nav.myLearning'
  | 'nav.studio'
  | 'nav.users'
  | 'nav.catalog' {
  if (role === 'SUBSCRIBER') return 'nav.myLearning'
  if (role === 'AUTHOR') return 'nav.studio'
  if (role === 'ADMIN') return 'nav.users'
  return 'nav.catalog'
}
