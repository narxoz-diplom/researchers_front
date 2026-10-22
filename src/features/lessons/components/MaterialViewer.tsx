import { useEffect, useRef, useState, type SyntheticEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileWarning } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import { sanitizeHtml } from '@/shared/lib/sanitize-html'
import { pdfjs } from '@/features/lessons/lib/pdf'
import { materialKind } from '@/features/lessons/lib/material-kind'
import type { LessonMaterial } from '@/shared/types'

const prevent = (e: SyntheticEvent) => e.preventDefault()

interface Props {
  material: LessonMaterial | null
  onClose: () => void
}

/** In-page, view-only reader for lesson materials: PDF pages on canvas, images, text, DOCX as HTML. */
export function MaterialViewer({ material, onClose }: Props) {
  const { t } = useTranslation()
  return (
    <Dialog
      open={!!material}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        className="flex h-[92dvh] w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] flex-col gap-3 p-3 sm:max-w-5xl sm:p-4"
        onContextMenu={prevent}
      >
        <DialogHeader className="pr-8">
          <DialogTitle className="truncate">{material?.title}</DialogTitle>
          <DialogDescription>{t('lesson.viewOnly')}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 select-none overflow-auto rounded-xl bg-muted/40 p-2 sm:p-3">
          {material && <MaterialBody key={material.id} material={material} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface LoadedMaterial {
  html?: string
  text?: string
  pdf?: ArrayBuffer
  blobUrl?: string
}

function MaterialBody({ material }: { material: LessonMaterial }) {
  const { t } = useTranslation()
  const kind = materialKind(material)

  const { data, isLoading, isError } = useQuery<LoadedMaterial>({
    queryKey: ['material-view', material.id, kind],
    queryFn: async () => {
      if (kind === 'docx') {
        const { data } = await api.get<{ html: string }>(material.htmlUrl ?? API.materials.html(material.id))
        return { html: sanitizeHtml(data.html) }
      }
      const { data } = await api.get<Blob>(material.viewUrl ?? API.materials.view(material.id), {
        responseType: 'blob',
      })
      if (kind === 'text') return { text: await data.text() }
      if (kind === 'pdf') return { pdf: await data.arrayBuffer() }
      return { blobUrl: URL.createObjectURL(data) }
    },
    enabled: kind !== 'unsupported',
    staleTime: 5 * 60 * 1000,
    gcTime: 0,
    retry: false,
  })

  useEffect(() => {
    const url = data?.blobUrl
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [data?.blobUrl])

  if (kind === 'unsupported') {
    return <Notice icon={<FileWarning className="h-6 w-6" />} text={t('lesson.previewUnsupported')} />
  }
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-2">
        <p className="text-center text-xs text-muted-foreground">{t('lesson.materialLoading')}</p>
        <Skeleton className="mx-auto h-[60vh] w-full max-w-3xl rounded-lg" />
      </div>
    )
  }
  if (isError || !data) {
    return <Notice icon={<FileWarning className="h-6 w-6" />} text={t('lesson.materialLoadFailed')} />
  }
  if (data.pdf) return <PdfPages data={data.pdf} />
  if (data.blobUrl) {
    return (
      <img
        src={data.blobUrl}
        alt={material.title}
        className="mx-auto max-h-full max-w-full rounded-lg object-contain"
        draggable={false}
        onContextMenu={prevent}
      />
    )
  }
  if (data.text !== undefined) {
    return (
      <pre className="mx-auto max-w-3xl whitespace-pre-wrap rounded-lg bg-background p-4 font-mono text-sm leading-relaxed">
        {data.text}
      </pre>
    )
  }
  return (
    <div
      className="prose prose-sm mx-auto max-w-3xl rounded-lg bg-background p-4 dark:prose-invert sm:p-6"
      // Converter output filtered through sanitizeHtml above.
      dangerouslySetInnerHTML={{ __html: data.html ?? '' }}
    />
  )
}

function Notice({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
      {icon}
      <p className="max-w-sm">{text}</p>
    </div>
  )
}

function PdfPages({ data }: { data: ArrayBuffer }) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<{ total: number; rendered: number; error: boolean }>({
    total: 0,
    rendered: 0,
    error: false,
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let cancelled = false
    container.replaceChildren()
    // pdf.js takes ownership of the buffer; pass a copy so the cached one stays usable.
    const task = pdfjs.getDocument({ data: data.slice(0) })

    void (async () => {
      try {
        const doc = await task.promise
        if (cancelled) return
        setState({ total: doc.numPages, rendered: 0, error: false })
        const targetWidth = Math.min(container.clientWidth || 800, 1000) - 16
        const dpr = window.devicePixelRatio || 1
        for (let n = 1; n <= doc.numPages; n++) {
          if (cancelled) return
          const page = await doc.getPage(n)
          const base = page.getViewport({ scale: 1 })
          const scale = targetWidth / base.width
          const viewport = page.getViewport({ scale: scale * dpr })
          const canvas = document.createElement('canvas')
          canvas.width = Math.ceil(viewport.width)
          canvas.height = Math.ceil(viewport.height)
          canvas.style.width = `${Math.floor(viewport.width / dpr)}px`
          canvas.style.height = `${Math.floor(viewport.height / dpr)}px`
          canvas.className = 'mx-auto mb-3 block rounded bg-white shadow-sm'
          const canvasContext = canvas.getContext('2d')
          if (!canvasContext) continue
          await page.render({ canvas, canvasContext, viewport }).promise
          if (cancelled) return
          container.appendChild(canvas)
          setState((s) => ({ ...s, rendered: n }))
        }
      } catch {
        if (!cancelled) setState((s) => ({ ...s, error: true }))
      }
    })()

    return () => {
      cancelled = true
      void task.destroy()
    }
  }, [data])

  return (
    <div className="flex flex-col">
      {state.total > 0 && (
        <p className="mb-2 text-center text-xs text-muted-foreground">
          {t('lesson.pdfPage', { page: state.rendered, total: state.total })}
        </p>
      )}
      {state.error && (
        <Notice icon={<FileWarning className="h-6 w-6" />} text={t('lesson.materialLoadFailed')} />
      )}
      <div ref={containerRef} onContextMenu={prevent} />
    </div>
  )
}
