import { formatBytes, loadTimes, type AtlasBundle } from '../../data/atlas'

interface Props {
  /** Every bundle that can be added. */
  bundles: AtlasBundle[]
  /** Bundles currently loaded in the viewer. */
  loadedIds: ReadonlySet<string>
  /** Loaded bundles that are currently visible. */
  visible: ReadonlySet<string>
  onToggle: (bundleId: string) => void
}

/** Layer = bundle. Ticking an unloaded layer downloads it on demand; unticking a loaded layer hides it (the Remove
 *  button frees its memory). Sizes and measured load times are shown so the cost of each layer is visible. */
export function LayerControls({ bundles, loadedIds, visible, onToggle }: Props) {
  return (
    <fieldset className="space-y-1">
      <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-dim">Layers (loaded on demand)</legend>
      {bundles.map((b) => {
        const on = loadedIds.has(b.id) && visible.has(b.id)
        const ms = loadTimes.get(b.id)
        return (
          <label key={b.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white/5">
            <input type="checkbox" className="h-4 w-4 accent-cyan-400" checked={on} onChange={() => onToggle(b.id)} data-testid={`layer-${b.id}`} />
            <span className="flex-1">{b.title}</span>
            <span className="text-[10px] text-text-dim">{formatBytes(b.bytes)}{loadedIds.has(b.id) && ms !== undefined ? ` · ${ms} ms` : ''}</span>
          </label>
        )
      })}
    </fieldset>
  )
}
