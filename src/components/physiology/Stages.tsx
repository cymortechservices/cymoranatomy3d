import { CIRCUIT, pointAt, TOTAL_LENGTH, type Pt } from '../../lib/circulation'

const ease = (x: number) => x * x * (3 - 2 * x)
const line = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ')

/* ---------------- circulation ---------------- */
export function CirculationStage({ t, stepIndex }: { t: number; stepIndex: number }) {
  const dots = Array.from({ length: 14 }, (_, i) => pointAt(t + i / 14))
  return (
    <svg viewBox="0 0 600 340" className="w-full" role="img" aria-label="Simplified diagram of pulmonary and systemic circulation with moving blood">
      {CIRCUIT.map((s, i) => (
        <path key={i} d={line(s.points)} fill="none" stroke={s.color} strokeWidth={s.step === stepIndex ? 11 : 6} opacity={s.step === stepIndex ? 0.9 : 0.35} strokeLinejoin="round" strokeLinecap="round" />
      ))}
      <rect x={250} y={120} width={100} height={110} rx={16} fill="#1a2a4a" stroke="#8bb0ff" strokeOpacity={0.4} />
      <line x1={300} y1={120} x2={300} y2={230} stroke="#8bb0ff" strokeOpacity={0.4} /><line x1={250} y1={175} x2={350} y2={175} stroke="#8bb0ff" strokeOpacity={0.4} />
      {[['RA', 275, 150], ['LA', 325, 150], ['RV', 275, 205], ['LV', 325, 205]].map(([l, x, y]) => <text key={l as string} x={x as number} y={(y as number) + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="#e8eefc">{l}</text>)}
      <rect x={260} y={25} width={80} height={40} rx={10} fill="none" stroke="#a78bfa" strokeDasharray="4 3" /><text x={300} y={20} textAnchor="middle" fontSize={11} fill="#c4b5fd">Lungs (gas exchange)</text>
      <rect x={260} y={292} width={80} height={40} rx={10} fill="none" stroke="#a78bfa" strokeDasharray="4 3" /><text x={300} y={288} textAnchor="middle" fontSize={11} fill="#c4b5fd">Body tissues</text>
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={4.5} fill={d.segment.color} stroke="#fff" strokeWidth={1} />)}
      <g fontSize={10} fill="#9fb0d0">
        <text x={436} y={265}>Systemic</text><text x={436} y={277}>arteries</text>
        <text x={118} y={250}>Systemic</text><text x={118} y={262}>veins</text>
        <text x={150} y={120}>Pulmonary</text><text x={150} y={132}>arteries</text>
        <text x={398} y={100}>Pulmonary</text><text x={398} y={112}>veins</text>
      </g>
      <g fontSize={10} fill="#9fb0d0"><circle cx={20} cy={314} r={5} fill="#ef4444" /><text x={30} y={318}>oxygenated</text><circle cx={95} cy={314} r={5} fill="#3b82f6" /><text x={105} y={318}>deoxygenated</text><circle cx={20} cy={330} r={5} fill="#a78bfa" /><text x={30} y={334}>capillary exchange</text></g>
    </svg>
  )
}
export const circulationStepFromT = (t: number): number => pointAt(t).segment.step
export { TOTAL_LENGTH }

