import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Notice, PageHeader, buttonGhost, buttonPrimary } from '../components/common/ui'
import { useAuth } from '../contexts/AuthContext'

type Mode = 'login' | 'signup' | 'reset'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function AuthPage() {
  const [p, setP] = useSearchParams()
  const mode = (['login', 'signup', 'reset'].includes(p.get('mode') ?? '') ? p.get('mode') : 'login') as Mode
  const { configured, signIn, signUp, resetPassword, user } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  if (user) return <Notice title="You are signed in">Go to your <Link to="/dashboard" className="underline">dashboard</Link> or <Link to="/profile" className="underline">profile</Link>.</Notice>

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setInfo('')
    if (!EMAIL.test(email)) return setError('Enter a valid email address.')
    if (mode !== 'reset' && password.length < 8) return setError('Password must be at least 8 characters.')
    if (mode === 'signup' && !name.trim()) return setError('Enter a display name.')
    setBusy(true)
    const err = mode === 'login' ? await signIn(email, password) : mode === 'signup' ? await signUp(email, password, name.trim()) : await resetPassword(email)
    setBusy(false)
    if (err) return setError(err)
    if (mode === 'login') nav('/dashboard')
    else if (mode === 'signup') setInfo('Account created. If email confirmation is enabled for this project, check your inbox to confirm, then sign in.')
    else setInfo('If that email has an account, a reset link has been sent.')
  }

  const field = 'w-full rounded-xl border border-white/15 bg-ink-800 px-4 py-2.5 text-sm text-white focus:border-cyan-brand focus:outline-none'
  const title = mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create an account' : 'Reset your password'

  return (
    <div className="mx-auto max-w-md space-y-4">
      <PageHeader eyebrow="Account" title={title} subtitle="Accounts are optional. You can use every learning feature as a guest." />
      {!configured && <Notice tone="warn" title="Demo mode: accounts are not configured">This build has no Supabase project, so sign-in and sign-up are unavailable. Everything else works, and your progress stays in this browser. To enable accounts follow docs/SUPABASE_SETUP.md.</Notice>}
      <Card>
        <form onSubmit={submit} className="space-y-3" noValidate>
          {mode === 'signup' && <div><label htmlFor="name" className="mb-1 block text-xs text-text-dim">Display name</label><input id="name" className={field} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="nickname" disabled={!configured} /></div>}
          <div><label htmlFor="email" className="mb-1 block text-xs text-text-dim">Email</label><input id="email" type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={!configured} /></div>
          {mode !== 'reset' && <div><label htmlFor="pw" className="mb-1 block text-xs text-text-dim">Password (8+ characters)</label><input id="pw" type="password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} disabled={!configured} /></div>}
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          {info && <p role="status" className="text-sm text-emerald-300">{info}</p>}
          <button type="submit" className={`${buttonPrimary} w-full`} disabled={!configured || busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}</button>
        </form>
        <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
          {mode !== 'login' && <button className="text-cyan-brand hover:underline" onClick={() => setP({ mode: 'login' })}>Sign in</button>}
          {mode !== 'signup' && <button className="text-cyan-brand hover:underline" onClick={() => setP({ mode: 'signup' })}>Create an account</button>}
          {mode !== 'reset' && <button className="text-text-dim hover:text-white" onClick={() => setP({ mode: 'reset' })}>Forgot password?</button>}
        </div>
      </Card>
      <Link to="/laboratory" className={`${buttonGhost} w-full`}>Continue as a guest</Link>
    </div>
  )
}
