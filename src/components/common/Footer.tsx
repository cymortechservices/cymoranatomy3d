import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <footer className="border-t border-white/10 bg-ink-950/60 px-4 py-8 text-sm text-text-dim safe-bottom" role="contentinfo">
      <div className={`mx-auto flex max-w-6xl flex-col gap-6 ${compact ? '' : 'md:flex-row md:justify-between'}`}>
        <div className="space-y-2">
          <Logo />
          <p className="max-w-xs">Explore the Human Body. Understand Every Structure.</p>
          <p>Developed by <strong className="text-text-main">Legendary Smiley Cymor</strong></p>
          <p>Powered by <strong className="text-text-main">CymorTechServices</strong></p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-1.5 sm:grid-cols-3">
          {[['/laboratory', 'Laboratory'], ['/systems', 'Body systems'], ['/study', 'Study centre'], ['/histology', 'Histology'], ['/physiology', 'Physiology'], ['/embryology', 'Embryology'], ['/quiz', 'Quizzes'], ['/tutor', 'AI tutor'], ['/about', 'About'], ['/references', 'References & attribution']].map(([to, label]) => (
            <Link key={to} to={to} className="hover:text-cyan-brand">{label}</Link>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-6xl border-t border-white/10 pt-4 text-xs">
        © CymorTechServices 2026 · Free educational platform. Content is for study and is not medical advice.
      </p>
    </footer>
  )
}
