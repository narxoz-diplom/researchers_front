import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileArchive, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/shared/ui/PageHeader'
import { api, extractApiError } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { parseCoursePackage, type ParsedCoursePackage } from '@/features/courses/import/course-package'
import { runCourseImport, type ImportProgress } from '@/features/courses/import/run-import'
import { formatPriceCents } from '@/lib/format-price'
import type { User } from '@/shared/types'

/** Studio: create a whole course (lessons, videos, materials) from a ZIP package. */
export function StudioImportCoursePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'
  const inputRef = useRef<HTMLInputElement>(null)
  const [pkg, setPkg] = useState<ParsedCoursePackage | null>(null)
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [authorId, setAuthorId] = useState('')
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<{ courseId: string } | null>(null)
  const [failure, setFailure] = useState<string | null>(null)

  const { data: authors } = useQuery({
    queryKey: ['admin', 'authors-for-import'],
    queryFn: () =>
      api
        .get<{ data: User[] }>(API.users.list, { params: { role: 'AUTHOR', pageSize: 100 } })
        .then((r) => r.data.data.filter((a) => a.authorStatus === 'APPROVED')),
    enabled: isAdmin,
  })

  async function handleFile(file: File) {
    setPkg(null)
    setResult(null)
    setFailure(null)
    setParseError(null)
    setFileName(file.name)
    try {
      setPkg(await parseCoursePackage(file))
    } catch (err) {
      setParseError(err instanceof Error ? err.message : String(err))
    }
  }

  async function start() {
    if (!pkg) return
    setRunning(true)
    setFailure(null)
    try {
      const res = await runCourseImport(pkg, {
        authorId: isAdmin && authorId ? authorId : undefined,
        onProgress: setProgress,
      })
      setResult(res)
      toast.success(t('studio.import.done'))
    } catch (err) {
      const apiErr = extractApiError(err)
      setFailure(apiErr?.message ?? (err instanceof Error ? err.message : String(err)))
      toast.error(t('studio.import.failed'))
    } finally {
      setRunning(false)
    }
  }

  const percent = progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="pb-16">
      <Button variant="ghost" size="sm" className="mt-4 mb-2 gap-1 text-muted-foreground" onClick={() => navigate('/studio')}>
        <ArrowLeft className="h-4 w-4" />
        {t('nav.studio')}
      </Button>
      <PageHeader title={t('studio.import.title')} subtitle={t('studio.import.subtitle')} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-center">
            <input
              ref={inputRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void handleFile(f)
                e.target.value = ''
              }}
            />
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileArchive className="h-6 w-6" />
            </div>
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={running}>
              <Upload className="mr-2 h-4 w-4" />
              {t('studio.import.choose')}
            </Button>
            {fileName && <p className="mt-2 text-sm text-muted-foreground">{fileName}</p>}
            {parseError && <p className="mt-2 text-sm text-destructive">{parseError}</p>}
          </div>

          {pkg && (
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="text-lg font-semibold">{pkg.manifest.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{pkg.manifest.description}</p>
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">{t('common.lessons')}</dt>
                  <dd className="font-medium">{pkg.lessons.length}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t('studio.import.files')}</dt>
                  <dd className="font-medium">{pkg.fileCount}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t('studio.import.videos')}</dt>
                  <dd className="font-medium">{pkg.lessons.reduce((n, l) => n + l.videos.length, 0)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t('common.price')}</dt>
                  <dd className="font-medium">
                    {pkg.manifest.priceCents != null ? formatPriceCents(pkg.manifest.priceCents, i18n.language) : '—'}
                  </dd>
                </div>
              </dl>
              <ol className="mt-4 max-h-72 space-y-1 overflow-y-auto text-sm">
                {pkg.lessons.map((l, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="w-6 shrink-0 text-right text-muted-foreground">{i + 1}.</span>
                    <span className="min-w-0 flex-1 truncate">{l.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {l.materials.length > 0 && `${l.materials.length} ${t('studio.import.filesShort')}`}
                      {l.videos.length > 0 && ` · ${l.videos.length} ${t('studio.import.videosShort')}`}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {isAdmin && (
            <div className="rounded-2xl border bg-card p-5">
              <Label className="text-sm">{t('studio.import.author')}</Label>
              <p className="mb-2 text-xs text-muted-foreground">{t('studio.import.authorHint')}</p>
              <Select value={authorId || 'ME'} onValueChange={(v) => setAuthorId(!v || v === 'ME' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue>
                    {authorId ? (authors?.find((a) => a.id === authorId)?.fullName ?? '…') : t('studio.import.authorMe')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ME">{t('studio.import.authorMe')}</SelectItem>
                  {authors?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.fullName} · {a.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{t('studio.import.formatHint')}</p>
            <Button className="mt-4 w-full" disabled={!pkg || running || !!result} onClick={() => void start()}>
              {running ? t('studio.import.running') : t('studio.import.start')}
            </Button>
            {progress && (
              <div className="mt-4 space-y-2">
                <Progress value={percent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {progress.done}/{progress.total} · {progress.step}
                </p>
              </div>
            )}
            {failure && (
              <p className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {t('studio.import.failedDetail', { detail: failure })}
              </p>
            )}
            {result && (
              <div className="mt-4 flex flex-col gap-2">
                <Link to={`/studio/courses/${result.courseId}`} className="text-sm font-medium text-primary underline">
                  {t('studio.import.openCourse')}
                </Link>
                <Link to={`/courses/${result.courseId}`} className="text-sm text-primary underline">
                  {t('studio.import.openPublic')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
