import { useEffect, useRef, useState } from 'react'
import { Settings } from 'lucide-react'
import { useSettings, type Quality } from '../../contexts/SettingsContext'

/** Performance and accessibility preferences. Stored in this browser only. */
export function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const s = useSettings()

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="dialog" aria-label="Display and performance settings" className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 hover:border-cyan-brand">
        <Settings className="h-4 w-4" />
      </button>
      {open && (
        <div role="dialog" aria-label="Settings" className="absolute right-0 z-50 mt-2 w-72 space-y-3 rounded-2xl border border-white/15 bg-ink-800 p-4 text-sm shadow-2xl">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-dim">3D quality</span>
            <select value={s.quality} onChange={(e) => s.setQuality(e.target.value as Quality)} className="w-full rounded-lg border border-white/15 bg-ink-900 px-2 py-2">
              <option value="auto">Auto (recommended)</option><option value="low">Low (best for older phones)</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Lightweight 2D mode<span className="block text-xs text-text-dim">Skips WebGL; structures shown as lists and diagrams.</span></span>
            <input type="checkbox" className="h-5 w-5 accent-cyan-400" checked={s.force2D} onChange={(e) => s.setForce2D(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Reduce animation<span className="block text-xs text-text-dim">Also follows your device setting.</span></span>
            <input type="checkbox" className="h-5 w-5 accent-cyan-400" checked={s.reducedMotion} onChange={(e) => s.setReducedMotion(e.target.checked)} />
          </label>
        </div>
      )}
    </div>
  )
}
