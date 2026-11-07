import { useCallback, useEffect, useRef, useState } from 'react'
import { Minus, Plus, RotateCcw, Tag } from 'lucide-react'
import type { HistologyTopic } from '../../types'
import { HistologySchematic } from './HistologySchematics'

const W = 400
const H = 300
const MIN = 1
const MAX = 6

interface View { s: number; x: number; y: number }

const clampView = (v: View): View => {
  const s = Math.min(MAX, Math.max(MIN, v.s))
  return { s, x: Math.min(0, Math.max(W - W * s, v.x)), y: Math.min(0, Math.max(H - H * s, v.y)) }
}

/** Zoom / pan image viewer with labels and image metadata. Supports wheel, drag, pinch and buttons. */
export function HistologyViewer({ topic }: { topic: HistologyTopic }) {
  const [view, setView] = useState<View>({ s: 1, x: 0, y: 0 })
  const [labels, setLabels] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const lastPinch = useRef<number | null>(null)
  const viewRef = useRef(view)
  viewRef.current = view

  const toSvg = (cx: number, cy: number) => {
    const r = svgRef.current!.getBoundingClientRect()
    return { x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * H }
  }

  const zoomAt = useCallback((factor: number, px = W / 2, py = H / 2) => {
    setView((v) => {
      const s = Math.min(MAX, Math.max(MIN, v.s * factor))
      const k = s / v.s
      return clampView({ s, x: px - (px - v.x) * k, y: py - (py - v.y) * k })
    })
  }, [])

  useEffect(() => setView({ s: 1, x: 0, y: 0 }), [topic.id])

  // wheel must be a non-passive listener to prevent page scroll
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const p = toSvg(e.clientX, e.clientY)
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, p.x, p.y)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]
    if (pts.length === 2) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      if (lastPinch.current) {
        const mid = toSvg((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2)
        zoomAt(d / lastPinch.current, mid.x, mid.y)
      }
      lastPinch.current = d
      return
    }
    const r = svgRef.current!.getBoundingClientRect()
    const dx = ((e.clientX - prev.x) / r.width) * W
    const dy = ((e.clientY - prev.y) / r.height) * H
    setView((v) => clampView({ ...v, x: v.x + dx, y: v.y + dy }))
  }
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    lastPinch.current = null
  }

  const onKey = (e: React.KeyboardEvent) => {
    const step = 20
    if (e.key === '+' || e.key === '=') zoomAt(1.25)
    else if (e.key === '-') zoomAt(0.8)
    else if (e.key === '0') setView({ s: 1, x: 0, y: 0 })
    else if (e.key === 'ArrowLeft') setView((v) => clampView({ ...v, x: v.x + step }))
    else if (e.key === 'ArrowRight') setView((v) => clampView({ ...v, x: v.x - step }))
    else if (e.key === 'ArrowUp') setView((v) => clampView({ ...v, y: v.y + step }))
    else if (e.key === 'ArrowDown') setView((v) => clampView({ ...v, y: v.y - step }))
    else return
    e.preventDefault()
  }

  const img = topic.image
  const btn = 'grid h-9 w-9 place-items-center rounded-lg border border-white/15 bg-ink-800/90 text-text-main hover:border-cyan-brand hover:text-cyan-brand'

  return (
    <figure className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
        <svg
          ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="block aspect-[4/3] w-full cursor-grab touch-none select-none active:cursor-grabbing" tabIndex={0}
          role="img" aria-label={`${topic.name}: ${img.kind === 'schematic' ? 'schematic illustration' : 'photomicrograph'}. Arrow keys pan, plus and minus zoom, 0 resets.`}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onKey}
          data-testid="histology-svg" data-zoom={view.s.toFixed(2)}
        >
          <g transform={`translate(${view.x} ${view.y}) scale(${view.s})`}>
            {img.kind === 'photomicrograph' && img.url ? <image href={img.url} width={W} height={H} /> : <HistologySchematic topicId={topic.id} />}
            {labels && img.labels.map((l) => {
              const left = l.x > 250
              const fs = 11 / view.s
              return (
                <g key={l.text}>
                  <circle cx={l.x} cy={l.y} r={3.5 / view.s} fill="#22d3ee" stroke="#050913" strokeWidth={1 / view.s} />
                  <text x={l.x + (left ? -7 : 7) / view.s} y={l.y - 5 / view.s} fontSize={fs} fontWeight={700} textAnchor={left ? 'end' : 'start'} fill="#ffffff" stroke="#050913" strokeWidth={3 / view.s} paintOrder="stroke" strokeLinejoin="round">{l.text}</text>
                </g>
              )
            })}
          </g>
        </svg>
        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          <button className={btn} onClick={() => zoomAt(1.4)} aria-label="Zoom in" title="Zoom in"><Plus className="h-4 w-4" /></button>
          <button className={btn} onClick={() => zoomAt(1 / 1.4)} aria-label="Zoom out" title="Zoom out"><Minus className="h-4 w-4" /></button>
          <button className={btn} onClick={() => setView({ s: 1, x: 0, y: 0 })} aria-label="Reset view" title="Reset view"><RotateCcw className="h-4 w-4" /></button>
          <button className={`${btn} ${labels ? 'border-cyan-brand text-cyan-brand' : ''}`} onClick={() => setLabels((l) => !l)} aria-pressed={labels} aria-label="Toggle labels" title="Toggle labels"><Tag className="h-4 w-4" /></button>
        </div>
        <span className="absolute bottom-2 left-2 rounded bg-ink-950/80 px-2 py-0.5 text-[11px] text-text-dim">Zoom {view.s.toFixed(1)}×</span>
      </div>
      <figcaption className="grid gap-x-6 gap-y-1 rounded-xl bg-ink-800/60 p-3 text-xs text-text-dim sm:grid-cols-2">
        <p className="sm:col-span-2 font-semibold text-gold-brand">{img.kind === 'schematic' ? 'Schematic illustration: not a microscope image.' : 'Photomicrograph.'}</p>
        <p><span className="text-text-main">Credit:</span> {img.credit}</p>
        <p><span className="text-text-main">Licence:</span> {img.licence}</p>
        <p><span className="text-text-main">Magnification:</span> {img.magnification}</p>
        <p><span className="text-text-main">Stain:</span> {img.stain}</p>
      </figcaption>
    </figure>
  )
}
