import type React from 'react'

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g

function isSafeHref(href: string): boolean {
  const trimmed = href.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true
  try {
    const { protocol } = new URL(trimmed)
    return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:'
  } catch {
    return false
  }
}

/** Renders plain text with markdown-style inline links: [label](url) */
export function parseTextWithLinks(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  const re = new RegExp(LINK_PATTERN.source, 'g')
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const label = match[1]
    const href = match[2]
    if (isSafeHref(href)) {
      const external = !href.trim().startsWith('/')
      parts.push(
        <a
          key={`${match.index}-${label}`}
          href={href.trim()}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {label}
        </a>,
      )
    } else {
      parts.push(match[0])
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}
