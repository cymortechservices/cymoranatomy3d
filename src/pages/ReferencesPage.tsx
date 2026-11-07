import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Notice, PageHeader } from '../components/common/ui'
import { allBundles, BODYPARTS3D, formatBytes, loadManifest, MODIFICATIONS, SKIPPED_SOURCE_OBJECTS, SYSTEM_LABEL, Z_ANATOMY, type AtlasBundle, type MeshRow } from '../data/atlas'
import { HISTOLOGY } from '../data/histology'

const BOOKS = [
  ["Gray's Anatomy for Students", 'Drake, Vogl & Mitchell, Elsevier'],
  ['Clinically Oriented Anatomy', 'Moore, Dalley & Agur, Wolters Kluwer'],
  ['Guyton and Hall Textbook of Medical Physiology', 'Hall & Hall, Elsevier'],
  ['Histology: A Text and Atlas', 'Pawlina, Wolters Kluwer'],
  ["Langman's Medical Embryology", 'Sadler, Wolters Kluwer'],
]

function MeshList({ bundle }: { bundle: AtlasBundle }) {
  const [rows, setRows] = useState<MeshRow[] | null>(null)
  const [err, setErr] = useState('')
  return (
    <details className="mt-1" onToggle={(e) => { if ((e.target as HTMLDetailsElement).open && !rows) loadManifest(bundle).then((m) => setRows(m.meshes)).catch((x: Error) => setErr(x.message)) }}>
      <summary className="cursor-pointer text-xs text-cyan-brand">Show all {bundle.mesh_count} structures and their source objects</summary>
      {err && <p className="text-xs text-rose-300">{err}</p>}
      {rows && <ul className="mt-2 max-h-64 columns-1 gap-4 overflow-auto text-[11px] text-text-dim sm:columns-2 scroll-thin">{rows.map((r) => <li key={r.id} className="break-inside-avoid">{r.name}{r.side ? ` (${r.side})` : ''}{r.latin ? ` · ${r.latin}` : ''}</li>)}</ul>}
    </details>
  )
}

