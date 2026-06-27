import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PartyPopper, Sparkles, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { launchConfetti } from '@/lib/confetti'

interface CourseCompletionCelebrationProps {
  open: boolean
  onClose: () => void
  totalLessons: number
}

export function CourseCompletionCelebration({
  open,
  onClose,
  totalLessons,
}: CourseCompletionCelebrationProps) {
  const { t } = useTranslation()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return undefined
    const stopConfetti = launchConfetti(5500)
    const timer = window.setTimeout(() => onCloseRef.current(), 8000)
    return () => {
      stopConfetti()
      window.clearTimeout(timer)
    }
  }, [open])

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label={t('lesson.courseComplete.close')}
            className="fixed inset-0 z-[9990] bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="course-complete-title"
              className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-card to-card/95 p-6 text-center shadow-2xl ring-1 ring-primary/20 sm:p-8"
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl"
              />

              <motion.div
                className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center"
                initial={{ rotate: -8, scale: 0.6 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
                <span className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-300/30 to-emerald-400/30" />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-primary to-violet-500 text-white shadow-lg">
                  <Trophy className="h-8 w-8" />
                </span>
                <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-amber-400" />
                <PartyPopper className="absolute -bottom-1 -left-1 h-5 w-5 text-violet-400" />
              </motion.div>

              <motion.span
                className="mb-3 inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                100%
              </motion.span>

              <motion.h2
                id="course-complete-title"
                className="text-2xl font-bold tracking-tight sm:text-3xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t('lesson.courseComplete.title')}
              </motion.h2>

              <motion.p
                className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                {t('lesson.courseComplete.description', { count: totalLessons })}
              </motion.p>

              <motion.div
                className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36 }}
              >
                <Button size="lg" className="rounded-xl px-6" onClick={onClose}>
                  {t('lesson.courseComplete.continue')}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
