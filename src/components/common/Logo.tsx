import { Link } from 'react-router-dom'

export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" fill="#0a1222" stroke="#22d3ee" strokeOpacity=".5" />
      <circle cx="32" cy="15" r="7" fill="none" stroke="#22d3ee" strokeWidth="3" />
      <path d="M32 23v21M20 29h24M22 37c0 6 20 6 20 0M27 44l-4 12M37 44l4 12" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ to = '/', className = '' }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 ${className}`} aria-label="CYMOR ANATOMY 3D home">
      <LogoMark />
      <span className="font-display text-base font-bold leading-none tracking-wide text-white">
        CYMOR <span className="text-cyan-brand">ANATOMY</span> 3D
      </span>
    </Link>
  )
}
