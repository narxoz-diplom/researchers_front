import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { categoriesApi } from '@/features/categories/api'
import { useAdminCategories } from '@/features/categories/hooks/useCategories'
import type { Category, CreateCategoryPayload } from '@/features/categories/types'

interface CategoryForm extends CreateCategoryPayload {
  orderNumber: number
  isPublished: boolean
}

const emptyForm: CategoryForm = {
  name: '',
  slug: '',
  orderNumber: 0,
  isPublished: true,
}

export function AdminCategoriesPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data: categories, isLoading, isError, refetch } = useAdminCategories()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const { register, handleSubmit, reset } = useForm<CategoryForm>({
    defaultValues: emptyForm,
  })

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['categories'] })
  }

  const { mutate: saveCategory, isPending: saving } = useMutation({
    mutationFn: (data: CategoryForm) => {
      const payload: CreateCategoryPayload = {
        name: data.name.trim(),
        slug: data.slug?.trim() || undefined,
        orderNumber: Number(data.orderNumber) || 0,
        isPublished: data.isPublished,
      }
      return editing
        ? categoriesApi.update(editing.id, payload)
        : categoriesApi.create(payload)
    },
    onSuccess: () => {
      invalidate()
      setDialogOpen(false)
      setEditing(null)
      reset(emptyForm)
      toast.success(t('admin.categories.saved'))
    },
    onError: () => toast.error(t('admin.categories.saveFailed')),
  })

  const { mutate: removeCategory } = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      invalidate()
      toast.success(t('admin.categories.deleted'))
    },
    onError: () => toast.error(t('admin.categories.deleteFailed')),
  })

  function openCreate() {
    setEditing(null)
    reset(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(category: Category) {
    setEditing(category)
    reset({
      name: category.name,
      slug: category.slug,
      orderNumber: category.orderNumber,
      isPublished: category.isPublished,
    })
    setDialogOpen(true)
  }

  if (isLoading) return <Skeleton className="mt-8 h-96 rounded-2xl" />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="pb-16">
      <PageHeader
        title={t('admin.categories.title')}
        subtitle={t('admin.categories.description')}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t('admin.categories.add')}
          </Button>
        }
      />

      <div className="mt-8 overflow-hidden rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">{t('common.name')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.categories.slug')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.categories.order')}</th>
              <th className="px-4 py-3 font-medium">{t('common.status')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.categories.coursesCount')}</th>
              <th className="px-4 py-3 font-medium">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((category) => (
              <tr key={category.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                <td className="px-4 py-3">{category.orderNumber}</td>
                <td className="px-4 py-3">
                  <Badge variant={category.isPublished ? 'secondary' : 'outline'}>
                    {category.isPublished ? t('admin.categories.published') : t('admin.categories.hidden')}
                  </Badge>
                </td>
                <td className="px-4 py-3">{category.coursesCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      disabled={category.coursesCount > 0}
                      title={
                        category.coursesCount > 0
                          ? t('admin.categories.deleteBlocked', { count: category.coursesCount })
                          : t('landing.cart.remove')
                      }
                      onClick={() => removeCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? t('admin.categories.edit') : t('admin.categories.add')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((data) => saveCategory(data))} className="flex flex-col gap-4">
            <div>
              <Label>{t('common.name')}</Label>
              <Input {...register('name', { required: true })} className="mt-1" />
            </div>
            <div>
              <Label>{t('admin.categories.slug')}</Label>
              <Input {...register('slug')} className="mt-1" placeholder={t('admin.categories.slugHint')} />
            </div>
            <div>
              <Label>{t('admin.categories.order')}</Label>
              <Input {...register('orderNumber')} type="number" min={0} className="mt-1" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('isPublished')} />
              {t('admin.categories.published')}
            </label>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