/* ---------------- breathing ---------------- */
export function BreathingStage({ t }: { t: number }) {
  const insp = t < 0.4
  const k = insp ? ease(t / 0.4) : 1 - ease((t - 0.4) / 0.6) // extent of inspiration 0..1
  const sx = 300 + 14 * k
  const ribs = Array.from({ length: 6 }, (_, i) => {
    const y0 = 62 + i * 26
    const y1 = 62 + i * 18 - 9 * k
    return `M92 ${y0} C150 ${y0 - 22} 250 ${y0 - 14 - 6 * k} ${sx} ${y1}`
  })
  const apex = 168 + 32 * k
  return (
    <svg viewBox="0 0 400 300" className="w-full" role="img" aria-label="Side view of breathing: the diaphragm flattens and the ribs lift during inspiration">
      <ellipse cx={192} cy={150} rx={86 * (1 + 0.1 * k)} ry={78 * (1 + 0.1 * k)} fill="#7dd3fc" opacity={0.35} stroke="#38bdf8" />
      <line x1={92} y1={40} x2={92} y2={250} stroke="#e9e2cf" strokeWidth={7} strokeLinecap="round" />
      <line x1={sx} y1={56 - 9 * k} x2={sx} y2={168 - 9 * k} stroke="#f4eedc" strokeWidth={8} strokeLinecap="round" />
      {ribs.map((d, i) => <path key={i} d={d} fill="none" stroke="#e9e2cf" strokeWidth={4} strokeLinecap="round" />)}
      <path d={`M92 232 Q192 ${apex} 312 238`} fill="none" stroke="#f87171" strokeWidth={8} strokeLinecap="round" />
      <path d="M192 10 L192 62" stroke="#9fb0d0" strokeWidth={6} strokeDasharray="2 6" />
      <polygon points={insp ? '184,40 200,40 192,56' : '184,26 200,26 192,10'} fill="#22d3ee" />
      <text x={212} y={30} fontSize={12} fill="#22d3ee">{insp ? 'Air in' : 'Air out'}</text>
      <g fontSize={11} fill="#cbd5e1">
        <text x={22} y={150}>Spine</text><text x={312} y={96}>Sternum</text><text x={150} y={150}>Lung</text><text x={150} y={272}>Diaphragm</text><text x={20} y={284} fill="#9fb0d0">Posterior ← → Anterior</text>
      </g>
    </svg>
  )
}

/* ---------------- elbow ---------------- */
export function elbowAngle(t: number): { theta: number; flexing: boolean; extending: boolean } {
  if (t < 0.4) return { theta: 140 * ease(t / 0.4), flexing: true, extending: false }
  if (t < 0.5) return { theta: 140, flexing: true, extending: false }
  if (t < 0.9) return { theta: 140 * (1 - ease((t - 0.5) / 0.4)), flexing: false, extending: true }
  return { theta: 0, flexing: false, extending: false }
}

