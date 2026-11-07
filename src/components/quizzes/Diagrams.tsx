/**
 * Original schematic diagrams used by "identify" and "label" quiz questions and by the 2D viewer fallback.
 * They are simplified teaching schematics, not anatomical illustrations drawn from a specimen.
 */
interface PinProps {
  highlightPin?: string
  visiblePins?: string[]
  onPinClick?: (pin: string) => void
  /** Pin ids whose answers have been chosen (drawn filled). */
  answeredPins?: string[]
}

const Pin = ({ id, x, y, highlight, onClick, answered }: { id: string; x: number; y: number; highlight: boolean; onClick?: () => void; answered: boolean }) => (
  <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }} role={onClick ? 'button' : undefined} aria-label={`Pin ${id}`}>
    {highlight && <circle cx={x} cy={y} r={17} fill="none" stroke="#22d3ee" strokeWidth={3} />}
    <circle cx={x} cy={y} r={11} fill={answered ? '#22d3ee' : '#050913'} stroke="#ffffff" strokeWidth={1.5} />
    <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill={answered ? '#050913' : '#ffffff'}>{id}</text>
  </g>
)

export const HEART_PINS: Record<string, { x: number; y: number; part_id: string; name: string }> = {
  '1': { x: 73, y: 50, part_id: 'svc', name: 'Superior vena cava' },
  '2': { x: 196, y: 36, part_id: 'ao', name: 'Aorta' },
  '3': { x: 238, y: 74, part_id: 'pt', name: 'Pulmonary trunk' },
  '4': { x: 104, y: 150, part_id: 'ra', name: 'Right atrium' },
  '5': { x: 205, y: 150, part_id: 'la', name: 'Left atrium' },
  '6': { x: 130, y: 262, part_id: 'rv', name: 'Right ventricle' },
  '7': { x: 225, y: 240, part_id: 'lv', name: 'Left ventricle' },
  '8': { x: 73, y: 288, part_id: 'ivc', name: 'Inferior vena cava' },
}

export function HeartDiagram({ highlightPin, visiblePins, onPinClick, answeredPins = [] }: PinProps) {
  const pins = Object.entries(HEART_PINS).filter(([id]) => !visiblePins || visiblePins.includes(id))
  const o = { stroke: 'rgba(255,255,255,0.28)', strokeWidth: 1.5 }
  return (
    <svg viewBox="0 0 320 330" className="mx-auto w-full max-w-sm" role="img" aria-label="Schematic diagram of the heart in anterior view with numbered pins">
      <path d="M150 140 L150 78 Q150 30 196 30 Q244 30 244 80 L244 150" stroke="#c63a33" strokeWidth={30} fill="none" strokeLinecap="round" />
      <path d="M178 150 L178 100 Q178 80 214 76 L262 70" stroke="#4a7fc0" strokeWidth={22} fill="none" strokeLinecap="round" />
      <rect x={60} y={15} width={26} height={135} rx={10} fill="#2f6fb0" {...o} />
      <rect x={60} y={180} width={26} height={140} rx={10} fill="#2f6fb0" {...o} />
      <ellipse cx={205} cy={150} rx={34} ry={26} fill="#e0605a" {...o} />
      <ellipse cx={218} cy={232} rx={62} ry={76} fill="#d6453d" {...o} />
      <ellipse cx={140} cy={245} rx={56} ry={58} fill="#2f6fb0" {...o} />
      <ellipse cx={104} cy={155} rx={44} ry={50} fill="#3b82c4" {...o} />
      <text x={160} y={322} textAnchor="middle" fontSize={10} fill="#9fb0d0">Blue = deoxygenated, red = oxygenated (schematic)</text>
      {pins.map(([id, p]) => (
        <Pin key={id} id={id} x={p.x} y={p.y} highlight={highlightPin === id} answered={answeredPins.includes(id)} onClick={onPinClick ? () => onPinClick(id) : undefined} />
      ))}
    </svg>
  )
}

export const BONE_PINS: Record<string, { x: number; y: number; name: string }> = {
  '1': { x: 78, y: 62, name: 'Epiphysis' },
  '2': { x: 84, y: 205, name: 'Diaphysis' },
  '3': { x: 104, y: 140, name: 'Medullary cavity' },
  '4': { x: 100, y: 16, name: 'Articular cartilage' },
  '5': { x: 134, y: 232, name: 'Periosteum' },
  '6': { x: 134, y: 90, name: 'Growth plate' },
}

export function LongBoneDiagram({ highlightPin, visiblePins, onPinClick, answeredPins = [] }: PinProps) {
  const pins = Object.entries(BONE_PINS).filter(([id]) => !visiblePins || visiblePins.includes(id))
  return (
    <svg viewBox="0 0 200 340" className="mx-auto w-full max-w-[14rem]" role="img" aria-label="Schematic diagram of a long bone with numbered pins">
      <defs>
        <pattern id="spongy" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 8 L8 0 M-2 2 L2 -2 M6 10 L10 6" stroke="#b9ae93" strokeWidth={1.2} />
        </pattern>
      </defs>
      {/* outer bone shape */}
      <path d="M55 52 Q55 14 100 14 Q145 14 145 52 Q145 80 122 90 L122 250 Q145 262 145 292 Q145 330 100 330 Q55 330 55 292 Q55 262 78 250 L78 90 Q55 80 55 52 Z" fill="#e9e2cf" stroke="#c9b97a" strokeWidth={2} />
      {/* spongy bone in epiphyses */}
      <ellipse cx={100} cy={52} rx={36} ry={26} fill="url(#spongy)" />
      <ellipse cx={100} cy={292} rx={36} ry={26} fill="url(#spongy)" />
      {/* medullary cavity */}
      <rect x={91} y={88} width={18} height={166} rx={6} fill="#f5d37a" />
      {/* growth plate line */}
      <line x1={78} y1={90} x2={122} y2={90} stroke="#9a8f6f" strokeWidth={2} strokeDasharray="4 3" />
      <line x1={78} y1={252} x2={122} y2={252} stroke="#9a8f6f" strokeWidth={2} strokeDasharray="4 3" />
      {/* articular cartilage cap */}
      <path d="M62 36 Q100 6 138 36" fill="none" stroke="#7dd3fc" strokeWidth={8} strokeLinecap="round" />
      <path d="M62 306 Q100 336 138 306" fill="none" stroke="#7dd3fc" strokeWidth={8} strokeLinecap="round" />
      {pins.map(([id, p]) => (
        <Pin key={id} id={id} x={p.x} y={p.y} highlight={highlightPin === id} answered={answeredPins.includes(id)} onClick={onPinClick ? () => onPinClick(id) : undefined} />
      ))}
    </svg>
  )
}

export const BoneDiagram = LongBoneDiagram
