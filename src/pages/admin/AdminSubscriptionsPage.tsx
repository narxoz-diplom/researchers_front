import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { api, extractApiError } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { Subscription, Meta } from '@/shared/types'

type SubscriptionPlan = 'BASIC' | 'PRO'

interface GrantForm {
  userId: string
  plan: SubscriptionPlan
  durationDays: number
}

export function AdminSubscriptionsPage() {
  const [grantOpen, setGrantOpen] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: () =>
      api
        .get<{ data: Subscription[]; meta: Meta }>(API.subscriptions.adminList)
        .then((r) => r.data),
  })

  const { mutate: revoke } = useMutation({
    mutationFn: (id: string) => api.post(API.subscriptions.revoke(id)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      toast.success('Подписка отозвана')
    },
  })

  const { mutate: grant, isPending: granting } = useMutation({
    mutationFn: (data: GrantForm) =>
      api.post(API.subscriptions.grant, {
        userId: data.userId.trim(),
        plan: data.plan,
        durationDays: data.durationDays,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      setGrantOpen(false)
      reset({ userId: '', plan: 'BASIC', durationDays: 30 })
      toast.success('Подписка выдана')
    },
    onError: (err) => {
      const apiErr = extractApiError(err)
      toast.error(apiErr?.message ?? 'Не удалось выдать подписку')
    },
  })

  const { register, handleSubmit, control, reset } = useForm<GrantForm>({
    defaultValues: { userId: '', plan: 'BASIC', durationDays: 30 },
  })

  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div>
      <PageHeader
        title="Подписки"
        subtitle={data ? `Всего: ${data.meta.total}` : undefined}
        actions={
          <Button onClick={() => setGrantOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Выдать подписку
          </Button>
        }
      />

      <div className="rounded-xl border bg-card overflow-hidden mb-12">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Пользователь</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Истекает</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-9 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {data?.data.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{sub.user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{sub.user?.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={sub.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(sub.expiresAt), 'd MMM yyyy', { locale: ru })}
                </TableCell>
                <TableCell className="text-right">
                  {sub.status === 'ACTIVE' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30"
                      onClick={() => revoke(sub.id)}
                    >
                      Отозвать
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Grant dialog */}
      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выдать подписку</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((d) =>
              grant({ ...d, durationDays: Number(d.durationDays) }),
            )}
            className="flex flex-col gap-4"
          >
            <div>
              <Label>ID пользователя</Label>
              <Input
                {...register('userId', { required: true })}
                className="mt-1 font-mono"
                placeholder="cmpi2pjgc00013tqy93rzmjd0"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Скопируйте ID на странице «Пользователи»
              </p>
            </div>
            <div>
              <Label>План</Label>
              <Controller
                control={control}
                name="plan"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="PRO">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>Количество дней</Label>
              <Input
                {...register('durationDays', { valueAsNumber: true })}
                type="number"
                min={1}
                max={365}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                От 1 до 365 дней
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setGrantOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={granting}>
                {granting ? 'Выдача...' : 'Выдать'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