export function ElbowStage({ t }: { t: number }) {
  const { theta, flexing, extending } = elbowAngle(t)
  const rad = (theta * Math.PI) / 180
  const sh: Pt = [140, 50]
  const el: Pt = [160, 180]
  const dir: Pt = [Math.sin(rad), Math.cos(rad)]
  const tip: Pt = [el[0] + dir[0] * 120, el[1] + dir[1] * 120]
  const ins: Pt = [el[0] + dir[0] * 28 + 6, el[1] + dir[1] * 28] // biceps insertion on radius
  const bOrig: Pt = [150, 70]
  const bLen = Math.hypot(ins[0] - bOrig[0], ins[1] - bOrig[1])
  const bAngle = (Math.atan2(ins[1] - bOrig[1], ins[0] - bOrig[0]) * 180) / Math.PI
  const bBulge = 9 + (flexing ? 9 * ease(Math.min(1, t / 0.2)) : 0)
  const tIns: Pt = [el[0] - 10 * Math.cos(rad) - 8 * Math.sin(rad) - 2, el[1] - 10 * Math.sin(rad) * 0 - 8]
  const tOrig: Pt = [120, 60]
  const tLen = Math.hypot(tIns[0] - tOrig[0], tIns[1] - tOrig[1])
  const tAngle = (Math.atan2(tIns[1] - tOrig[1], tIns[0] - tOrig[0]) * 180) / Math.PI
  const tBulge = 9 + (extending ? 8 : 0)
  return (
    <svg viewBox="0 0 400 300" className="w-full" role="img" aria-label="Elbow joint: the forearm flexes towards the arm as biceps brachii contracts, and extends as triceps brachii contracts">
      <ellipse cx={(tOrig[0] + tIns[0]) / 2} cy={(tOrig[1] + tIns[1]) / 2} rx={tLen / 2} ry={tBulge} transform={`rotate(${tAngle} ${(tOrig[0] + tIns[0]) / 2} ${(tOrig[1] + tIns[1]) / 2})`} fill={extending ? '#fb7185' : '#9f3a52'} opacity={0.9} />
      <ellipse cx={(bOrig[0] + ins[0]) / 2} cy={(bOrig[1] + ins[1]) / 2} rx={bLen / 2} ry={bBulge} transform={`rotate(${bAngle} ${(bOrig[0] + ins[0]) / 2} ${(bOrig[1] + ins[1]) / 2})`} fill={flexing ? '#fb7185' : '#9f3a52'} opacity={0.9} />
      <line x1={sh[0]} y1={sh[1]} x2={el[0]} y2={el[1]} stroke="#e9e2cf" strokeWidth={14} strokeLinecap="round" />
      <line x1={el[0]} y1={el[1]} x2={tip[0]} y2={tip[1]} stroke="#e9e2cf" strokeWidth={12} strokeLinecap="round" />
      <circle cx={el[0]} cy={el[1]} r={10} fill="#7dd3fc" />
      <circle cx={sh[0]} cy={sh[1]} r={9} fill="#7dd3fc" opacity={0.7} />
      <g fontSize={12} fill="#cbd5e1">
        <text x={20} y={40}>Shoulder</text><text x={24} y={150}>Humerus</text>
        <text x={Math.max(20, Math.min(300, tip[0] + 8))} y={tip[1] + 14}>Radius &amp; ulna</text>
        <text x={210} y={90} fill={flexing ? '#fda4af' : '#9fb0d0'}>Biceps brachii {flexing ? '(contracting, shortening)' : '(relaxed / lengthening)'}</text>
        <text x={20} y={86} fill={extending ? '#fda4af' : '#9fb0d0'} />
        <text x={20} y={282} fill={extending ? '#fda4af' : '#9fb0d0'}>Triceps brachii {extending ? '(contracting, shortening)' : '(relaxed / lengthening)'}</text>
        <text x={290} y={270} fill="#22d3ee">{Math.round(theta)}° flexion</text>
      </g>
    </svg>
  )
}

/* ---------------- peristalsis ---------------- */
const gauss = (x: number, c: number, w: number) => Math.exp(-((x - c) ** 2) / (2 * w * w))

export function PeristalsisStage({ t }: { t: number }) {
  const w = 40 + 320 * t
  const fade = Math.min(1, t / 0.08, (1 - t) / 0.08)
  const r = (x: number) => 30 - 15 * gauss(x, w - 34, 16) + 9 * gauss(x, w + 38, 24)
  const xs = Array.from({ length: 73 }, (_, i) => 20 + i * 5)
  const top = xs.map((x, i) => `${i ? 'L' : 'M'}${x} ${80 - r(x)}`).join(' ')
  const bottom = [...xs].reverse().map((x) => `L${x} ${80 + r(x)}`).join(' ')
  return (
    <svg viewBox="0 0 400 160" className="w-full" role="img" aria-label="A bolus moving along a muscular tube by peristalsis">
      <path d={`${top} ${bottom} Z`} fill="#3a1d33" stroke="#f472b6" strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={w} cy={80} rx={20} ry={Math.max(8, r(w) - 4)} fill="#e6b756" opacity={fade} />
      <g fontSize={11} fill="#cbd5e1" opacity={fade}>
        <text x={Math.max(10, w - 110)} y={28}>Contraction behind</text>
        <text x={Math.min(260, w + 20)} y={140}>Relaxation ahead</text>
      </g>
      <text x={20} y={152} fontSize={10} fill="#9fb0d0">Schematic tube (not a specific organ)</text>
    </svg>
  )
}
