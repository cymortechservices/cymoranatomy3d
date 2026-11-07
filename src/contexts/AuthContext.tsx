import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isBackendConfigured, supabase } from '../lib/supabase'
import { KEYS, readJSON, writeJSON } from '../lib/storage'

export interface AppUser {
  id: string
  email: string
  display_name: string
  role: 'student' | 'admin'
}

interface AuthValue {
  user: AppUser | null
  loading: boolean
  /** True when Supabase is configured, so real accounts are available. */
  configured: boolean
  /** Guest display name stored in this browser (demo mode only). */
  demoName: string
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, displayName: string) => Promise<string | null>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<string | null>
  updateProfile: (displayName: string) => Promise<string | null>
}

const Ctx = createContext<AuthValue | null>(null)

const friendly = (message: string) => {
  if (/invalid login/i.test(message)) return 'Email or password is incorrect.'
  if (/already registered|already been registered/i.test(message)) return 'An account with that email already exists. Try signing in.'
  if (/password/i.test(message) && /least/i.test(message)) return 'Password is too short. Use at least 8 characters.'
  if (/rate limit/i.test(message)) return 'Too many attempts. Please wait a moment and try again.'
  if (/network|fetch/i.test(message)) return 'Could not reach the server. Check your connection.'
  return 'Something went wrong. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(isBackendConfigured)
  const [demoName, setDemoName] = useState(() => readJSON<string>(KEYS.demoProfile, ''))

  const loadProfile = useCallback(async (id: string, email: string) => {
    if (!supabase) return
    const { data } = await supabase.from('profiles').select('display_name, role').eq('id', id).maybeSingle()
    setUser({
      id,
      email,
      display_name: data?.display_name || email.split('@')[0],
      role: data?.role === 'admin' ? 'admin' : 'student',
    })
  }, [])

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      const s = data.session
      if (s?.user) await loadProfile(s.user.id, s.user.email ?? '')
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session?.user) void loadProfile(session.user.id, session.user.email ?? '')
      else setUser(null)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback<AuthValue['signIn']>(async (email, password) => {
    if (!supabase) return 'Accounts are not configured in this build (demo mode).'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? friendly(error.message) : null
  }, [])

  const signUp = useCallback<AuthValue['signUp']>(async (email, password, displayName) => {
    if (!supabase) return 'Accounts are not configured in this build (demo mode).'
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } })
    return error ? friendly(error.message) : null
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
  }, [])

  const resetPassword = useCallback<AuthValue['resetPassword']>(async (email) => {
    if (!supabase) return 'Accounts are not configured in this build (demo mode).'
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth?mode=login` })
    return error ? friendly(error.message) : null
  }, [])

  const updateProfile = useCallback<AuthValue['updateProfile']>(
    async (displayName) => {
      const name = displayName.trim().slice(0, 60)
      if (!name) return 'Please enter a name.'
      if (!supabase || !user) {
        setDemoName(name)
        writeJSON(KEYS.demoProfile, name)
        return null
      }
      const { error } = await supabase.from('profiles').update({ display_name: name }).eq('id', user.id)
      if (error) return 'Could not save your profile.'
      setUser({ ...user, display_name: name })
      return null
    },
    [user],
  )

  const value = useMemo<AuthValue>(
    () => ({ user, loading, configured: isBackendConfigured, demoName, signIn, signUp, signOut, resetPassword, updateProfile }),
    [user, loading, demoName, signIn, signUp, signOut, resetPassword, updateProfile],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth must be used inside AuthProvider')
  return v
}
