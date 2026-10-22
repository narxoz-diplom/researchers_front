const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
  'a', 'img', 'blockquote', 'pre', 'code', 'span', 'div',
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href']),
  img: new Set(['src', 'alt']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan']),
}

function safeHref(value: string): boolean {
  try {
    const { protocol } = new URL(value, window.location.origin)
    return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:'
  } catch {
    return false
  }
}

function cloneSafe(node: Node, doc: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) return doc.createTextNode(node.textContent ?? '')
  if (node.nodeType !== Node.ELEMENT_NODE) return null

  const el = node as Element
  const tag = el.tagName.toLowerCase()
  if (!ALLOWED_TAGS.has(tag)) {
    // Unknown wrapper: keep its readable children, drop the element itself.
    const fragment = doc.createDocumentFragment()
    el.childNodes.forEach((child) => {
      const safe = cloneSafe(child, doc)
      if (safe) fragment.appendChild(safe)
    })
    return fragment
  }

  const out = doc.createElement(tag)
  const allowed = ALLOWED_ATTRS[tag]
  if (allowed) {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase()
      if (!allowed.has(name)) continue
      if (name === 'href' && !safeHref(attr.value)) continue
      // Embedded images arrive as data: URIs from the converter; remote images are dropped.
      if (name === 'src' && !attr.value.startsWith('data:image/')) continue
      out.setAttribute(name, attr.value)
    }
    if (tag === 'a' && out.hasAttribute('href')) {
      out.setAttribute('target', '_blank')
      out.setAttribute('rel', 'noopener noreferrer')
    }
  }
  el.childNodes.forEach((child) => {
    const safe = cloneSafe(child, doc)
    if (safe) out.appendChild(safe)
  })
  return out
}

/** Keeps only plain document markup (headings, lists, tables, inline formatting). */
export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const container = doc.createElement('div')
  doc.body.childNodes.forEach((child) => {
    const safe = cloneSafe(child, doc)
    if (safe) container.appendChild(safe)
  })
  return container.innerHTML
}
