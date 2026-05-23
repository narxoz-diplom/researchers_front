import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { format } from 'date-fns'
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
import { getDateLocale } from '@/lib/date-locale'

type SubscriptionPlan = 'BASIC' | 'PRO'

interface GrantForm {
  userId: string
  plan: SubscriptionPlan
  durationDays: number
}

export function AdminSubscriptionsPage() {
  const { t, i18n } = useTranslation()
  const [grantOpen, setGrantOpen] = useState(false)
  const qc = useQueryClient()
  const dateLocale = getDateLocale(i18n.language)

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
      toast.success(t('admin.subscriptionRevoked'))
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
      toast.success(t('admin.subscriptionGranted'))
    },
    onError: (err) => {
      const apiErr = extractApiError(err)
      toast.error(apiErr?.message ?? t('admin.subscriptionGrantFailed'))
    },
  })

  const { register, handleSubmit, control, reset } = useForm<GrantForm>({
    defaultValues: { userId: '', plan: 'BASIC', durationDays: 30 },
  })

  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div>
      <PageHeader
        title={t('nav.subscriptions')}
        subtitle={data ? t('common.total', { count: data.meta.total }) : undefined}
        actions={
          <Button onClick={() => setGrantOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('common.grantSubscription')}
          </Button>
        }
      />

      <div className="rounded-xl border bg-card overflow-hidden mb-12">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.user')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead>{t('common.expiresAt')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
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
                  {format(new Date(sub.expiresAt), 'd MMM yyyy', { locale: dateLocale })}
                </TableCell>
                <TableCell className="text-right">
                  {sub.status === 'ACTIVE' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30"
                      onClick={() => revoke(sub.id)}
                    >
                      {t('common.revoke')}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.grantSubscription')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((d) =>
              grant({ ...d, durationDays: Number(d.durationDays) }),
            )}
            className="flex flex-col gap-4"
          >
            <div>
              <Label>{t('common.userId')}</Label>
              <Input
                {...register('userId', { required: true })}
                className="mt-1 font-mono"
                placeholder="cmpi2pjgc00013tqy93rzmjd0"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t('common.copyIdHint')}
              </p>
            </div>
            <div>
              <Label>{t('common.plan')}</Label>
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
              <Label>{t('common.daysCount')}</Label>
              <Input
                {...register('durationDays', { valueAsNumber: true })}
                type="number"
                min={1}
                max={365}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t('common.daysRange')}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setGrantOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={granting}>
                {granting ? t('common.granting') : t('common.grant')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
