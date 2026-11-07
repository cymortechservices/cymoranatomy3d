import { useCallback, useMemo, useState } from 'react'
import { Card, buttonGhost, buttonPrimary } from '../common/ui'
import { allBundles, formatBytes, SYSTEM_LABEL, type AtlasBundle, type Vec3 } from '../../data/atlas'
import { supabase } from '../../lib/supabase'

type Check = { glb: string; manifest: string; ok: boolean; note: string }
const BUCKET = 'anatomical-models'

async function checkBundle(b: AtlasBundle): Promise<Check> {
  const head = async (url: string) => { try { const r = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } }); return r.status } catch { return 0 } }
  const [g, m] = await Promise.all([head(b.url), head(b.manifestUrl)])
  const ok = (g === 200 || g === 206) && (m === 200 || m === 206)
  return { glb: String(g), manifest: String(m), ok, note: ok ? 'reachable' : `GLB ${g || 'unreachable'}, manifest ${m || 'unreachable'}` }
}

/** Anatomical asset management: catalogue, licence view, sizes, broken-asset check, and (with Supabase) upload / replace / remove. */
export function AdminAssets() {
  const [q, setQ] = useState('')
  const [system, setSystem] = useState('all')
  const [checks, setChecks] = useState<Record<string, Check>>({})
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [, force] = useState(0)

  const bundles = allBundles()
  const systems = useMemo(() => ['all', ...new Set(bundles.map((b) => b.system))], [bundles])
  const rows = bundles.filter((b) => (system === 'all' || b.system === system) && (!q || `${b.title} ${b.id} ${b.creator} ${b.licence}`.toLowerCase().includes(q.toLowerCase())))
  const total = rows.reduce((n, b) => n + b.bytes, 0)

  const runChecks = async () => {
    setBusy(true)
    const out: Record<string, Check> = {}
    await Promise.all(bundles.map(async (b) => { out[b.id] = await checkBundle(b) }))
    setChecks(out); setBusy(false)
  }

  const upload = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!supabase) return
    const f = new FormData(e.currentTarget)
    const glb = f.get('glb') as File; const manifest = f.get('manifest') as File
    const id = String(f.get('id')).trim().toLowerCase()
    if (!/^[a-z0-9-]{3,40}$/.test(id)) return setMsg({ ok: false, text: 'ID must be 3 to 40 characters: lowercase letters, digits, hyphens.' })
    if (!glb?.size || !glb.name.toLowerCase().endsWith('.glb')) return setMsg({ ok: false, text: 'Choose a .glb file.' })
    if (!manifest?.size) return setMsg({ ok: false, text: 'Choose the manifest .json produced by the model pipeline.' })
    for (const k of ['name', 'creator', 'source_url', 'licence_name', 'licence_url', 'attribution']) if (!String(f.get(k) ?? '').trim()) return setMsg({ ok: false, text: `Field "${k}" is required: every model needs recorded credits and a licence.` })
    let man: { meshes?: { bbox?: [Vec3, Vec3] | null }[]; tris_out?: number }
    try { man = JSON.parse(await manifest.text()) } catch { return setMsg({ ok: false, text: 'The manifest is not valid JSON.' }) }
    if (!man.meshes?.length) return setMsg({ ok: false, text: 'The manifest lists no meshes.' })
    const boxes = man.meshes.map((m) => m.bbox).filter((b): b is [Vec3, Vec3] => !!b)
    if (!boxes.length) return setMsg({ ok: false, text: 'The manifest has no bounding boxes.' })
    const lo = [0, 1, 2].map((i) => Math.min(...boxes.map((b) => b[0][i]))) as Vec3; const hi = [0, 1, 2].map((i) => Math.max(...boxes.map((b) => b[1][i]))) as Vec3
    setBusy(true)
    const gp = `${id}/${id}.glb`; const mp = `${id}/${id}.json`
    const a = await supabase.storage.from(BUCKET).upload(gp, glb, { upsert: true, contentType: 'model/gltf-binary' })
    const b = await supabase.storage.from(BUCKET).upload(mp, manifest, { upsert: true, contentType: 'application/json' })
    if (a.error || b.error) { setBusy(false); return setMsg({ ok: false, text: (a.error ?? b.error)!.message }) }
    const pub = (p: string) => supabase!.storage.from(BUCKET).getPublicUrl(p).data.publicUrl
    const { error } = await supabase.from('anatomical_models').upsert({
      id, name: f.get('name'), system_id: f.get('system_id') || null, file_url: pub(gp), manifest_url: pub(mp), file_format: 'glb', size_bytes: glb.size, mesh_count: man.meshes.length,
      tris_out: man.tris_out ?? null, bbox: [lo, hi], creator: f.get('creator'), source: f.get('source') || null, source_url: f.get('source_url'), licence_name: f.get('licence_name'),
      licence_url: f.get('licence_url'), attribution: f.get('attribution'), modified: f.get('modified') === 'on', modification_notes: f.get('modification_notes') || null,
      verification_status: 'unverified', verified_at: null, updated_at: new Date().toISOString(),
    })
    setBusy(false)
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: 'Uploaded. It stays "unverified" until it has been loaded and checked in the viewer. Reload the page to see it in the laboratory.' })
    force((n) => n + 1)
  }, [])

  const remove = async (b: AtlasBundle) => {
    if (!supabase || b.origin !== 'uploaded') return
    if (!window.confirm(`Remove "${b.title}"? Its files are deleted from storage and the catalogue row is removed. Bookmarks and progress are not affected.`)) return
    const r = await supabase.storage.from(BUCKET).remove([`${b.id}/${b.id}.glb`, `${b.id}/${b.id}.json`])
    if (r.error) return setMsg({ ok: false, text: r.error.message })
    const d = await supabase.from('anatomical_models').delete().eq('id', b.id)
    setMsg(d.error ? { ok: false, text: d.error.message } : { ok: true, text: `${b.title} removed.` })
  }

  const setStatus = async (b: AtlasBundle, status: 'verified' | 'unverified' | 'rejected') => {
    if (!supabase || b.origin !== 'uploaded') return
    const { error } = await supabase.from('anatomical_models').update({ verification_status: status, verified_at: status === 'verified' ? new Date().toISOString() : null }).eq('id', b.id)
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: `${b.title}: status set to ${status}.` })
  }

  const field = 'w-full rounded-lg border border-white/15 bg-ink-800 px-3 py-2 text-sm text-white'
  return (
    <div className="space-y-4" data-testid="admin-assets">
      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search models…" aria-label="Search models" className={`${field} max-w-xs`} />
        <select value={system} onChange={(e) => setSystem(e.target.value)} aria-label="Filter by body system" className={`${field} max-w-[14rem]`}>
          {systems.map((s) => <option key={s} value={s}>{s === 'all' ? 'All body systems' : SYSTEM_LABEL[s] ?? s}</option>)}
        </select>
        <button onClick={runChecks} disabled={busy} className={buttonGhost}>{busy ? 'Checking…' : 'Check all files'}</button>
        <span className="text-xs text-text-dim">{rows.length} models · {formatBytes(total)}</span>
      </div>
      {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{msg.text}</p>}

      <Card className="overflow-x-auto !p-2">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-xs uppercase text-text-dim"><tr><th className="p-2">Model</th><th>System</th><th>Origin</th><th>Licence</th><th>Size</th><th>Meshes</th><th>Verification</th><th>File check</th><th /></tr></thead>
          <tbody>
            {rows.map((b) => {
              const c = checks[b.id]
              return (
                <tr key={b.id} className="border-t border-white/10 align-top">
                  <td className="p-2 text-white">{b.title}<div className="font-mono text-[10px] text-text-dim">{b.id}</div></td>
                  <td>{SYSTEM_LABEL[b.system] ?? b.system}</td><td className="capitalize">{b.origin}</td><td>{b.licence}</td><td>{formatBytes(b.bytes)}</td><td>{b.mesh_count}</td>
                  <td className="capitalize">{b.verification.status}{b.verification.load_ms ? <div className="text-[10px] text-text-dim">{b.verification.load_ms} ms</div> : null}</td>
                  <td className={c ? (c.ok ? 'text-emerald-300' : 'font-semibold text-rose-300') : 'text-text-dim'}>{c ? (c.ok ? 'OK' : `BROKEN: ${c.note}`) : 'not checked'}</td>
                  <td className="whitespace-nowrap p-2 text-right"><button className="text-cyan-brand underline" onClick={() => setOpen(open === b.id ? null : b.id)}>{open === b.id ? 'Close' : 'Details'}</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {open && (() => {
        const b = bundles.find((x) => x.id === open)!
        return (
          <Card className="space-y-2 text-sm">
            <h3 className="font-display text-lg font-semibold text-white">{b.title}</h3>
            <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[10rem_1fr]">
              <dt className="text-text-dim">Creator</dt><dd>{b.creator}</dd>
              <dt className="text-text-dim">Source</dt><dd><a className="text-cyan-brand underline" href={b.source_url} target="_blank" rel="noreferrer">{b.source}</a></dd>
              <dt className="text-text-dim">Licence</dt><dd><a className="text-cyan-brand underline" href={b.licence_url} target="_blank" rel="noreferrer">{b.licence}</a></dd>
              <dt className="text-text-dim">Attribution</dt><dd>{b.attribution}</dd>
              <dt className="text-text-dim">Modified</dt><dd>{b.modified ? 'Yes. ' : 'No. '}{b.modifications}</dd>
              <dt className="text-text-dim">Triangles</dt><dd>{b.tris_out.toLocaleString()} (source {b.tris_source.toLocaleString()})</dd>
              {b.sha256 && <><dt className="text-text-dim">SHA-256</dt><dd className="break-all font-mono text-[11px]">{b.sha256}</dd></>}
              {b.verification.notes && <><dt className="text-text-dim">Notes</dt><dd>{b.verification.notes}</dd></>}
            </dl>
            {b.origin === 'uploaded' ? (
              <div className="flex flex-wrap gap-2 pt-2">
                <button className={buttonGhost} onClick={() => setStatus(b, 'verified')}>Mark verified</button>
                <button className={buttonGhost} onClick={() => setStatus(b, 'unverified')}>Mark unverified</button>
                <button className={buttonGhost} onClick={() => setStatus(b, 'rejected')}>Reject (licence or quality)</button>
                <button className={buttonGhost} onClick={() => remove(b)}>Remove</button>
                <p className="w-full text-xs text-text-dim">To replace the files, upload again with the same ID. Only mark a model verified after loading it in the laboratory and checking it.</p>
              </div>
            ) : <p className="pt-2 text-xs text-text-dim">Built-in models ship with the application and are changed by re-running the pipeline (docs/MODEL_SOURCING.md), not from this screen.</p>}
          </Card>
        )
      })()}

      <Card className="space-y-3">
        <h3 className="font-display text-lg font-semibold text-white">Upload a model</h3>
        {!supabase ? <p className="text-sm text-text-dim">Uploading needs Supabase (storage bucket <code>{BUCKET}</code>). See docs/ADMIN_SETUP.md.</p> : (
          <form onSubmit={upload} className="grid gap-3 sm:grid-cols-2">
            <input name="id" placeholder="Unique ID (e.g. my-liver)" className={field} required />
            <input name="name" placeholder="Anatomical name" className={field} required />
            <select name="system_id" className={field} defaultValue=""><option value="">Body system…</option>{Object.entries(SYSTEM_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <input name="creator" placeholder="Original creator" className={field} required />
            <input name="source" placeholder="Source organisation / site" className={field} />
            <input name="source_url" placeholder="Original source URL" className={field} required />
            <input name="licence_name" placeholder="Licence name (e.g. CC BY 4.0)" className={field} required />
            <input name="licence_url" placeholder="Licence URL" className={field} required />
            <textarea name="attribution" placeholder="Required attribution text" className={`${field} sm:col-span-2`} rows={2} required />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="modified" className="accent-cyan-400" />Modified from the original</label>
            <input name="modification_notes" placeholder="What was modified" className={field} />
            <label className="text-xs text-text-dim">GLB file<input name="glb" type="file" accept=".glb" className="mt-1 block w-full text-sm" required /></label>
            <label className="text-xs text-text-dim">Manifest JSON (from scripts/model-pipeline)<input name="manifest" type="file" accept=".json" className="mt-1 block w-full text-sm" required /></label>
            <button disabled={busy} className={`${buttonPrimary} sm:col-span-2`}>{busy ? 'Uploading…' : 'Upload (starts as unverified)'}</button>
          </form>
        )}
      </Card>
    </div>
  )
}
