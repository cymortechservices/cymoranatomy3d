import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { AnatomyControls } from '../components/viewer3d/AnatomyControls'
import { LayerControls } from '../components/viewer3d/LayerControls'
import { CARDIO_ZOOM_STEPS, GuidedZoom } from '../components/viewer3d/GuidedZoom'
import { nextCommandId } from '../components/viewer3d/AnatomyViewer'
import { useAtlasView } from '../components/viewer3d/useAtlasView'
import type { CameraCommand } from '../components/viewer3d/types'
import { StructureInformationPanel } from '../components/anatomy/StructureInformationPanel'
import { AtlasInfoPanel } from '../components/anatomy/AtlasInfoPanel'
import { AtlasSearch } from '../components/anatomy/AtlasSearch'
import { HistologyViewer } from '../components/histology/HistologyViewer'
import { Breadcrumb } from '../components/navigation/Breadcrumb'
import { SearchBox } from '../components/navigation/SearchBox'
import { Spinner } from '../components/common/ui'
import { allBundles, meshLabel, PRESETS, subscribeBundles, toScene, SCENE_SCALE, type Vec3 } from '../data/atlas'
import { getStructure } from '../data/structures'
import { getHistology } from '../data/histology'
import { atlasLinkFor, resolveLink, structureForMesh } from '../lib/atlasLinks'
import { crumbsForStructure } from '../lib/breadcrumbs'
import { useUserData } from '../contexts/UserDataContext'

const AnatomyViewer = lazy(() => import('../components/viewer3d/AnatomyViewer'))
type Tab = 'info' | 'structures' | 'zoom'
const DEFAULT_BUNDLES = ['heart']
const FOV_HALF = Math.tan((20 * Math.PI) / 180)

