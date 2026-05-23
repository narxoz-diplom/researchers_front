import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RoleBadge } from '@/shared/ui/RoleBadge'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useLogout } from '@/features/auth/hooks/useLogout'

export function UserMenu() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const { mutate: logout } = useLogout()
  const navigate = useNavigate()

  if (!user) return null

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('common.profileMenu')}
        className="relative flex h-9 w-9 items-center justify-center rounded-full outline-none transition hover:ring-2 hover:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.avatarUrl} alt={user.fullName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60 p-1" align="end">
        <div className="flex flex-col gap-1.5 px-2 py-2">
          <p className="text-sm font-semibold leading-none">{user.fullName}</p>
          <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
          <div className="mt-1">
            <RoleBadge role={user.role} />
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          {t('nav.profile')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          {t('common.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
