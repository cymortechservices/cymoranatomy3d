import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Download, LogOut } from 'lucide-react'
import { Card, Notice, PageHeader, buttonGhost, buttonPrimary } from '../components/common/ui'
import { DataModeBanner } from '../components/common/DataModeBanner'
import { useAuth } from '../contexts/AuthContext'
import { useUserData } from '../contexts/UserDataContext'
import { useSettings } from '../contexts/SettingsContext'
import { KEYS } from '../lib/storage'

export default function ProfilePage() {
  const { user, demoName, configured, updateProfile, signOut } = useAuth()
  const data = useUserData()
  const settings = useSettings()
  const nav = useNavigate()
  const [name, setName] = useState(user?.display_name ?? demoName)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = await updateProfile(name)
    setMsg(err ? { ok: false, text: err } : { ok: true, text: 'Profile saved.' })
  }

  const exportData = () => {
    const payload = { exported_at: new Date().toISOString(), bookmarks: data.bookmarks, recent: data.recent, completed_lessons: data.completedLessons, quiz_attempts: data.attempts }
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a'); a.href = url; a.download = 'cymor-anatomy-my-data.json'; a.click(); URL.revokeObjectURL(url)
  }

  const clearLocal = () => {
    if (!window.confirm('Delete bookmarks, progress, quiz history and chat history stored in this browser? This cannot be undone.')) return
    try { Object.values(KEYS).forEach((k) => { localStorage.removeItem(k); sessionStorage.removeItem(k) }) } catch { /* ignore */ }
    window.location.reload()
  }

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader eyebrow="Profile" title="Your profile" />
      <DataModeBanner />
      <Card className="space-y-4">
        <form onSubmit={save} className="space-y-3">
          <div><label htmlFor="dn" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-dim">Display name</label>
            <input id="dn" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="w-full rounded-xl border border-white/15 bg-ink-800 px-4 py-2.5 text-sm text-white focus:border-cyan-brand focus:outline-none" /></div>
          {user && <p className="text-sm text-text-dim">Email: <span className="text-text-main">{user.email}</span> · Role: <span className="capitalize text-text-main">{user.role}</span></p>}
          {!user && <p className="text-xs text-text-dim">{configured ? 'You are a guest. The name is stored in this browser only.' : 'Demo mode: the name is stored in this browser only.'}</p>}
          <button className={buttonPrimary} type="submit">Save profile</button>
          {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{msg.text}</p>}
        </form>
      </Card>
      <Card className="space-y-3"><h2 className="font-display text-lg font-semibold text-white">Display</h2>
        <p className="text-sm text-text-dim">3D quality: <strong className="text-text-main capitalize">{settings.quality}</strong> · Lightweight 2D: <strong className="text-text-main">{settings.force2D ? 'on' : 'off'}</strong> · Reduced animation: <strong className="text-text-main">{settings.reducedMotion ? 'on' : 'off'}</strong>. Change these with the gear icon at the top of any page.</p>
      </Card>
      <Card className="space-y-3"><h2 className="font-display text-lg font-semibold text-white">Your data</h2>
        <div className="flex flex-wrap gap-2"><button onClick={exportData} className={buttonGhost}><Download className="h-4 w-4" aria-hidden />Export my data (JSON)</button><button onClick={clearLocal} className={buttonGhost}>Delete data in this browser</button></div>
      </Card>
      {user ? (
        <button onClick={async () => { await signOut(); nav('/') }} className={buttonGhost}><LogOut className="h-4 w-4" aria-hidden />Sign out</button>
      ) : configured ? <Link to="/auth" className={buttonPrimary}>Sign in or create an account</Link> : <Notice>Accounts need Supabase. See docs/SUPABASE_SETUP.md to enable sign-up, sign-in and cloud sync.</Notice>}
    </div>
  )
}
