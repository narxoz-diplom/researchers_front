import { parseTextWithLinks } from '@/shared/lib/parse-text-with-links'
import { cn } from '@/lib/utils'

interface Props {
  text: string
  className?: string
  as?: 'p' | 'span' | 'div'
}

export function TextWithLinks({ text, className, as: Tag = 'span' }: Props) {
  return <Tag className={cn(className)}>{parseTextWithLinks(text)}</Tag>
}
