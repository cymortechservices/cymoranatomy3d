import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { searchAtlas, loadAtlasIndex, type AtlasHit } from '../../lib/atlasSearch'
import { allBundles, meshLabel } from '../../data/atlas'

/** Searches every mesh in the atlas (all bundles), including ones that are not loaded yet. Choosing a result loads
 *  its bundle on demand and selects the structure. */
export function AtlasSearch({ onPick }: { onPick: (hit: AtlasHit) => void }) {
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<AtlasHit[]>([])
  const [busy, setBusy] = useState(false)
  const seq = useRef(0)
  useEffect(() => {
    const n = ++seq.current
    if (q.trim().length < 2) { setHits([]); return }
    setBusy(true)
    const t = setTimeout(() => { searchAtlas(q).then((h) => { if (n === seq.current) { setHits(h); setBusy(false) } }).catch(() => setBusy(false)) }, 150)
    return () => clearTimeout(t)
  }, [q])
  return (
    <div className="relative">
      <label className="relative block">
        <span className="sr-only">Search all anatomical structures</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => { void loadAtlasIndex() }} placeholder="Search all 2,800+ structures…" data-testid="atlas-search"
          className="w-full rounded-xl border border-white/15 bg-ink-800 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-text-dim focus:border-cyan-brand focus:outline-none" />
      </label>
      {q.trim().length >= 2 && (
        <ul className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-white/15 bg-ink-900 p-1 shadow-xl scroll-thin" role="listbox" aria-label="Search results">
          {hits.length === 0 && <li className="px-3 py-2 text-sm text-text-dim">{busy ? 'Searching…' : 'No matching structure in the atlas.'}</li>}
          {hits.map((h) => (
            <li key={h.row.id}>
              <button role="option" aria-selected="false" onClick={() => { onPick(h); setQ(''); setHits([]) }} className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5">
                <span>{meshLabel(h.row)}</span>
                <span className="text-[10px] uppercase tracking-wide text-text-dim">{allBundles().find((b) => b.id === h.bundle)?.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
