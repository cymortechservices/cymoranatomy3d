import { useMemo, useState } from 'react'
import { Box, ImageOff } from 'lucide-react'
import { meshLabel } from '../../data/atlas'
import type { AtlasView } from './types'

interface Props {
  view: AtlasView | null
  reason: 'no-webgl' | 'forced' | 'error' | 'context-lost'
  detail?: string
  selected: ReadonlySet<string>
  onSelectPart: (partId: string | null, bundle?: string) => void
  onRetry?: () => void
  onTry3D?: () => void
}

const REASON_TEXT: Record<Props['reason'], string> = {
  'no-webgl': 'Your browser or device does not support WebGL, so the 3D view cannot start. The structures are listed below so you can still learn from their information.',
  forced: 'Lightweight 2D mode is on. Structures are listed below; switch 3D back on any time.',
  error: 'The 3D model could not be loaded. You can retry, or continue with the structure list.',
  'context-lost': 'The graphics context was lost (this can happen on low-memory devices). Retry, or continue with the structure list.',
}

/** Honest fallback: no pictures are substituted for the 3D models, only the list of real structures. */
export function ViewerFallback2D({ view, reason, detail, selected, onSelectPart, onRetry, onTry3D }: Props) {
  const [q, setQ] = useState('')
  const rows = useMemo(() => {
    const all = [...(view?.parts.values() ?? [])]
    const needle = q.trim().toLowerCase()
    return (needle ? all.filter((p) => p.row.name.toLowerCase().includes(needle)) : all).slice(0, 150)
  }, [view, q])
  return (
    <div className="flex h-full w-full flex-col gap-3 overflow-auto p-4 scroll-thin" data-testid="viewer-fallback">
      <div className="glass flex items-start gap-3 rounded-xl p-3 text-sm" role="status">
        <ImageOff className="mt-0.5 h-5 w-5 shrink-0 text-gold-brand" aria-hidden />
        <div>
          <p className="text-text-main">{REASON_TEXT[reason]}</p>
          {detail && <p className="mt-1 text-xs text-text-dim">Details: {detail}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            {onRetry && <button onClick={onRetry} className="rounded-lg bg-cyan-brand px-3 py-1.5 text-xs font-semibold text-ink-950">Retry</button>}
            {onTry3D && reason === 'forced' && <button onClick={onTry3D} className="inline-flex items-center gap-1 rounded-lg border border-cyan-brand/50 px-3 py-1.5 text-xs font-semibold text-cyan-brand"><Box className="h-3.5 w-3.5" aria-hidden />Switch 3D on</button>}
          </div>
        </div>
      </div>
      {view && (
        <>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter structures…" aria-label="Filter structures" className="rounded-lg border border-white/15 bg-ink-800 px-3 py-2 text-sm text-white" />
          <ul className="grid content-start gap-1.5 sm:grid-cols-2" aria-label="Structures in this view">
            {rows.map(({ row, bundle }) => {
              const active = selected.has(row.id)
              return (
                <li key={row.id}>
                  <button onClick={() => onSelectPart(active ? null : row.id, bundle)} aria-pressed={active} className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${active ? 'border-cyan-brand bg-cyan-brand/15 text-white' : 'border-white/10 bg-ink-800/60 text-text-main hover:border-cyan-brand/50'}`}>{meshLabel(row)}</button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
