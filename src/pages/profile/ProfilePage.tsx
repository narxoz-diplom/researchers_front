import { useQuery } from '@tanstack/react-query'
import { differenceInDays, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/shared/ui/PageHeader'
import { RoleBadge } from '@/shared/ui/RoleBadge'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { Subscription } from '@/shared/types'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useLogout } from '@/features/auth/hooks/useLogout'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const { mutate: logout, isPending: loggingOut } = useLogout()

  const isSubscriber = user?.role === 'SUBSCRIBER'

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () =>
      api.get<Subscription | null>(API.subscriptions.me).then((r) => r.data ?? null),
    enabled: isSubscriber,
  })

  if (!user) return null

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div>
      <PageHeader
        title="Профиль"
        subtitle="Управление аккаунтом и подпиской"
        actions={
          <Button
            variant="outline"
            onClick={() => logout()}
            disabled={loggingOut}
            className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {loggingOut ? 'Выход...' : 'Выйти'}
          </Button>
        }
      />

      <Tabs defaultValue="profile" className="pb-12">
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          {isSubscriber && <TabsTrigger value="subscription">Подписка</TabsTrigger>}
        </TabsList>

        {/* Profile tab */}
        <TabsContent value="profile" className="mt-6">
          <Card className="max-w-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Информация</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1.5">
                  <p className="text-lg font-semibold leading-none">{user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-1">
                    <RoleBadge role={user.role} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Имя</p>
                  <p className="text-sm font-medium mt-0.5">{user.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium mt-0.5 truncate">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Роль</p>
                  <p className="text-sm font-medium mt-0.5">
                    <RoleBadge role={user.role} />
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ID</p>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">{user.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription tab — только подписчик */}
        {isSubscriber && (
          <TabsContent value="subscription" className="mt-6">
            {subLoading ? (
              <Skeleton className="h-48 rounded-2xl max-w-xl" />
            ) : subscription ? (
              <Card className="max-w-xl rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Подписка</CardTitle>
                    <StatusBadge status={subscription.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {subscription.status === 'ACTIVE' && (
                    <div className="text-center py-4 rounded-xl bg-primary/5">
                      <p className="text-5xl font-bold text-primary">
                        {Math.max(
                          0,
                          differenceInDays(new Date(subscription.expiresAt), new Date()),
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">дней осталось</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">С</p>
                      <p className="font-medium mt-0.5">
                        {format(new Date(subscription.startsAt), 'd MMM yyyy', { locale: ru })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">До</p>
                      <p className="font-medium mt-0.5">
                        {format(new Date(subscription.expiresAt), 'd MMM yyyy', { locale: ru })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="max-w-xl rounded-2xl">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Активной подписки нет. Обратитесь к администратору.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
