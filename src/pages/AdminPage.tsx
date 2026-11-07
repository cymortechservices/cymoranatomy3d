import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Notice, PageHeader, Spinner, buttonGhost, buttonPrimary } from '../components/common/ui'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { AdminAssets } from '../components/admin/AdminAssets'

const TABLES = ['systems', 'regions', 'organs', 'structures', 'anatomy_content', 'anatomical_models', 'model_structure_mappings', 'animations', 'lessons', 'lesson_sections', 'histology_images', 'quizzes', 'questions', 'question_options'] as const
type Row = Record<string, unknown>

export default function AdminPage() {
  const { user, configured, loading } = useAuth()
  const [section, setSection] = useState<'assets' | 'tables'>('assets')
  const [table, setTable] = useState<(typeof TABLES)[number]>('structures')
  const [rows, setRows] = useState<Row[]>([])
  const [selected, setSelected] = useState<Row | null>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const load = useCallback(async () => {
    if (!supabase) return
    setBusy(true)
    const { data, error } = await supabase.from(table).select('*').limit(200)
    setBusy(false)
    if (error) setMsg({ ok: false, text: error.message })
    else { setRows((data as Row[]) ?? []); setMsg(null) }
  }, [table])

  useEffect(() => { if (user?.role === 'admin') void load() }, [user, load])

  if (loading) return <Spinner />
  if (!configured) return <Notice tone="warn" title="Admin needs Supabase">The admin area edits the database, so it is unavailable in demo mode. See docs/ADMIN_SETUP.md.</Notice>
  if (!user) return <Notice title="Sign in required"><Link to="/auth" className="underline">Sign in</Link> with an administrator account.</Notice>
  if (user.role !== 'admin') return <Notice tone="error" title="Not authorised">This area is restricted to administrators. Roles are set in the database, never in the browser.</Notice>

  const select = (r: Row | null) => { setSelected(r); setText(JSON.stringify(r ?? {}, null, 2)); setMsg(null) }

  const save = async () => {
    if (!supabase) return
    let obj: Row
    try { obj = JSON.parse(text) as Row } catch { return setMsg({ ok: false, text: 'That is not valid JSON.' }) }
    setBusy(true)
    const { error } = await supabase.from(table).upsert(obj)
    setBusy(false)
    if (error) return setMsg({ ok: false, text: error.message })
    setMsg({ ok: true, text: 'Saved.' }); void load()
  }

  const remove = async () => {
    if (!supabase || !selected || !('id' in selected)) return
    if (!window.confirm(`Delete ${String(selected.id)} from ${table}?`)) return
    const { error } = await supabase.from(table).delete().eq('id', selected.id as string)
    if (error) return setMsg({ ok: false, text: error.message })
    select(null); void load()
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Admin" title="Content administration" subtitle="Edit database rows as JSON. Row-level security enforces admin-only writes on the server." />
      <div role="tablist" className="flex gap-1 rounded-xl bg-ink-800/70 p-1 sm:max-w-md">
        {(['assets', 'tables'] as const).map((t) => <button key={t} role="tab" aria-selected={section === t} onClick={() => setSection(t)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${section === t ? 'bg-cyan-brand/20 text-cyan-brand' : 'text-text-dim'}`}>{t === 'assets' ? 'Anatomical models' : 'Content tables'}</button>)}
      </div>
      {section === 'assets' ? <AdminAssets /> : <>
      <div className="flex flex-wrap gap-2">{TABLES.map((t) => <button key={t} onClick={() => { setTable(t); select(null) }} className={`rounded-full border px-3 py-1 text-xs ${t === table ? 'border-cyan-brand text-cyan-brand' : 'border-white/15 text-text-dim hover:text-white'}`}>{t}</button>)}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="max-h-[60vh] space-y-1 overflow-y-auto !p-3">
          <button onClick={() => select(null)} className={buttonGhost}>+ New row</button>
          {busy && <Spinner />}
          {rows.map((r, i) => <button key={String(r.id ?? i)} onClick={() => select(r)} className="block w-full truncate rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5">{String(r.name ?? r.anatomical_name ?? r.title ?? r.prompt ?? r.id ?? i)}</button>)}
          {!busy && rows.length === 0 && <p className="p-2 text-sm text-text-dim">No rows (or none you can read).</p>}
        </Card>
        <Card className="space-y-3">
          <label htmlFor="json" className="text-xs font-semibold uppercase tracking-wide text-text-dim">Row JSON</label>
          <textarea id="json" value={text} onChange={(e) => setText(e.target.value)} rows={16} spellCheck={false} className="w-full rounded-xl border border-white/15 bg-ink-800 p-3 font-mono text-xs text-white focus:border-cyan-brand focus:outline-none" />
          <div className="flex gap-2"><button onClick={save} disabled={busy} className={buttonPrimary}>Save (upsert)</button><button onClick={remove} disabled={!selected} className={buttonGhost}>Delete</button></div>
          {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{msg.text}</p>}
        </Card>
      </div>
      </>}
    </div>
  )
}
