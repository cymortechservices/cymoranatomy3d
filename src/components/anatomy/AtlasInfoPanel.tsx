import { ChevronRight, ExternalLink, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { allBundles, formatBytes, loadTimes, meshLabel, SYSTEM_LABEL, type MeshRow } from '../../data/atlas'
import { structureForMesh } from '../../lib/atlasLinks'
import { getStructure } from '../../data/structures'
import { Badge } from '../common/ui'
import type { AtlasView } from '../viewer3d/types'

interface Props {
  view: AtlasView
  partId: string
  /** Select another mesh (parent-child navigation). */
  onSelectPart: (id: string) => void
}

/** Facts that come straight from the source atlas: names, hierarchy, credits. Nothing here is invented; where
 *  CYMOR has written teaching text for the structure, the page shows it separately. */
export function AtlasInfoPanel({ view, partId, onSelectPart }: Props) {
  const part = view.parts.get(partId)
  if (!part) return null
  const { row, bundle: bundleId } = part
  const bundle = allBundles().find((b) => b.id === bundleId)!
  const meshes: MeshRow[] = [...view.parts.values()].filter((p) => p.bundle === bundleId).map((p) => p.row)
  const parent = row.parent ? view.parts.get(row.parent)?.row : undefined
  const children = meshes.filter((m) => m.parent === row.id)
  const lastGroup = row.group_path[row.group_path.length - 1]
  const siblings = meshes.filter((m) => m.id !== row.id && m.parent === row.parent && m.group_path[m.group_path.length - 1] === lastGroup).slice(0, 14)
  const curatedId = structureForMesh(bundleId, row, meshes)
  const curated = curatedId ? getStructure(curatedId) : undefined
  const chip = (m: MeshRow) => (
    <button key={m.id} onClick={() => onSelectPart(m.id)} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-text-main hover:border-cyan-brand hover:text-cyan-brand">{meshLabel(m)}</button>
  )
  return (
    <div className="space-y-4" data-testid="atlas-info">
      <header>
        <h2 className="font-display text-xl font-bold text-white">{row.name}{row.side ? <span className="ml-2 text-sm font-normal text-text-dim">({row.side})</span> : null}</h2>
        {row.latin && <p className="text-sm italic text-text-dim">{row.latin} <span className="not-italic text-[10px]">(Terminologia Anatomica)</span></p>}
        <div className="mt-2 flex flex-wrap gap-1.5"><Badge>{SYSTEM_LABEL[bundle.system] ?? bundle.system}</Badge><Badge tone="slate">{bundle.title}</Badge></div>
      </header>

      {row.group_path.length > 0 && (
        <nav aria-label="Position in the anatomical hierarchy" className="flex flex-wrap items-center gap-1 text-xs text-text-dim">
          {row.group_path.map((g, i) => <span key={i} className="inline-flex items-center gap-1">{i > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}{g}</span>)}
        </nav>
      )}

      {parent && <section><h3 className="mb-1 font-display text-sm font-semibold text-cyan-brand">Part of</h3><div className="flex flex-wrap gap-1.5">{chip(parent)}</div></section>}
      {children.length > 0 && <section><h3 className="mb-1 font-display text-sm font-semibold text-cyan-brand">Contains</h3><div className="flex flex-wrap gap-1.5">{children.slice(0, 20).map(chip)}</div></section>}
      {siblings.length > 0 && <section><h3 className="mb-1 font-display text-sm font-semibold text-cyan-brand">Related structures</h3><div className="flex flex-wrap gap-1.5">{siblings.map(chip)}</div></section>}

      {curated ? (
        <p className="rounded-lg bg-cyan-brand/10 p-3 text-sm text-text-main">
          CYMOR has written teaching notes for this structure: <Link className="font-medium text-cyan-brand underline" to={`/structure/${curated.id}`}>{curated.anatomical_name} <ExternalLink className="inline h-3 w-3" aria-hidden /></Link>
        </p>
      ) : (
        <p className="flex gap-2 rounded-lg bg-white/5 p-3 text-xs text-text-dim"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />Teaching notes (functions, clinical relevance) have not been written for this structure yet. The name, terminology, hierarchy and 3D geometry above come from the Z-Anatomy atlas.</p>
      )}

      <section className="rounded-xl border border-white/10 bg-ink-800/60 p-3 text-xs text-text-dim" aria-label="Model credits">
        <h3 className="mb-1 font-display text-sm font-semibold text-white">Model credits</h3>
        <p>{bundle.attribution}</p>
        <p className="mt-1">By {bundle.creator}. Licence: <a className="text-cyan-brand underline" href={bundle.licence_url} target="_blank" rel="noreferrer">{bundle.licence}</a>. <a className="text-cyan-brand underline" href={bundle.source_url} target="_blank" rel="noreferrer">Original source</a>.</p>
        <p className="mt-1">Modified by CymorTechServices (converted, decimated, recoloured): see <Link to="/references" className="text-cyan-brand underline">Credits</Link>. Reduced to {Math.round((row.tris_out / Math.max(1, row.tris_source)) * 100)}% of its source triangles ({row.tris_out.toLocaleString()} shown).</p>
        <p className="mt-1">Bundle {formatBytes(bundle.bytes)}{loadTimes.get(bundle.id) !== undefined ? ` · loaded in ${loadTimes.get(bundle.id)} ms` : ''}.</p>
      </section>
    </div>
  )
}