export default function ReferencesPage() {
  const bundles = allBundles()
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Credits" title="Credits and anatomical model sources" subtitle="Who made the 3D anatomy, under which licence, and what CYMOR changed." />

      <Notice title="Who made what">
        The 3D anatomical models are the work of the <strong>Z-Anatomy</strong> project and, underneath it, <strong>BodyParts3D</strong>. CYMOR ANATOMY 3D did not create them. The CYMOR ANATOMY 3D application, its teaching notes, quizzes, tutor and interface are by Legendary Smiley Cymor, powered by CymorTechServices (© CymorTechServices 2026).
      </Notice>

      <Card className="space-y-2 text-sm">
        <h2 className="font-display text-lg font-semibold text-white">Original sources</h2>
        <p><strong className="text-white">{Z_ANATOMY.source}</strong>: {Z_ANATOMY.creator}. Licence <a className="text-cyan-brand underline" href={Z_ANATOMY.licence_url} target="_blank" rel="noreferrer">{Z_ANATOMY.licence}</a>. <a className="text-cyan-brand underline" href={Z_ANATOMY.source_url} target="_blank" rel="noreferrer">Source repository</a> · <a className="text-cyan-brand underline" href={Z_ANATOMY.site_url} target="_blank" rel="noreferrer">z-anatomy.com</a></p>
        <p><strong className="text-white">{BODYPARTS3D.source}</strong>: {BODYPARTS3D.creator}. Licence {BODYPARTS3D.licence}. <a className="text-cyan-brand underline" href={BODYPARTS3D.source_url} target="_blank" rel="noreferrer">Original database</a> · <a className="text-cyan-brand underline" href={BODYPARTS3D.download_url} target="_blank" rel="noreferrer">Downloads</a>. Z-Anatomy's meshes are built on BodyParts3D; this build uses them through Z-Anatomy, not by separate download.</p>
        <p className="text-text-dim">Required attribution: {Z_ANATOMY.attribution}</p>
        <p className="text-text-dim">Share-alike: because the models are adapted from CC BY-SA material, the converted GLB files and manifests in <code>public/models/zanatomy/</code> are redistributed under <strong>CC BY-SA 4.0</strong>. The application source code is MIT-licensed; that licence does not apply to the model files.</p>
      </Card>

      <Card className="space-y-2 text-sm">
        <h2 className="font-display text-lg font-semibold text-white">What CYMOR changed</h2>
        <p className="text-text-dim">{MODIFICATIONS}</p>
        <p className="text-text-dim">The Latin names shown come from the Terminologia Anatomica list distributed with Z-Anatomy and are shown only where the English name matches exactly.</p>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold text-white">Models in this build</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-text-dim"><tr><th className="py-2 pr-3">Model</th><th className="pr-3">System</th><th className="pr-3">Creator / source</th><th className="pr-3">Licence</th><th className="pr-3">Size</th><th className="pr-3">Modified</th><th>Tested</th></tr></thead>
            <tbody>
              {bundles.map((b) => (
                <tr key={b.id} className="border-t border-white/10 align-top">
                  <td className="py-2 pr-3 text-white">{b.title}<div className="text-xs text-text-dim">{b.mesh_count} structures · {b.tris_out.toLocaleString()} triangles (source {b.tris_source.toLocaleString()})</div><MeshList bundle={b} /></td>
                  <td className="pr-3">{SYSTEM_LABEL[b.system] ?? b.system}</td>
                  <td className="pr-3 text-xs"><div>{b.creator}</div><a className="text-cyan-brand underline" href={b.source_url} target="_blank" rel="noreferrer">{b.source}</a></td>
                  <td className="pr-3"><a className="text-cyan-brand underline" href={b.licence_url} target="_blank" rel="noreferrer">{b.licence}</a></td>
                  <td className="pr-3">{formatBytes(b.bytes)}</td>
                  <td className="pr-3">{b.modified ? 'Yes' : 'No'}</td>
                  <td className="capitalize">{b.verification.status}{b.verification.checked_at ? <div className="text-[10px] text-text-dim">{b.verification.checked_at.slice(0, 10)}</div> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="space-y-2 text-sm">
        <h2 className="font-display text-lg font-semibold text-white">Source objects not imported</h2>
        <p className="text-text-dim">These objects exist in the Z-Anatomy file but were deliberately left out. Z-Anatomy's own licence file lists some embedded models from other authors under licences that do not allow redistribution under CC BY-SA, so they were quarantined rather than assumed to be covered.</p>
        <ul className="list-disc space-y-0.5 pl-5 text-xs text-text-dim">
          {SKIPPED_SOURCE_OBJECTS.map((s) => <li key={`${s.bundle}-${s.source_object}`}><span className="text-text-main">{s.source_object}</span> ({s.bundle}): {s.reason}</li>)}
        </ul>
        <p className="text-xs text-text-dim">Not used: LearnAnatomy3D's own files (the reference site was used only for the list of original sources), NIH 3D (no model was downloaded and checked, so none is included), and BodyParts3D separate downloads.</p>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold text-white">Textbooks</h2>
        <p className="mt-1 text-sm text-text-dim">The teaching notes are original summaries written for this platform. The books below are recommended for further reading and verification. No text has been copied from them.</p>
        <ul className="mt-3 space-y-1 text-sm">{BOOKS.map(([t, s]) => <li key={t}><span className="text-white">{t}</span> <span className="text-text-dim">· {s}</span></li>)}</ul>
      </Card>
      <Card>
        <h2 className="font-display text-lg font-semibold text-white">Histology illustrations</h2>
        <p className="mt-1 text-xs text-text-dim">These are CYMOR's own schematic drawings, not microscope images and not 3D models.</p>
        <ul className="mt-3 space-y-1 text-sm">{HISTOLOGY.map((h) => <li key={h.id}><span className="text-white">{h.name}</span> <span className="text-text-dim">· {h.image.kind} · {h.image.credit} · {h.image.licence}</span></li>)}</ul>
      </Card>
      <p className="text-xs text-text-dim">See also the <Link to="/about" className="text-cyan-brand underline">About page</Link>.</p>
    </div>
  )
}
