import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { BrandIcon } from '@/shared/components/BrandIcon'
import { useCourseSearch } from '@/features/courses/hooks/useCourseSearch'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { cn } from '@/lib/utils'
import type { Course } from '@/shared/types'

interface Props {
  className?: string
  /** Controlled value for landing page marketplace filter */
  value?: string
  onChange?: (value: string) => void
  /** Called on Enter or "view all" — e.g. scroll to courses section */
  onSubmit?: (query: string) => void
  variant?: 'landing' | 'app'
}

export function NavbarSearch({
  className,
  value: controlledValue,
  onChange,
  onSubmit,
  variant = 'app',
}: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [internalValue, setInternalValue] = useState('')
  const [open, setOpen] = useState(false)

  const value = controlledValue ?? internalValue
  const setValue = onChange ?? setInternalValue

  const { data, isFetching } = useCourseSearch(value, 6)
  const results = data?.data ?? []
  const showDropdown = open && value.trim().length >= 2

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(course: Course) {
    setOpen(false)
    if (variant === 'landing') {
      setValue(course.title)
      onSubmit?.(course.title)
      navigate(`/courses/${course.id}/preview`)
      return
    }
    navigate(user?.role === 'SUBSCRIBER' ? `/courses/${course.id}` : `/courses/${course.id}/preview`)
  }

  function handleSubmit() {
    const q = value.trim()
    if (!q) return
    setOpen(false)
    if (variant === 'landing') {
      onSubmit?.(q)
    }
    navigate(`/catalog?search=${encodeURIComponent(q)}`)
  }

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={t('catalog.searchPlaceholder')}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSubmit()
          }
          if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        className={cn(
          'h-10 rounded-full border-border/60 bg-muted/40 pl-10 pr-10 shadow-none transition-[box-shadow,background-color,border-color]',
          'placeholder:text-muted-foreground/70',
          'focus-visible:border-primary/30 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/15',
        )}
      />
      {isFetching && value.trim().length >= 2 && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}

      {showDropdown && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-border/60 bg-popover text-popover-foreground shadow-xl"
        >
          {results.length === 0 && !isFetching ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">{t('search.noResults')}</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((course) => (
                <li key={course.id}>
                  <button
                    type="button"
                    role="option"
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(course)}
                  >
                    <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {course.coverUrl ? (
                        <img src={course.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <BrandIcon className="h-5 w-5 opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{course.title}</p>
                      {course.category && (
                        <p className="truncate text-xs text-muted-foreground">{course.category}</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {results.length > 0 && (
            <button
              type="button"
              className="w-full border-t px-4 py-2.5 text-left text-sm font-medium text-primary hover:bg-muted"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleSubmit}
            >
              {t('search.viewAll', { query: value.trim() })}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
