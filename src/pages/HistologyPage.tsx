import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card, Notice, PageHeader } from '../components/common/ui'
import { HistologyViewer } from '../components/histology/HistologyViewer'
import { HISTOLOGY } from '../data/histology'
import { getStructure } from '../data/structures'

const List = ({ items }: { items: string[] }) => <ul className="ml-5 list-disc space-y-1 text-sm">{items.map((i) => <li key={i}>{i}</li>)}</ul>

export default function HistologyPage() {
  const [p, setP] = useSearchParams()
  const topic = HISTOLOGY.find((h) => h.id === p.get('topic')) ?? HISTOLOGY[0]
  const [shown, setShown] = useState<Record<string, boolean>>({})

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Microscopic anatomy" title="Histology laboratory" subtitle="Seven basic tissues with zoomable, labelled illustrations, identification features and practice questions." />
      <Notice tone="warn" title="These are schematic drawings">Every image here is an original illustration made for this platform. None is a microscope slide, and no real magnification applies. Photomicrographs can be added with their licence and metadata (see docs/MODEL_SOURCING.md).</Notice>
      <div role="tablist" aria-label="Tissue" className="flex flex-wrap gap-2">
        {HISTOLOGY.map((h) => <button key={h.id} role="tab" aria-selected={h.id === topic.id} onClick={() => setP({ topic: h.id }, { replace: true })} className={`rounded-full border px-3.5 py-1.5 text-sm ${h.id === topic.id ? 'border-cyan-brand bg-cyan-brand/20 text-cyan-brand' : 'border-white/15 text-text-dim hover:border-cyan-brand/50'}`}>{h.name}</button>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <HistologyViewer topic={topic} />
        <div className="space-y-4">
          <Card className="space-y-1"><p className="text-xs uppercase tracking-wide text-text-dim">Classification</p><p className="font-display font-semibold text-white">{topic.classification}</p></Card>
          <Card className="space-y-2"><h2 className="font-display font-semibold text-cyan-brand">Cellular characteristics</h2><List items={topic.cellular_characteristics} /></Card>
          <Card className="space-y-2"><h2 className="font-display font-semibold text-cyan-brand">Structural adaptations</h2><List items={topic.structural_adaptations} /></Card>
          <Card className="space-y-2"><h2 className="font-display font-semibold text-cyan-brand">Functions</h2><List items={topic.functions} /></Card>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2"><h2 className="font-display font-semibold text-white">Common locations</h2><List items={topic.locations} /></Card>
        <Card className="space-y-2"><h2 className="font-display font-semibold text-white">Identification features</h2><List items={topic.identification_features} /></Card>
        <Card className="space-y-2"><h2 className="font-display font-semibold text-white">Related organs</h2><List items={topic.related_organs} />
          {topic.related_structure_ids.length > 0 && <div className="flex flex-wrap gap-1.5 pt-1">{topic.related_structure_ids.map((id) => <Link key={id} to={`/structure/${id}`} className="rounded-full border border-cyan-brand/40 px-2.5 py-1 text-xs text-cyan-brand hover:bg-cyan-brand/10">{getStructure(id)?.anatomical_name}</Link>)}</div>}
        </Card>
      </div>
      <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Practice questions</h2>
        <ol className="space-y-2">{topic.practice.map((q, i) => { const k = `${topic.id}-${i}`; return (
          <li key={k} className="rounded-xl bg-ink-800/60 p-3 text-sm"><p className="text-white">{i + 1}. {q.question}</p><button onClick={() => setShown((s) => ({ ...s, [k]: !s[k] }))} aria-expanded={!!shown[k]} className="mt-1 text-xs font-medium text-cyan-brand hover:underline">{shown[k] ? 'Hide answer' : 'Show answer'}</button>{shown[k] && <p className="mt-1">{q.answer}</p>}</li>) })}</ol>
        <Link to="/quiz?topic=histology" className="text-sm text-cyan-brand hover:underline">Take a histology quiz →</Link>
      </Card>
    </div>
  )
}
