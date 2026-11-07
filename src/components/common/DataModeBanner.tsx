import { Link } from 'react-router-dom'
import { Notice } from './ui'
import { useAuth } from '../../contexts/AuthContext'

/** Tells the learner exactly where their data lives, so demo persistence is never mistaken for cloud storage. */
export function DataModeBanner() {
  const { user, configured } = useAuth()
  if (user) return <Notice title="Signed in">Bookmarks, progress and quiz results are synchronised to your account.</Notice>
  return (
    <Notice title={configured ? 'Guest mode' : 'Demo mode'}>
      Your bookmarks, progress and quiz results are saved <strong>only in this browser</strong> and will be lost if you clear site data or switch device.{' '}
      {configured ? <><Link to="/auth" className="text-cyan-brand underline">Sign in</Link> to sync them.</> : 'Accounts and cloud sync are not configured in this build (see docs/SUPABASE_SETUP.md).'}
    </Notice>
  )
}
