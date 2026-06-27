import { useMemo } from 'react'

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function StructuredSections({ content }: { content: string }) {
  const sections = useMemo(() => {
    const chunks = content.split(/^##\s+/m).filter(Boolean)
    if (chunks.length <= 1 && !content.trimStart().startsWith('##')) {
      return null
    }
    const first = content.trimStart()
    if (first.startsWith('##')) {
      return chunks.map((chunk) => {
        const nl = chunk.indexOf('\n')
        const heading = nl === -1 ? chunk.trim() : chunk.slice(0, nl).trim()
        const body = nl === -1 ? '' : chunk.slice(nl + 1).trim()
        return { heading, body }
      })
    }
    return chunks.slice(1).map((chunk) => {
      const nl = chunk.indexOf('\n')
      const heading = nl === -1 ? chunk.trim() : chunk.slice(0, nl).trim()
      const body = nl === -1 ? '' : chunk.slice(nl + 1).trim()
      return { heading, body }
    })
  }, [content])

  if (!sections?.length) {
    return <PlainMarkdown content={content} />
  }

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section) => (
        <div key={section.heading} className="rounded-lg border bg-background/60 p-3">
          <p className="text-sm font-semibold">{section.heading}</p>
          {section.body ? (
            <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
              {renderInline(section.body)}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function PlainMarkdown({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/)
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {blocks.map((block, i) => {
        const trimmed = block.trim()
        if (!trimmed) return null
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} className="text-base font-semibold mt-4 first:mt-0">
              {trimmed.slice(3)}
            </h2>
          )
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={i} className="text-lg font-semibold mt-4 first:mt-0">
              {trimmed.slice(2)}
            </h1>
          )
        }
        if (/^[-*]\s/m.test(trimmed)) {
          const items = trimmed.split(/\n/).filter((line) => /^[-*]\s/.test(line))
          return (
            <ul key={i} className="my-2 list-disc pl-5 space-y-1">
              {items.map((line) => (
                <li key={line}>{renderInline(line.replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="whitespace-pre-wrap my-2 first:mt-0">
            {renderInline(trimmed)}
          </p>
        )
      })}
    </div>
  )
}

interface LessonMarkdownPreviewProps {
  content: string
  structured?: boolean
}

export function LessonMarkdownPreview({ content, structured }: LessonMarkdownPreviewProps) {
  if (structured && content.includes('##')) {
    return <StructuredSections content={content} />
  }
  return <PlainMarkdown content={content} />
}
