import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { mediaApi, uploadToCloudinary } from '@/features/media/api'
import type { CloudinaryUploadResult, UploadResourceType } from '@/features/media/types'
import axios from 'axios'
import { extractApiError } from '@/shared/api/axios'

interface Props {
  resourceType: UploadResourceType
  folder: string
  accept: string
  maxSizeMb: number
  label: string
  hint?: string
  disabled?: boolean
  onUploaded: (result: CloudinaryUploadResult, file: File) => void | Promise<void>
}

export function MediaUploader({
  resourceType,
  folder,
  accept,
  maxSizeMb,
  label,
  hint,
  disabled,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  async function processFile(file: File) {
    const maxBytes = maxSizeMb * 1024 * 1024
    if (file.size > maxBytes) {
      toast.error(`Файл слишком большой. Максимум ${maxSizeMb} МБ`)
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const sign = await mediaApi.sign({ resourceType, folder })
      const result = await uploadToCloudinary(file, sign, setProgress)
      await onUploaded(result, file)
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      const apiErr = extractApiError(err)
      if (
        status === 503 ||
        apiErr?.message?.toLowerCase().includes('cloudinary')
      ) {
        toast.error('Cloudinary не настроен. Заполните CLOUDINARY_* в .env бэкенда')
      } else {
        toast.error('Не удалось загрузить файл')
      }
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void processFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (disabled || uploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) void processFile(file)
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-dashed p-4 transition-colors',
        dragOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/30',
        (disabled || uploading) && 'pointer-events-none opacity-60',
      )}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled && !uploading) setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || uploading}
        onChange={handleInputChange}
      />

      {uploading ? (
        <div className="flex flex-col gap-2 py-2">
          <p className="text-sm text-muted-foreground">Загрузка… {progress}%</p>
          <Progress value={progress} className="h-2" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Upload className="h-5 w-5" />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            {label}
          </Button>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          <p className="text-xs text-muted-foreground">или перетащите файл сюда</p>
        </div>
      )}
    </div>
  )
}
