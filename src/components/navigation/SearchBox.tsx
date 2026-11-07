import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { searchAnatomy, type SearchResult } from '../../lib/search'

interface Props {
  onPick: (result: SearchResult) => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

/** Accessible combobox: arrow keys move, Enter picks, Escape closes. */
export function SearchBox({ onPick, placeholder = 'Search structures, organs, systems…', autoFocus, className = '' }: Props) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const id = useId()
  const wrap = useRef<HTMLDivElement>(null)
  const results = useMemo(() => searchAnatomy(q), [q])

  useEffect(() => setActive(0), [q])
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const pick = (r: SearchResult) => { onPick(r); setOpen(false); setQ('') }

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <label htmlFor={`${id}-input`} className="sr-only">Search anatomy</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" aria-hidden />
      <input
        id={`${id}-input`}
        type="search"
        value={q}
        autoFocus={autoFocus}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={`${id}-list`}
        aria-activedescendant={open && results[active] ? `${id}-opt-${active}` : undefined}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
          else if (e.key === 'Enter' && results[active]) { e.preventDefault(); pick(results[active]) }
          else if (e.key === 'Escape') setOpen(false)
        }}
        className="w-full rounded-xl border border-white/15 bg-ink-800/80 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-text-dim focus:border-cyan-brand focus:outline-none"
      />
      {open && q.trim().length >= 2 && (
        <ul id={`${id}-list`} role="listbox" className="absolute z-40 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-white/15 bg-ink-800 p-1 shadow-2xl scroll-thin">
          {results.length === 0 && <li className="px-3 py-2 text-sm text-text-dim" role="option" aria-selected="false">No matches for “{q}”. Try “ventricle”, “femur” or “skeletal”.</li>}
          {results.map((r, i) => (
            <li
              key={`${r.kind}-${r.id}`}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(r) }}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${i === active ? 'bg-cyan-brand/15 text-white' : 'text-text-main'}`}
            >
              <span className="min-w-0 truncate">{r.label}<span className="ml-2 text-xs text-text-dim">{r.detail}</span></span>
              <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-text-dim">{r.kind}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
