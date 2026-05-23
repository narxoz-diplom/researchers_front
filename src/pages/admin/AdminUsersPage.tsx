import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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

export function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleDialog, setRoleDialog] = useState<{ user: User; newRole: Role } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const qc = useQueryClient()

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id)
      setCopiedId(id)
      toast.success('ID скопирован')
      window.setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1500)
    } catch {
      toast.error('Не удалось скопировать')
    }
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: () =>
      api
        .get<{ data: User[]; meta: Meta }>(API.users.list, { params: { query: search || undefined } })
        .then((r) => r.data),
  })

  const { mutate: changeRole, isPending: changingRole } = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      api.patch(API.users.role(userId), { role }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      setRoleDialog(null)
      toast.success('Роль изменена')
    },
    onError: () => toast.error('Не удалось изменить роль'),
  })

  const { mutate: deleteUser } = useMutation({
    mutationFn: (id: string) => api.delete(API.users.byId(id)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Пользователь удалён')
    },
    onError: () => toast.error('Не удалось удалить пользователя'),
  })

  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div>
      <PageHeader
        title="Пользователи"
        subtitle={data ? `Всего: ${data.meta.total}` : undefined}
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск..."
              className="pl-9 w-56"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      <div className="rounded-xl border bg-card overflow-hidden mb-12">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Пользователь</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Роль</TableHead>
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
                <TableCell>
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
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="sm">
                        Действия
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          setRoleDialog({ user, newRole: user.role === 'ADMIN' ? 'SUBSCRIBER' : 'AUTHOR' })
                        }
                      >
                        Изменить роль
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => deleteUser(user.id)}
                      >
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Role change dialog */}
      <Dialog open={!!roleDialog} onOpenChange={() => setRoleDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить роль</DialogTitle>
          </DialogHeader>
          {roleDialog && (
            <>
              <p className="text-sm text-muted-foreground">
                Пользователь: <strong>{roleDialog.user.fullName}</strong>
              </p>
              <Select
                value={roleDialog.newRole}
                onValueChange={(v) => setRoleDialog({ ...roleDialog, newRole: v as Role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBSCRIBER">Подписчик</SelectItem>
                  <SelectItem value="AUTHOR">Автор</SelectItem>
                  <SelectItem value="ADMIN">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog(null)}>
              Отмена
            </Button>
            <Button
              disabled={changingRole}
              onClick={() =>
                roleDialog && changeRole({ userId: roleDialog.user.id, role: roleDialog.newRole })
              }
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
