import { useMemo } from 'react'

function renderInline(text: string) {
  // **bold** and `code`; everything else is plain text.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      )
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

type Block =
  | { kind: 'heading'; level: 1 | 2 | 3; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'p'; text: string }

/** Line-based split: a heading ends its block even without a blank line after it. */
function toBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) {
      i += 1
      continue
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed)
    if (heading) {
      blocks.push({ kind: 'heading', level: heading[1].length as 1 | 2 | 3, text: heading[2] })
      i += 1
      continue
    }
    if (trimmed.startsWith('```')) {
      const code: string[] = []
      i += 1
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i])
        i += 1
      }
      i += 1
      blocks.push({ kind: 'code', text: code.join('\n') })
      continue
    }
    if (/^[-*]\s/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''))
        i += 1
      }
      blocks.push({ kind: 'ul', items })
      continue
    }
    if (/^\d+[.)]\s/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^\d+[.)]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''))
        i += 1
      }
      blocks.push({ kind: 'ol', items })
      continue
    }
    const para: string[] = []
    while (i < lines.length) {
      const t = lines[i].trim()
      if (!t || /^(#{1,3})\s/.test(t) || t.startsWith('```') || /^[-*]\s/.test(t) || /^\d+[.)]\s/.test(t)) break
      para.push(t)
      i += 1
    }
    blocks.push({ kind: 'p', text: para.join(' ') })
  }
  return blocks
}

function PlainMarkdown({ content }: { content: string }) {
  const blocks = toBlocks(content)
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {blocks.map((block, i) => {
        if (block.kind === 'heading') {
          if (block.level === 1) {
            return (
              <h1 key={i} className="text-lg font-semibold mt-4 first:mt-0">
                {renderInline(block.text)}
              </h1>
            )
          }
          if (block.level === 2) {
            return (
              <h2 key={i} className="text-base font-semibold mt-5 first:mt-0">
                {renderInline(block.text)}
              </h2>
            )
          }
          return (
            <h3 key={i} className="text-sm font-semibold mt-3 first:mt-0">
              {renderInline(block.text)}
            </h3>
          )
        }
        if (block.kind === 'code') {
          return (
            <pre key={i} className="my-2 overflow-x-auto rounded-lg bg-muted/60 p-3 font-mono text-xs leading-relaxed">
              <code>{block.text}</code>
            </pre>
          )
        }
        if (block.kind === 'ul') {
          return (
            <ul key={i} className="my-2 list-disc pl-5 space-y-1">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        }
        if (block.kind === 'ol') {
          return (
            <ol key={i} className="my-2 list-decimal pl-5 space-y-1">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={i} className="my-2 first:mt-0">
            {renderInline(block.text)}
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