export default function LaboratoryPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { addRecent } = useUserData()
  const [, bump] = useState(0)
  useEffect(() => subscribeBundles(() => bump((n) => n + 1)), [])

  const curatedParam = params.get('structure')
  const link = curatedParam ? atlasLinkFor(curatedParam) : undefined
  const known = useMemo(() => new Set(allBundles().map((b) => b.id)), [])
  const bundleIds = useMemo(() => {
    const fromUrl = (params.get('b') ?? '').split(',').filter((id) => known.has(id) || allBundles().some((b) => b.id === id))
    if (fromUrl.length) return fromUrl
    if (link) return [link.bundle]
    return DEFAULT_BUNDLES
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, link])

  const [retryKey, setRetryKey] = useState(0)
  const { view, loading, error } = useAtlasView(bundleIds, retryKey)

  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [curatedId, setCuratedId] = useState<string | null>(null)
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set())
  const [isolated, setIsolated] = useState<ReadonlySet<string> | null>(null)
  const [xray, setXray] = useState(false)
  const [showLabels, setShowLabels] = useState(false)
  const [tab, setTab] = useState<Tab>('info')
  const [command, setCommand] = useState<CameraCommand | null>(null)
  const [zoomIndex, setZoomIndex] = useState(0)
  const [tissue, setTissue] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [announce, setAnnounce] = useState('')
  const pending = useRef<{ ids: string[]; curated?: string; xray?: boolean } | null>(null)
  const stage = useRef<HTMLDivElement>(null)
  const fullscreenSupported = typeof document !== 'undefined' && !!document.fullscreenEnabled

  const send = useCallback((c: CameraCommand) => setCommand(c), [])
  const setBundles = useCallback((ids: string[], replace = false) => {
    const next = new URLSearchParams(); next.set('b', ids.join(',')); setParams(next, { replace })
  }, [setParams])

  const focusOn = useCallback((ids: string[]) => {
    if (!view) return
    const boxes = ids.map((id) => view.parts.get(id)?.row.bbox).filter((b): b is NonNullable<typeof b> => !!b)
    if (!boxes.length) return
    const lo: Vec3 = [Infinity, Infinity, Infinity]; const hi: Vec3 = [-Infinity, -Infinity, -Infinity]
    for (const b of boxes) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], b[0][i]); hi[i] = Math.max(hi[i], b[1][i]) }
    const centre = toScene([(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2])
    const extent = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) * SCENE_SCALE
    send({ id: nextCommandId(), type: 'focus', position: centre, distance: Math.max(0.12, (extent / 2 / FOV_HALF) * 1.5) })
  }, [view, send])

  // visibility state is per view
  useEffect(() => { setHidden(new Set()); setIsolated(null) }, [view?.id])

  // apply a selection requested before its bundle had finished loading
  useEffect(() => {
    if (!view || !pending.current) return
    const p = pending.current
    const ids = p.ids.filter((id) => view.parts.has(id))
    if (!ids.length) return
    pending.current = null
    setSelected(new Set(ids)); setCuratedId(p.curated ?? null)
    if (p.xray !== undefined) setXray(p.xray)
    setTab('info'); focusOn(ids)
    setAnnounce(`Selected ${ids.length === 1 ? meshLabel(view.parts.get(ids[0])!.row) : `${ids.length} structures`}`)
  }, [view, focusOn])

  // deep link from other pages: /laboratory?structure=left-ventricle  or  ?part=<mesh id>
  const handled = useRef<string>('')
  useEffect(() => {
    const key = `${curatedParam ?? ''}|${params.get('part') ?? ''}`
    if (handled.current === key || !view) return
    if (curatedParam && link) {
      const rows = [...view.parts.values()].filter((p) => p.bundle === link.bundle).map((p) => p.row)
      const ids = resolveLink(link, rows)
      if (ids.length) { handled.current = key; pending.current = { ids, curated: curatedParam }; addRecent(curatedParam); setSelected(new Set(ids)); setCuratedId(curatedParam); focusOn(ids); setTab('info') }
    } else if (params.get('part') && view.parts.has(params.get('part')!)) {
      handled.current = key; setSelected(new Set([params.get('part')!])); focusOn([params.get('part')!])
    }
  }, [view, curatedParam, link, params, focusOn, addRecent])

  useEffect(() => {
    const on = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', on)
    return () => document.removeEventListener('fullscreenchange', on)
  }, [])

  const selectPart = useCallback((id: string | null, bundle?: string) => {
    if (!id) { setSelected(new Set()); setCuratedId(null); return }
    if (bundle && !bundleIds.includes(bundle)) { pending.current = { ids: [id] }; setBundles([...bundleIds, bundle]); return }
    const part = view?.parts.get(id)
    setSelected(new Set([id])); setTab('info')
    if (part && view) {
      const rows = [...view.parts.values()].filter((p) => p.bundle === part.bundle).map((p) => p.row)
      const sid = structureForMesh(part.bundle, part.row, rows)
      setCuratedId(sid ?? null)
      if (sid) addRecent(sid)
      setAnnounce(`Selected ${meshLabel(part.row)}`)
    }
  }, [bundleIds, setBundles, view, addRecent])

  const selectCurated = useCallback((id: string) => {
    const l = atlasLinkFor(id)
    const s = getStructure(id)
    if (!l || !s) { navigate(`/structure/${id}`); return }
    addRecent(id)
    if (!bundleIds.includes(l.bundle)) { setBundles([...bundleIds, l.bundle]); handled.current = ''; setParams((p) => { const n = new URLSearchParams(p); n.set('structure', id); return n }); return }
    const rows = [...(view?.parts.values() ?? [])].filter((p) => p.bundle === l.bundle).map((p) => p.row)
    const ids = resolveLink(l, rows)
    setSelected(new Set(ids)); setCuratedId(id); setTab('info'); focusOn(ids)
    setAnnounce(`Selected ${s.anatomical_name}`)
  }, [bundleIds, view, navigate, setBundles, setParams, focusOn, addRecent])

  const toggleLayer = (id: string) => {
    if (bundleIds.includes(id)) {
      if (bundleIds.length === 1) { setAnnounce('At least one layer must stay loaded'); return }
      setBundles(bundleIds.filter((b) => b !== id), true)
      setSelected(new Set()); setCuratedId(null)
    } else setBundles([...bundleIds, id], true)
  }

  const hideSelected = () => { if (selected.size) { setHidden((h) => new Set([...h, ...selected])); setSelected(new Set()); setAnnounce('Structure hidden') } }
  const toggleIsolate = () => setIsolated((cur) => (cur ? null : selected.size ? new Set(selected) : null))
  const showAll = () => { setHidden(new Set()); setIsolated(null); setXray(false); setAnnounce('All structures visible') }
  const toggleFullscreen = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await stage.current?.requestFullscreen() } catch { /* unsupported or denied */ } }

  const goZoom = (i: number) => {
    const step = CARDIO_ZOOM_STEPS[i]
    setZoomIndex(i); setTissue(null); setIsolated(null); setHidden(new Set()); setSelected(new Set()); setCuratedId(null)
    pending.current = step.select ? { ids: step.select, xray: !!step.xray, curated: step.id === 'structure' || step.id === 'tissue' ? 'left-ventricle' : undefined } : null
    setXray(!!step.xray)
    const same = step.bundles.length === bundleIds.length && step.bundles.every((b) => bundleIds.includes(b))
    if (!same) setBundles(step.bundles)
    else { if (step.select) { setSelected(new Set(step.select)); setCuratedId(pending.current?.curated ?? null); focusOn(step.select); pending.current = null } else send({ id: nextCommandId(), type: step.id === 'organ' ? 'fit' : 'reset' }) }
    if (step.tissue) setTissue(step.tissue)
  }

  const presetId = PRESETS.find((p) => p.bundles.length === bundleIds.length && p.bundles.every((b) => bundleIds.includes(b)))?.id ?? 'custom'
  const first = [...selected][0]
  const firstPart = first ? view?.parts.get(first) : undefined
  const curated = curatedId ? getStructure(curatedId) : undefined
  const crumbs = crumbsForStructure(curatedId ?? undefined)
  const openTissue = getHistology(tissue ?? '')
  const requestedIds = useMemo(() => new Set(bundleIds), [bundleIds])
  const listParts = useMemo(() => {
    const n = filter.trim().toLowerCase()
    return [...(view?.parts.values() ?? [])].filter((p) => !n || p.row.name.toLowerCase().includes(n) || p.row.latin?.toLowerCase().includes(n)).slice(0, 200)
  }, [view, filter])

  const tabBtn = (t: Tab, label: string) => (
    <button role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${tab === t ? 'bg-cyan-brand/20 text-cyan-brand' : 'text-text-dim hover:bg-white/5'}`}>{label}</button>
  )

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:flex-row" data-testid="laboratory">
      <section className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:p-4" aria-label="3D viewport">
        <h1 className="sr-only">3D anatomy laboratory</h1>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Breadcrumb items={crumbs} />
          <label className="flex items-center gap-2 text-xs text-text-dim">View
            <select value={presetId} data-testid="model-select" aria-label="Choose anatomical view"
              onChange={(e) => { const p = PRESETS.find((x) => x.id === e.target.value); if (p) { setSelected(new Set()); setCuratedId(null); setZoomIndex(0); setBundles(p.bundles) } }}
              className="rounded-lg border border-white/15 bg-ink-800 px-2 py-1.5 text-sm text-text-main">
              {presetId === 'custom' && <option value="custom">Custom layers</option>}
              {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        </div>

        <div ref={stage} className={`relative flex flex-1 flex-col gap-2 ${fullscreen ? 'bg-ink-900 p-3' : ''}`}>
          <div className="relative min-h-[52vh] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink-800/70 to-ink-950" data-testid="viewport">
            <Suspense fallback={<Spinner label="Loading 3D viewer" />}>
              <AnatomyViewer view={view} loading={loading} error={error} onRetryManifest={() => setRetryKey((n) => n + 1)}
                selected={selected} onSelectPart={selectPart} hidden={hidden} isolated={isolated} xray={xray} showLabels={showLabels} command={command} />
            </Suspense>
            <p className="pointer-events-none absolute bottom-2 left-3 right-3 text-center text-[11px] text-text-dim">Drag to rotate · scroll or pinch to zoom · right-drag or two fingers to pan · click a structure</p>
          </div>
          <AnatomyControls onCommand={send} showLabels={showLabels} onToggleLabels={() => setShowLabels((l) => !l)}
            hasSelection={selected.size > 0} isolated={!!isolated} onHideSelected={hideSelected} onToggleIsolate={toggleIsolate} onShowAll={showAll}
            fullscreen={fullscreen} onToggleFullscreen={toggleFullscreen} fullscreenSupported={fullscreenSupported} xray={xray} onToggleXray={() => setXray((x) => !x)} />
        </div>
        <p className="sr-only" aria-live="polite" data-testid="announce">{announce}</p>
        <p className="text-[11px] text-text-dim">
          Real anatomical meshes from the Z-Anatomy atlas (CC BY-SA 4.0, derived from BodyParts3D), simplified for the web. Educational use only; not for diagnosis. <span className="text-gold-brand">Sizes are relative to a single adult male reference body.</span>
        </p>
      </section>

      <aside className="w-full shrink-0 border-t border-white/10 bg-ink-950/50 lg:w-[26rem] lg:border-l lg:border-t-0" aria-label="Anatomy information">
        <div className="sticky top-14 space-y-3 p-3 sm:p-4 lg:max-h-[calc(100dvh-4rem)] lg:overflow-y-auto scroll-thin">
          <AtlasSearch onPick={(h) => selectPart(h.row.id, h.bundle)} />
          <SearchBox onPick={(r) => (r.kind === 'structure' ? selectCurated(r.id) : navigate(r.href))} placeholder="Search lessons, organs, systems…" />
          <div role="tablist" aria-label="Panels" className="flex gap-1 rounded-xl bg-ink-800/70 p-1">{tabBtn('info', 'Information')}{tabBtn('structures', 'Structures')}{tabBtn('zoom', 'Guided zoom')}</div>

          {tab === 'info' && (
            view && firstPart ? (
              <div className="space-y-5">
                {curated && <StructureInformationPanel key={curated.id} structure={curated} compact onSelectRelated={selectCurated} onOpenTissue={setTissue} />}
                {selected.size > 1 && <p className="text-xs text-text-dim">{selected.size} meshes are highlighted for this structure. Details of the first are shown below; click any mesh to inspect it.</p>}
                <AtlasInfoPanel key={firstPart.row.id} view={view} partId={firstPart.row.id} onSelectPart={(id) => { selectPart(id); focusOn([id]) }} />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-text-dim" data-testid="no-selection">
                <p className="font-display text-base text-white">Select a structure</p>
                <p className="mt-1">Click a part of the 3D model, pick one from the Structures tab, or search above. Its name, Latin terminology, hierarchy and credits appear here.</p>
              </div>
            )
          )}

          {tab === 'structures' && (
            <div className="space-y-3">
              <LayerControls bundles={allBundles()} loadedIds={requestedIds} visible={requestedIds} onToggle={toggleLayer} />
              <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter loaded structures…" aria-label="Filter loaded structures" className="w-full rounded-lg border border-white/15 bg-ink-800 px-3 py-2 text-sm text-white" />
              <ul className="space-y-1" aria-label="Structures in view">
                {listParts.length === 0 && <li className="text-sm text-text-dim">{loading ? 'Loading…' : 'No structures match.'}</li>}
                {listParts.map(({ row, bundle }) => {
                  const active = selected.has(row.id)
                  return (
                    <li key={row.id} className="flex items-center gap-1">
                      <button onClick={() => { selectPart(row.id, bundle); focusOn([row.id]) }} aria-pressed={active} className={`flex flex-1 items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-left text-sm ${active ? 'border-cyan-brand bg-cyan-brand/15 text-white' : 'border-white/10 bg-ink-800/60 hover:border-cyan-brand/50'}`}>
                        <span className={hidden.has(row.id) ? 'line-through opacity-60' : ''}>{meshLabel(row)}</span>
                      </button>
                      <button onClick={() => setHidden((h) => { const n = new Set(h); if (n.has(row.id)) n.delete(row.id); else n.add(row.id); return n })} aria-label={hidden.has(row.id) ? `Show ${row.name}` : `Hide ${row.name}`} className="rounded-lg border border-white/10 px-2 py-1.5 text-xs text-text-dim hover:text-white">{hidden.has(row.id) ? 'Show' : 'Hide'}</button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {tab === 'zoom' && <GuidedZoom steps={CARDIO_ZOOM_STEPS} index={zoomIndex} onGo={goZoom} />}
        </div>
      </aside>

      {openTissue && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-3" role="dialog" aria-modal="true" aria-label={`${openTissue.name} histology view`}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-ink-900 p-4 scroll-thin">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div><h2 className="font-display text-lg font-bold text-white">{openTissue.name}</h2><p className="text-xs text-gold-brand">Tissue level: a separate schematic illustration. The 3D model does not contain microscopic detail.</p></div>
              <button onClick={() => setTissue(null)} aria-label="Close histology view" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15"><X className="h-4 w-4" /></button>
            </div>
            <HistologyViewer topic={openTissue} />
          </div>
        </div>
      )}
    </div>
  )
}
