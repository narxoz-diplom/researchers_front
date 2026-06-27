import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  onSelect: (file: File) => void
  accept?: string
  maxSizeMb?: number
  label?: string
  disabled?: boolean
  className?: string
}

export function UploadButton({
  onSelect,
  accept,
  maxSizeMb = 10,
  label,
  disabled,
  className,
}: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const maxBytes = maxSizeMb * 1024 * 1024
    if (file.size > maxBytes) {
      toast.error(t('media.fileTooLarge', { max: maxSizeMb }))
      return
    }

    onSelect(file)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className={cn('gap-2', className)}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {label ?? t('common.upload')}
      </Button>
    </>
  )
}
