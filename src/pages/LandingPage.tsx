import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bot, Boxes, FlaskConical, Layers, MousePointerClick, Smartphone, Zap, BookOpen, GraduationCap } from 'lucide-react'
import { Logo } from '../components/common/Logo'
import { Footer } from '../components/common/Footer'
import { buttonGhost, buttonPrimary } from '../components/common/ui'
import { HeartDiagram } from '../components/quizzes/Diagrams'
import { HistologySchematic } from '../components/histology/HistologySchematics'
import { BreathingStage } from '../components/physiology/Stages'
import { useTimeline } from '../hooks/useTimeline'
import { useIntro } from '../contexts/IntroContext'
import { useSettings } from '../contexts/SettingsContext'
import { isWebGLAvailable } from '../lib/webgl'
import { useAtlasView } from '../components/viewer3d/useAtlasView'
import { SYSTEMS } from '../data/systems'
import { STRUCTURES } from '../data/structures'
import { LESSONS } from '../data/lessons'
import { QUESTIONS } from '../data/questions'

const AnatomyViewer = lazy(() => import('../components/viewer3d/AnatomyViewer'))

function HeroPreview() {
  const { introActive } = useIntro()
  const { force2D } = useSettings()
  const heart = useAtlasView(['heart'])
  const can3D = isWebGLAvailable() && !force2D
  return (
    <div className="relative aspect-square w-full max-w-lg overflow-hidden rounded-3xl border border-cyan-brand/20 bg-ink-800/50 glow-cyan" data-testid="hero-preview">
      {can3D ? (
        introActive ? null : (
          <Suspense fallback={<div className="grid h-full place-items-center"><div className="spinner" /></div>}>
            <AnatomyViewer view={heart.view} loading={heart.loading} error={heart.error} autoRotate static />
          </Suspense>
        )
      ) : (
        <div className="grid h-full place-items-center p-6"><HeartDiagram /></div>
      )}
      <span className="absolute bottom-3 left-3 rounded-full bg-ink-950/80 px-3 py-1 text-[11px] text-text-dim">Real heart mesh (Z-Anatomy, CC BY-SA 4.0) · open the laboratory to select structures</span>
    </div>
  )
}

function MiniBreathing() {
  const tl = useTimeline(6, true)
  return <BreathingStage t={tl.t} />
}

const STATUS_TONE = { demonstration: 'text-emerald-300 bg-emerald-400/10 ring-emerald-400/30', introductory: 'text-gold-brand bg-gold-brand/10 ring-gold-brand/30' }

