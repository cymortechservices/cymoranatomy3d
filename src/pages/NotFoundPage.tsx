import { Link } from 'react-router-dom'
import { buttonPrimary } from '../components/common/ui'

export default function NotFoundPage({ what = 'page' }: { what?: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center" role="alert">
      <p className="font-display text-5xl font-bold text-cyan-brand">404</p>
      <h1 className="mt-2 font-display text-xl font-semibold text-white">That {what} was not found</h1>
      <p className="mt-1 text-sm text-text-dim">It may have been moved or the link may be wrong.</p>
      <div className="mt-5 flex justify-center gap-2"><Link to="/" className={buttonPrimary}>Home</Link><Link to="/laboratory" className={buttonPrimary}>3D laboratory</Link></div>
    </div>
  )
}
