import { Fragment, type ReactNode } from 'react'

/**
 * Minimal markdown renderer (headings, bold/italic, lists, paragraphs) that builds React elements directly.
 * It never uses dangerouslySetInnerHTML, so model output cannot inject HTML or scripts.
 */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    if (tok.startsWith('**')) out.push(<strong key={`${keyPrefix}-${i++}`} className="text-white">{tok.slice(2, -2)}</strong>)
    else if (tok.startsWith('`')) out.push(<code key={`${keyPrefix}-${i++}`} className="rounded bg-white/10 px-1 font-mono text-[0.9em]">{tok.slice(1, -1)}</code>)
    else out.push(<em key={`${keyPrefix}-${i++}`}>{tok.slice(1, -1)}</em>)
    last = m.index + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function SafeMarkdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, '').split('\n')
  const blocks: ReactNode[] = []
  let bullets: string[] = []
  let ordered: string[] = []
  let para: string[] = []
  let k = 0

  const flush = () => {
    if (para.length) { blocks.push(<p key={k++} className="leading-relaxed">{inline(para.join(' '), `p${k}`)}</p>); para = [] }
    if (bullets.length) {
      blocks.push(<ul key={k++} className="ml-5 list-disc space-y-1">{bullets.map((b, i) => <li key={i}>{inline(b, `u${k}${i}`)}</li>)}</ul>)
      bullets = []
    }
    if (ordered.length) {
      blocks.push(<ol key={k++} className="ml-5 list-decimal space-y-1">{ordered.map((b, i) => <li key={i}>{inline(b, `o${k}${i}`)}</li>)}</ol>)
      ordered = []
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    const h = /^(#{1,4})\s+(.*)$/.exec(line)
    const b = /^\s*[-*•]\s+(.*)$/.exec(line)
    const n = /^\s*\d+[.)]\s+(.*)$/.exec(line)
    if (!line.trim()) { flush(); continue }
    if (h) { flush(); blocks.push(<h4 key={k++} className="mt-1 font-display text-base font-semibold text-cyan-brand">{inline(h[2], `h${k}`)}</h4>); continue }
    if (b) { if (para.length || ordered.length) flush(); bullets.push(b[1]); continue }
    if (n) { if (para.length || bullets.length) flush(); ordered.push(n[1]); continue }
    if (bullets.length || ordered.length) flush()
    para.push(line.trim())
  }
  flush()
  return <div className="space-y-2 text-sm text-text-main">{blocks.map((x, i) => <Fragment key={i}>{x}</Fragment>)}</div>
}