export default function LandingPage() {
  const { introActive } = useIntro()
  const rise = introActive ? 'opacity-0' : 'fade-up'
  const featured = LESSONS.slice(0, 4)

  return (
    <div className="min-h-full bg-ink-900">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-1 text-sm md:flex">
            {[['/laboratory', 'Laboratory'], ['/systems', 'Systems'], ['/study', 'Study'], ['/histology', 'Histology'], ['/quiz', 'Quizzes'], ['/tutor', 'AI tutor']].map(([to, l]) => (
              <Link key={to} to={to} className="rounded-lg px-3 py-2 text-text-dim hover:bg-white/5 hover:text-white">{l}</Link>
            ))}
          </nav>
          <Link to="/dashboard" className={`${buttonGhost} !py-2`}>Dashboard</Link>
        </div>
      </header>

      <section className="grid-bg" aria-labelledby="hero-title">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:py-20 lg:grid-cols-2">
          <div className={rise} style={{ animationDelay: '.05s' }}>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-brand/30 bg-cyan-brand/10 px-3 py-1 text-xs font-medium text-cyan-brand"><Zap className="h-3.5 w-3.5" aria-hidden />Free interactive anatomy laboratory</p>
            <h1 id="hero-title" className="font-display text-4xl font-bold leading-[1.08] text-white sm:text-5xl">Explore the Human Body. <span className="text-gradient">Understand Every Structure.</span></h1>
            <p className="mt-5 max-w-xl text-base text-text-dim">Rotate 3D models, select a structure to see its location, characteristics, adaptations and functions, study structured notes, practise with quizzes and ask an AI tutor. Built for medicine, nursing and biomedical students, and free to use.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/laboratory" className={buttonPrimary}>Explore Anatomy<ArrowRight className="h-4 w-4" aria-hidden /></Link>
              <Link to="/tutor" className={buttonGhost}><Bot className="h-4 w-4" aria-hidden />Meet Your AI Tutor</Link>
            </div>
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-3 text-center text-xs text-text-dim">
              {[[`${STRUCTURES.length}`, 'structures with notes'], [`${QUESTIONS.length}`, 'reviewed quiz questions'], [`${LESSONS.length}`, 'study lessons']].map(([n, l]) => (
                <div key={l} className="glass rounded-xl p-3"><dt className="font-display text-xl font-bold text-white">{n}</dt><dd>{l}</dd></div>
              ))}
            </dl>
          </div>
          <div className={`flex justify-center ${rise}`} style={{ animationDelay: '.2s' }}><HeroPreview /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="systems-title">
        <h2 id="systems-title" className="font-display text-2xl font-bold text-white">Body systems</h2>
        <p className="mt-1 max-w-2xl text-sm text-text-dim">The cardiovascular and skeletal systems have full demonstration content with 3D models. The other systems have introductory notes and are labelled as such.</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SYSTEMS.map((s) => (
            <li key={s.id}>
              <Link to={`/systems/${s.id}`} className="glass block h-full rounded-2xl p-4 transition hover:border-cyan-brand/50">
                <div className="flex items-start justify-between gap-2"><h3 className="font-display font-semibold text-white">{s.name}</h3><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${STATUS_TONE[s.status]}`}>{s.status === 'demonstration' ? 'Demonstration' : 'Introductory'}</span></div>
                <p className="mt-1.5 line-clamp-2 text-sm text-text-dim">{s.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-white/10 bg-ink-950/50" aria-labelledby="features-title">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 id="features-title" className="font-display text-2xl font-bold text-white">An anatomy laboratory, not a textbook page</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [MousePointerClick, 'Select and inspect', 'Click any structure in the 3D model to highlight it and read its information. Hide, isolate and label parts.'],
              [Layers, 'Honest layers', 'Layer controls show only what a model really contains. Missing models are reported, never faked.'],
              [Boxes, 'Zoom through scales', 'Move from body to system, organ, structure and tissue with guided steps and camera moves.'],
              [FlaskConical, 'Animated physiology', 'Cardiac cycle in 3D plus circulation, breathing, elbow movement and peristalsis, with step-by-step mode.'],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Layers
              return <li key={t as string} className="glass rounded-2xl p-4"><I className="mb-3 h-6 w-6 text-cyan-brand" aria-hidden /><h3 className="font-display font-semibold text-white">{t as string}</h3><p className="mt-1 text-sm text-text-dim">{d as string}</p></li>
            })}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-xl font-bold text-white">Histology preview</h2>
          <p className="mt-1 text-sm text-text-dim">Zoom and pan labelled tissue illustrations. These are clearly marked schematic drawings, not microscope slides.</p>
          <svg viewBox="0 0 400 300" className="mt-4 w-full overflow-hidden rounded-xl" role="img" aria-label="Schematic of compact bone (osteon)"><HistologySchematic topicId="bone" /></svg>
          <Link to="/histology" className={`${buttonGhost} mt-4`}>Open histology laboratory</Link>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-xl font-bold text-white">Physiology animation preview</h2>
          <p className="mt-1 text-sm text-text-dim">Breathing: the diaphragm flattens and the ribs lift. A simplified, labelled demonstration with play, pause and step controls.</p>
          <div className="mt-4 overflow-hidden rounded-xl bg-ink-800/70 p-2"><MiniBreathing /></div>
          <Link to="/physiology" className={`${buttonGhost} mt-4`}>Open physiology centre</Link>
        </div>
      </section>

      <section className="border-y border-white/10 bg-ink-950/50" aria-labelledby="study-title">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-2">
          <div>
            <h2 id="study-title" className="font-display text-2xl font-bold text-white">Study centre</h2>
            <p className="mt-1 text-sm text-text-dim">Notes in a consistent structure: characteristics (what it is like), adaptations (how structure supports function) and functions (what it does).</p>
            <ul className="mt-4 space-y-2">
              {featured.map((l) => <li key={l.id}><Link to={`/study/${l.id}`} className="flex items-center justify-between gap-3 rounded-xl bg-ink-800/60 px-4 py-3 text-sm hover:bg-ink-700/70"><span><BookOpen className="mr-2 inline h-4 w-4 text-cyan-brand" aria-hidden />{l.title}</span><span className="text-xs capitalize text-text-dim">{l.difficulty}</span></Link></li>)}
            </ul>
            <Link to="/study" className={`${buttonGhost} mt-4`}>Browse all notes</Link>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Meet your AI tutor</h2>
            <p className="mt-1 text-sm text-text-dim">Ask for explanations, comparisons, revision notes, flashcards or practice questions. The tutor knows which structure you are looking at. It can make mistakes, so check important facts against your textbook.</p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-cyan-brand/20 px-3 py-2">Compare the left and right ventricle.</p>
              <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-ink-700 px-3 py-2 text-text-dim">The left ventricle has a thicker wall because it pumps against systemic resistance…</p>
            </div>
            <Link to="/tutor" className={`${buttonPrimary} mt-4`}><Bot className="h-4 w-4" aria-hidden />Open the AI tutor</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="why-title">
        <h2 id="why-title" className="font-display text-2xl font-bold text-white">Why use CYMOR ANATOMY 3D?</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          {[
            ['Free, no paywalls', 'There are no subscriptions or locked features. You can use everything without creating an account.'],
            ['Honest about its content', 'Models are labelled schematic, histology images are labelled as drawings, and unfinished systems are marked introductory.'],
            ['Works on modest devices', 'Quality settings, lazy loading and a lightweight 2D mode keep it usable on low-spec phones.'],
            ['Quizzes that explain', 'Six question types with explanations and a review of every wrong answer.'],
            ['Your progress, your choice', 'Bookmarks and progress save in your browser. Sign in (when enabled) to sync across devices.'],
            ['Referenced', 'Notes cite standard textbooks. Model and image sources and licences are listed on the references page.'],
          ].map(([t, d]) => <li key={t} className="rounded-2xl border border-white/10 p-4"><h3 className="font-semibold text-white">{t}</h3><p className="mt-1 text-text-dim">{d}</p></li>)}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14" aria-labelledby="mobile-title">
        <div className="glass flex flex-col items-start gap-4 rounded-3xl p-6 sm:flex-row sm:items-center">
          <Smartphone className="h-10 w-10 shrink-0 text-violet-300" aria-hidden />
          <div className="flex-1"><h2 id="mobile-title" className="font-display text-xl font-bold text-white">Learn on your phone</h2><p className="mt-1 text-sm text-text-dim">Touch gestures rotate, pinch-zoom and pan the models. A bottom navigation bar keeps the main tools within reach, and 2D mode skips WebGL entirely when a device struggles.</p></div>
          <Link to="/quiz" className={buttonPrimary}><GraduationCap className="h-4 w-4" aria-hidden />Try a quiz</Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}
