import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  Copy,
  Check,
  Loader2,
  RotateCcw,
  SendHorizontal,
  Sparkles,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { showAiErrorToast } from '../utils/ai-errors'
import { useLessonChat, type LessonChatMessage } from '../hooks/useLessonChat'

const SUGGESTION_KEYS = ['summary', 'terms', 'explain'] as const

interface LessonChatPanelProps {
  lessonId: string
  className?: string
  /** Hide built-in header when parent (e.g. Sheet) already shows a title */
  showHeader?: boolean
  /** Extra top/side padding when rendered inside a Sheet with a close button */
  overlayMode?: boolean
}

export function LessonChatPanel({
  lessonId,
  className,
  showHeader = true,
  overlayMode = false,
}: LessonChatPanelProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const {
    messages,
    sendMessage,
    clearChat,
    isPending,
    isError,
    error,
    resetError,
    remainingMessages,
    limitReached,
  } = useLessonChat(lessonId)

  useEffect(() => {
    if (!isError || !error) return
    showAiErrorToast(error, t, 'ai.chat.sendFailed')
    resetError()
  }, [isError, error, resetError, t])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, isPending])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [draft])

  function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault()
    const text = draft.trim()
    if (!text) return
    sendMessage(text)
    setDraft('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleSuggestion(key: (typeof SUGGESTION_KEYS)[number]) {
    sendMessage(t(`ai.chat.suggestions.${key}`))
  }

  const inputDisabled = isPending || limitReached
  const hasMessages = messages.length > 0

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col bg-background', className)}>
      {showHeader ? (
        <header
          className={cn(
            'shrink-0 border-b px-4 py-3',
            overlayMode && 'pt-[max(0.75rem,env(safe-area-inset-top))] pr-14',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-violet-500/20 text-primary ring-1 ring-primary/15">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-tight">{t('ai.chat.title')}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{t('ai.chat.subtitle')}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <QuotaBadge remaining={remainingMessages} limitReached={limitReached} />
              {hasMessages ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  title={t('ai.chat.clear')}
                  onClick={clearChat}
                  disabled={isPending}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          </div>
        </header>
      ) : (
        <div className="flex shrink-0 items-center justify-end border-b px-4 py-2">
          <QuotaBadge remaining={remainingMessages} limitReached={limitReached} />
          {hasMessages ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-1 h-8 w-8 text-muted-foreground"
              title={t('ai.chat.clear')}
              onClick={clearChat}
              disabled={isPending}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      )}

      <div
        ref={listRef}
        className="relative min-h-0 flex-1 overflow-y-auto scroll-smooth px-3 py-4 sm:px-4"
      >
        {!hasMessages && !isPending ? (
          <ChatEmptyState onSuggestion={handleSuggestion} disabled={inputDisabled} />
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </AnimatePresence>
            {isPending ? <TypingIndicator /> : null}
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none sticky bottom-0 -mb-4 h-8 bg-gradient-to-t from-background to-transparent"
        />
      </div>

      <footer
        className={cn(
          'shrink-0 border-t bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:p-4',
          overlayMode && 'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        )}
      >
        {limitReached ? (
          <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
            {t('ai.chat.limitReached')}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className={cn(
            'mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border bg-muted/40 p-2 shadow-sm transition-shadow focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15',
            inputDisabled && 'opacity-70',
          )}
        >
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={1}
            disabled={inputDisabled}
            placeholder={
              limitReached ? t('ai.chat.limitReached') : t('ai.chat.placeholder')
            }
            className="max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleSubmit()
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl shadow-sm"
            disabled={inputDisabled || !draft.trim()}
            aria-label={t('ai.chat.send')}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[10px] text-muted-foreground/80">
          {t('ai.chat.hint')}
        </p>
      </footer>
    </div>
  )
}

function QuotaBadge({
  remaining,
  limitReached,
}: {
  remaining: number | null
  limitReached: boolean
}) {
  const { t } = useTranslation()

  if (limitReached) {
    return (
      <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-medium text-amber-700 dark:text-amber-300">
        {t('ai.chat.quotaEmpty')}
      </span>
    )
  }

  if (remaining === null) {
    return (
      <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
        {t('ai.chat.remainingUnknown')}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-[10px] font-medium',
        remaining <= 3
          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
          : 'bg-primary/10 text-primary',
      )}
    >
      {t('ai.chat.remaining', { count: remaining })}
    </span>
  )
}

function ChatEmptyState({
  onSuggestion,
  disabled,
}: {
  onSuggestion: (key: (typeof SUGGESTION_KEYS)[number]) => void
  disabled: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className="mx-auto flex h-full min-h-[14rem] max-w-md flex-col items-center justify-center px-2 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/10 ring-1 ring-border">
        <Bot className="h-7 w-7 text-primary" />
      </div>
      <h4 className="text-base font-semibold">{t('ai.chat.emptyTitle')}</h4>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('ai.chat.empty')}</p>
      <div className="mt-6 flex w-full flex-col gap-2">
        {SUGGESTION_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => onSuggestion(key)}
            className="rounded-xl border border-dashed bg-card/60 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-50"
          >
            {t(`ai.chat.suggestions.${key}`)}
          </button>
        ))}
      </div>
    </div>
  )
}

function ChatMessage({ message }: { message: LessonChatMessage }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      toast.success(t('ai.chat.copied'))
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('ai.chat.copyFailed'))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('group flex gap-2.5 sm:gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
          isUser
            ? 'bg-primary text-primary-foreground ring-primary/20'
            : 'bg-muted text-muted-foreground ring-border',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          'relative min-w-0 max-w-[85%] sm:max-w-[78%]',
          isUser ? 'items-end' : 'items-start',
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
            isUser
              ? 'rounded-tr-md bg-primary text-primary-foreground'
              : 'rounded-tl-md border bg-card text-foreground',
          )}
        >
          <MessageContent content={message.content} />
        </div>
        {!isUser ? (
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="mt-1 flex items-center gap-1 rounded-md px-1 py-0.5 text-[10px] text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                {t('ai.chat.copied')}
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                {t('ai.chat.copy')}
              </>
            )}
          </button>
        ) : null}
      </div>
    </motion.div>
  )
}

function MessageContent({ content }: { content: string }) {
  const paragraphs = content.split(/\n{2,}/)

  if (paragraphs.length <= 1) {
    return <p className="whitespace-pre-wrap break-words">{content}</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-wrap break-words">
          {paragraph}
        </p>
      ))}
    </div>
  )
}

function TypingIndicator() {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2.5 sm:gap-3"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border bg-card px-4 py-3 shadow-sm">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
        <span className="text-xs text-muted-foreground">{t('ai.chat.thinking')}</span>
      </div>
    </motion.div>
  )
}
