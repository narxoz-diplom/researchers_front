import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { RoleBadge } from '@/shared/ui/RoleBadge'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { User, Role, Meta } from '@/shared/types'

interface EditUserForm {
  fullName: string
  email: string
}

interface ResetPasswordForm {
  newPassword: string
  confirmPassword: string
}

export function AdminUsersPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [roleDialog, setRoleDialog] = useState<{ user: User; newRole: Role } | null>(null)
  const [editDialog, setEditDialog] = useState<User | null>(null)
  const [passwordDialog, setPasswordDialog] = useState<User | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const qc = useQueryClient()

  const editForm = useForm<EditUserForm>({
    defaultValues: { fullName: '', email: '' },
  })

  const passwordForm = useForm<ResetPasswordForm>({
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id)
      setCopiedId(id)
      toast.success(t('admin.idCopied'))
      window.setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1500)
    } catch {
      toast.error(t('admin.copyFailed'))
    }
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: () =>
      api
        .get<{ data: User[]; meta: Meta }>(API.users.list, { params: { search: search || undefined } })
        .then((r) => r.data),
  })

  const { mutate: changeRole, isPending: changingRole } = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      api.patch(API.users.role(userId), { role }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      setRoleDialog(null)
      toast.success(t('admin.roleChanged'))
    },
    onError: () => toast.error(t('admin.roleChangeFailed')),
  })

  const { mutate: updateUser, isPending: updatingUser } = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: EditUserForm }) =>
      api.patch(API.users.update(userId), {
        fullName: payload.fullName.trim(),
        email: payload.email.trim(),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      setEditDialog(null)
      toast.success(t('admin.users.profileSaved'))
    },
    onError: () => toast.error(t('admin.users.profileSaveFailed')),
  })

  const { mutate: resetPassword, isPending: resettingPassword } = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      api.patch(API.users.password(userId), { newPassword }),
    onSuccess: () => {
      setPasswordDialog(null)
      passwordForm.reset()
      toast.success(t('admin.users.passwordReset'))
    },
    onError: () => toast.error(t('admin.users.passwordResetFailed')),
  })

  const { mutate: deleteUser } = useMutation({
    mutationFn: (id: string) => api.delete(API.users.byId(id)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success(t('admin.userDeleted'))
    },
    onError: () => toast.error(t('admin.userDeleteFailed')),
  })

  function openEditDialog(user: User) {
    setEditDialog(user)
    editForm.reset({
      fullName: user.fullName,
      email: user.email,
    })
  }

  function openPasswordDialog(user: User) {
    setPasswordDialog(user)
    passwordForm.reset({ newPassword: '', confirmPassword: '' })
  }

  function submitEdit(values: EditUserForm) {
    if (!editDialog) return
    updateUser({ userId: editDialog.id, payload: values })
  }

  function submitPassword(values: ResetPasswordForm) {
    if (!passwordDialog) return
    if (values.newPassword !== values.confirmPassword) {
      toast.error(t('admin.users.passwordMismatch'))
      return
    }
    if (values.newPassword.length < 8) {
      toast.error(t('admin.users.passwordTooShort'))
      return
    }
    resetPassword({ userId: passwordDialog.id, newPassword: values.newPassword })
  }

  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div>
      <PageHeader
        title={t('nav.users')}
        subtitle={data ? t('common.total', { count: data.meta.total }) : undefined}
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              className="pl-9 w-full sm:w-56"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      <div className="flex flex-col gap-3 pb-12 md:hidden">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        {data?.data.map((user) => (
          <div key={user.id} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {user.fullName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{user.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <RoleBadge role={user.role} />
            </div>
            <button
              type="button"
              onClick={() => void copyId(user.id)}
              className="flex w-full items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 font-mono text-xs text-muted-foreground"
            >
              <span className="truncate">{user.id}</span>
              {copiedId === user.id ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 shrink-0" />
              )}
            </button>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(user)}>
                {t('common.edit')}
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => openPasswordDialog(user)}>
                {t('admin.users.resetPassword')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() =>
                  setRoleDialog({ user, newRole: user.role === 'ADMIN' ? 'SUBSCRIBER' : 'AUTHOR' })
                }
              >
                {t('common.changeRole')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive"
                onClick={() => deleteUser(user.id)}
              >
                {t('common.delete')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block rounded-xl border bg-card overflow-hidden mb-12">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.user')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('common.id')}</TableHead>
              <TableHead>{t('common.role')}</TableHead>
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
            {data?.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {user.fullName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <button
                    type="button"
                    onClick={() => void copyId(user.id)}
                    title={user.id}
                    className="group inline-flex max-w-[220px] items-center gap-2 rounded-md border border-transparent bg-muted/40 px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
                  >
                    <span className="truncate">{user.id}</span>
                    {copiedId === user.id ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                      {t('common.actions')}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(user)}>
                        {t('admin.users.editProfile')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openPasswordDialog(user)}>
                        {t('admin.users.resetPassword')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setRoleDialog({ user, newRole: user.role === 'ADMIN' ? 'SUBSCRIBER' : 'AUTHOR' })
                        }
                      >
                        {t('common.changeRole')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => deleteUser(user.id)}
                      >
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.users.editProfile')}</DialogTitle>
          </DialogHeader>
          {editDialog && (
            <form onSubmit={editForm.handleSubmit(submitEdit)} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('common.user')}: <strong>{editDialog.fullName}</strong>
              </p>
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">{t('common.name')}</Label>
                <Input id="edit-fullName" {...editForm.register('fullName', { required: true, minLength: 2 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">{t('common.email')}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  {...editForm.register('email', { required: true })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialog(null)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={updatingUser}>
                  {updatingUser ? t('common.saving') : t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!passwordDialog} onOpenChange={() => setPasswordDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.users.resetPassword')}</DialogTitle>
          </DialogHeader>
          {passwordDialog && (
            <form onSubmit={passwordForm.handleSubmit(submitPassword)} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('common.user')}: <strong>{passwordDialog.fullName}</strong>
              </p>
              <p className="text-sm text-muted-foreground">{t('admin.users.passwordEmailHint')}</p>
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('admin.users.newPassword')}</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register('newPassword', { required: true, minLength: 8 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('admin.users.confirmPassword')}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register('confirmPassword', { required: true, minLength: 8 })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPasswordDialog(null)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={resettingPassword}>
                  {resettingPassword ? t('common.saving') : t('admin.users.resetPassword')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!roleDialog} onOpenChange={() => setRoleDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.changeRoleTitle')}</DialogTitle>
          </DialogHeader>
          {roleDialog && (
            <>
              <p className="text-sm text-muted-foreground">
                {t('common.user')}: <strong>{roleDialog.user.fullName}</strong>
              </p>
              <Select
                value={roleDialog.newRole}
                onValueChange={(v) => setRoleDialog({ ...roleDialog, newRole: v as Role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBSCRIBER">{t('roles.SUBSCRIBER')}</SelectItem>
                  <SelectItem value="AUTHOR">{t('roles.AUTHOR')}</SelectItem>
                  <SelectItem value="ADMIN">{t('roles.ADMIN')}</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={changingRole}
              onClick={() =>
                roleDialog && changeRole({ userId: roleDialog.user.id, role: roleDialog.newRole })
              }
            >
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
