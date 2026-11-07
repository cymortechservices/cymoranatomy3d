import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogIn, Menu, X, ShieldCheck } from 'lucide-react'
import { Logo } from '../components/common/Logo'
import { Footer } from '../components/common/Footer'
import { SearchBox } from '../components/navigation/SearchBox'
import { SettingsMenu } from '../components/navigation/SettingsMenu'
import { BOTTOM_NAV, INFO_NAV, PERSONAL_NAV, PRIMARY_NAV, type NavItem } from '../components/navigation/navItems'
import { useAuth } from '../contexts/AuthContext'
import { isBackendConfigured } from '../lib/supabase'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-cyan-brand/15 text-cyan-brand' : 'text-text-dim hover:bg-white/5 hover:text-white'}`

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <ul className="space-y-0.5">
      {items.map((i) => (
        <li key={i.to}><NavLink to={i.to} end={i.end} className={linkClass} onClick={onNavigate}><i.icon className="h-4 w-4 shrink-0" aria-hidden />{i.label}</NavLink></li>
      ))}
    </ul>
  )
}

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()
  return (
    <nav aria-label="Main" className="space-y-5">
      <NavList items={PRIMARY_NAV} onNavigate={onNavigate} />
      <div><p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-dim">My learning</p><NavList items={PERSONAL_NAV} onNavigate={onNavigate} /></div>
      <div><p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-dim">Platform</p>
        <NavList items={[...INFO_NAV, ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck }] : [])]} onNavigate={onNavigate} />
      </div>
    </nav>
  )
}

export default function AppLayout() {
  const [drawer, setDrawer] = useState(false)
  const nav = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()

  useEffect(() => { setDrawer(false); window.scrollTo?.(0, 0) }, [pathname])

  const immersive = pathname.startsWith('/laboratory')

  return (
    <div className="flex min-h-full bg-ink-900">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-cyan-brand focus:px-3 focus:py-2 focus:text-ink-950">Skip to content</a>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-5 overflow-y-auto border-r border-white/10 bg-ink-950/70 p-4 scroll-thin lg:flex">
        <Logo />
        <SideNav />
        <p className="mt-auto px-3 text-[10px] leading-relaxed text-text-dim">© CymorTechServices 2026<br />Developed by Legendary Smiley Cymor</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-white/10 bg-ink-900/85 px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-5">
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 lg:hidden" onClick={() => setDrawer(true)} aria-label="Open navigation menu"><Menu className="h-5 w-5" /></button>
          <div className="lg:hidden"><Logo className="[&>span]:hidden sm:[&>span]:inline" /></div>
          <SearchBox
            className="min-w-0 flex-1 sm:max-w-md"
            onPick={(r) => nav(r.kind === 'structure' ? `/laboratory?structure=${r.id}` : r.href)}
          />
          <div className="ml-auto flex items-center gap-2">
            <SettingsMenu />
            {user ? (
              <Link to="/profile" className="hidden items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm hover:border-cyan-brand sm:inline-flex">{user.display_name}</Link>
            ) : (
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm hover:border-cyan-brand" aria-label={isBackendConfigured ? 'Sign in' : 'Account options'}>
                <LogIn className="h-4 w-4" aria-hidden /><span className="hidden sm:inline">{isBackendConfigured ? 'Sign in' : 'Guest'}</span>
              </Link>
            )}
          </div>
        </header>

        <main id="main" className={`flex-1 ${immersive ? '' : 'mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8'} pb-24 lg:pb-8`}>
          <Outlet />
        </main>
        {!immersive && <Footer compact />}
      </div>

      <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/10 bg-ink-950/95 backdrop-blur safe-bottom lg:hidden">
        {BOTTOM_NAV.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? 'text-cyan-brand' : 'text-text-dim'}`}>
            <i.icon className="h-5 w-5" aria-hidden />{i.label}
          </NavLink>
        ))}
      </nav>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] overflow-y-auto bg-ink-900 p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between"><Logo /><button onClick={() => setDrawer(false)} aria-label="Close menu" className="grid h-9 w-9 place-items-center rounded-lg border border-white/15"><X className="h-4 w-4" /></button></div>
            <SideNav onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
