import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import { formatPriceCents } from '@/lib/format-price'

export interface AdjustAmountTarget {
  id: string
  courseId: string
  paidAmountCents?: number
  expectedAmountCents?: number
  priceCents: number
  studentName?: string
  courseTitle: string
}

interface Props {
  target: AdjustAmountTarget | null
  onClose: () => void
  onSaved: () => void
}

/** Admin/author records what actually arrived on Kaspi when it differs from the declared amount. */
export function AdjustAmountDialog({ target, onClose, onSaved }: Props) {
  const { t } = useTranslation()
  return (
    <Dialog
      open={!!target}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.payments.adjustAmountTitle')}</DialogTitle>
        </DialogHeader>
        {/* Keyed by enrollment so the form starts from that row's declared amount. */}
        {target && <AdjustAmountForm key={target.id} target={target} onClose={onClose} onSaved={onSaved} />}
      </DialogContent>
    </Dialog>
  )
}

function AdjustAmountForm({
  target,
  onClose,
  onSaved,
}: {
  target: AdjustAmountTarget
  onClose: () => void
  onSaved: () => void
}) {
  const { t, i18n } = useTranslation()
  const [amountTenge, setAmountTenge] = useState(
    target.paidAmountCents != null ? String(Math.round(target.paidAmountCents / 100)) : '',
  )
  const [note, setNote] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: ({ receivedAmountCents, note }: { receivedAmountCents: number; note?: string }) =>
      api.post(API.courses.enrollmentAdjustAmount(target.courseId, target.id), {
        receivedAmountCents,
        ...(note ? { note } : {}),
      }),
    onSuccess: () => {
      toast.success(t('admin.payments.adjusted'))
      onSaved()
      onClose()
    },
    onError: () => toast.error(t('admin.payments.adjustFailed')),
  })

  const receivedCents = Math.round(Number(amountTenge.replace(',', '.')) * 100)
  const valid = amountTenge.trim() !== '' && Number.isFinite(receivedCents) && receivedCents >= 0
  const expected = target.expectedAmountCents ?? target.priceCents

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {target.studentName ? `${target.studentName} · ` : ''}
          {target.courseTitle}
        </p>
        <p className="text-sm text-muted-foreground">
          {t('admin.payments.adjustAmountHint', {
            declared: formatPriceCents(target.paidAmountCents ?? 0, i18n.language),
            expected: formatPriceCents(expected, i18n.language),
          })}
        </p>
        <div className="space-y-2">
          <Label htmlFor="received-amount">{t('admin.payments.receivedAmount')}</Label>
          <Input
            id="received-amount"
            type="number"
            min={0}
            inputMode="decimal"
            value={amountTenge}
            onChange={(e) => setAmountTenge(e.target.value)}
          />
          {valid && receivedCents > expected && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {t('admin.payments.overpaid', {
                amount: formatPriceCents(receivedCents - expected, i18n.language),
              })}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="adjust-note">{t('admin.payments.adjustNote')}</Label>
          <Textarea id="adjust-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          disabled={!valid || isPending}
          onClick={() => mutate({ receivedAmountCents: receivedCents, note: note.trim() || undefined })}
        >
          {isPending ? t('common.saving') : t('common.save')}
        </Button>
      </DialogFooter>
    </>
  )
}
