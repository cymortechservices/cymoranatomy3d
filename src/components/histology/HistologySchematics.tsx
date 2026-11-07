import type { ReactNode } from 'react'

/**
 * Original SCHEMATIC drawings of basic tissues in an H&E-like palette (viewBox 0 0 400 300).
 * These are teaching drawings made in code. They are NOT micrographs and must never be presented as real slides.
 * Label coordinates in src/data/histology.ts are expressed in this viewBox.
 */
const PINK = '#f4c6d6'
const PURPLE = '#5b3a8c'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

function Epithelial(): ReactNode {
  return (
    <>
      <rect width={400} height={300} fill="#f9e9ef" />
      <rect width={400} height={88} fill="#fdf6f9" />
      {range(8).map((i) => (
        <g key={i}>
          <rect x={40 + i * 40} y={90} width={40} height={80} fill={PINK} stroke="#d38aa8" strokeWidth={1.5} />
          <ellipse cx={60 + i * 40} cy={145} rx={9} ry={14} fill={PURPLE} />
          {range(5).map((m) => <line key={m} x1={44 + i * 40 + m * 7} y1={90} x2={44 + i * 40 + m * 7} y2={96} stroke="#b0527c" strokeWidth={1} />)}
        </g>
      ))}
      <line x1={36} y1={172} x2={364} y2={172} stroke="#a855c7" strokeWidth={4} />
      <rect x={0} y={176} width={400} height={124} fill="#f1d3df" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M0 ${200 + i * 20} Q100 ${186 + i * 20} 200 ${204 + i * 20} T400 ${196 + i * 20}`} fill="none" stroke="#e29bb8" strokeWidth={2.5} />
      ))}
      <ellipse cx={80} cy={250} rx={12} ry={4} fill={PURPLE} transform="rotate(-15 80 250)" />
      <ellipse cx={310} cy={236} rx={12} ry={4} fill={PURPLE} transform="rotate(10 310 236)" />
    </>
  )
}

function Connective(): ReactNode {
  return (
    <>
      <rect width={400} height={300} fill="#f6d5e0" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M0 ${50 + i * 42} Q70 ${20 + i * 42} 110 ${90 + i * 10 - (i === 0 ? 0 : 0)} T210 ${70 + i * 40} T310 ${60 + i * 42} T400 ${80 + i * 40}`} fill="none" stroke="#e29bb8" strokeWidth={3} opacity={0.9} />
      ))}
      <path d="M0 90 Q60 60 110 90 T200 100 T300 70 T400 90" fill="none" stroke="#d46f97" strokeWidth={3.5} />
      <ellipse cx={255} cy={140} rx={24} ry={6} fill={PURPLE} transform="rotate(-20 255 140)" />
      <ellipse cx={150} cy={175} rx={22} ry={5.5} fill={PURPLE} transform="rotate(12 150 175)" />
      <ellipse cx={60} cy={150} rx={20} ry={5} fill={PURPLE} transform="rotate(-8 60 150)" />
      <circle cx={305} cy={220} r={16} fill="#fff7fa" stroke="#c0506f" strokeWidth={4} />
      <circle cx={300} cy={217} r={5} fill="#e87a8f" /><circle cx={310} cy={224} r={5} fill="#e87a8f" />
      {range(26).map((i) => <circle key={i} cx={20 + ((i * 53) % 360)} cy={205 + ((i * 37) % 80)} r={1.4} fill="#c98ba6" />)}
    </>
  )
}

function Muscle(): ReactNode {
  const striations = (x1: number, x2: number, y1: number, y2: number, step: number) =>
    range(Math.floor((x2 - x1) / step)).map((i) => <line key={`${x1}-${y1}-${i}`} x1={x1 + i * step} y1={y1} x2={x1 + i * step} y2={y2} stroke="#b05a85" strokeWidth={1} opacity={0.5} />)
  return (
    <>
      <rect width={400} height={300} fill="#fbe9ef" />
      {/* skeletal */}
      <rect x={20} y={14} width={360} height={26} fill={PINK} stroke="#d38aa8" />
      <rect x={20} y={44} width={360} height={26} fill={PINK} stroke="#d38aa8" />
      {striations(20, 380, 14, 40, 7)}{striations(20, 380, 44, 70, 7)}
      <ellipse cx={70} cy={17} rx={9} ry={3.5} fill={PURPLE} /><ellipse cx={300} cy={17} rx={9} ry={3.5} fill={PURPLE} /><ellipse cx={200} cy={67} rx={9} ry={3.5} fill={PURPLE} />
      <line x1={0} y1={92} x2={400} y2={92} stroke="#e29bb8" strokeDasharray="4 4" />
      {/* cardiac */}
      {[[20, 110], [110, 210], [210, 300], [300, 380]].map(([a, b], i) => (
        <g key={`a${i}`}><rect x={a} y={108} width={b - a} height={32} fill={PINK} stroke="#d38aa8" /><ellipse cx={(a + b) / 2} cy={124} rx={9} ry={7} fill={PURPLE} />{striations(a + 4, b - 4, 108, 140, 8)}</g>
      ))}
      {[[20, 60], [60, 160], [160, 260], [260, 380]].map(([a, b], i) => (
        <g key={`b${i}`}><rect x={a} y={150} width={b - a} height={32} fill={PINK} stroke="#d38aa8" /><ellipse cx={(a + b) / 2} cy={166} rx={9} ry={7} fill={PURPLE} />{striations(a + 4, b - 4, 150, 182, 8)}</g>
      ))}
      {[110, 210, 300].map((x) => <path key={`da${x}`} d={`M${x} 108 l4 8 l-8 8 l8 8 l-4 8`} fill="none" stroke="#6b2d5c" strokeWidth={3} />)}
      {[60, 160, 260].map((x) => <path key={`db${x}`} d={`M${x} 150 l4 8 l-8 8 l8 8 l-4 8`} fill="none" stroke="#6b2d5c" strokeWidth={3} />)}
      <line x1={0} y1={194} x2={400} y2={194} stroke="#e29bb8" strokeDasharray="4 4" />
      {/* smooth */}
      {[[100, 255, 70], [230, 232, 64], [300, 270, 70], [60, 215, 50], [180, 276, 56]].map(([cx, cy, rx], i) => (
        <g key={`s${i}`}><ellipse cx={cx} cy={cy} rx={rx} ry={9} fill={PINK} stroke="#d38aa8" transform={`rotate(${i % 2 ? -4 : 4} ${cx} ${cy})`} /><ellipse cx={cx} cy={cy} rx={14} ry={4} fill={PURPLE} transform={`rotate(${i % 2 ? -4 : 4} ${cx} ${cy})`} /></g>
      ))}
    </>
  )
}

function Nervous(): ReactNode {
  return (
    <>
      <rect width={400} height={300} fill="#ece4f4" />
      {['M130 132 Q100 100 70 90', 'M125 150 Q80 150 45 135', 'M135 170 Q100 200 70 215', 'M70 90 Q55 80 40 60', 'M70 90 Q50 95 30 100', 'M70 215 Q50 220 35 240', 'M45 135 Q30 125 20 112'].map((d) => (
        <path key={d} d={d} fill="none" stroke="#9b72c9" strokeWidth={5} strokeLinecap="round" />
      ))}
      <circle cx={150} cy={150} r={28} fill="#b48cd9" stroke="#7a52a8" strokeWidth={2} />
      <circle cx={150} cy={150} r={13} fill="#6a3fa0" /><circle cx={150} cy={150} r={4} fill="#2c1550" />
      <line x1={178} y1={150} x2={372} y2={150} stroke="#8a63b8" strokeWidth={4} />
      {[[200, 250], [258, 308], [316, 366]].map(([a, b]) => <rect key={a} x={a} y={140} width={b - a} height={20} rx={9} fill="#f3d98b" stroke="#c9a53d" strokeWidth={1.5} />)}
      {['M372 150 L392 138', 'M372 150 L394 150', 'M372 150 L392 162'].map((d) => <path key={d} d={d} stroke="#8a63b8" strokeWidth={3} />)}
      {[[40, 280], [90, 270], [330, 90], [360, 60], [250, 230]].map(([x, y]) => <ellipse key={`${x}${y}`} cx={x} cy={y} rx={6} ry={5} fill="#4b2d7f" opacity={0.8} />)}
    </>
  )
}

function Blood(): ReactNode {
  const rbc = [[110, 95], [60, 150], [160, 130], [200, 210], [250, 165], [340, 130], [185, 55], [330, 250], [55, 60], [135, 255]]
  return (
    <>
      <rect width={400} height={300} fill="#fbe9ee" />
      {rbc.map(([x, y]) => <g key={`${x}${y}`}><circle cx={x} cy={y} r={16} fill="#e87a8f" stroke="#c0506f" /><circle cx={x} cy={y} r={6} fill="#f7b6c2" /></g>)}
      <circle cx={255} cy={90} r={24} fill="#efe0f5" stroke="#bda3d6" />
      {[[247, 85], [262, 83], [256, 99]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={8} fill={PURPLE} />)}
      <path d="M247 85 L262 83 L256 99 Z" fill={PURPLE} opacity={0.7} />
      <circle cx={100} cy={220} r={22} fill="#dfe6f5" stroke="#9fb3dc" />
      <circle cx={100} cy={220} r={16} fill="#4b3a9c" />
      {[[300, 215], [312, 226], [294, 232], [322, 210]].map(([x, y]) => <ellipse key={`${x}${y}`} cx={x} cy={y} rx={5} ry={3.5} fill="#8b5cf6" />)}
    </>
  )
}

function Cartilage(): ReactNode {
  const singles = [[110, 150], [200, 100], [160, 225], [340, 190], [60, 230], [330, 70]]
  const group = [[262, 188], [281, 188], [262, 206], [281, 206]]
  return (
    <>
      <rect width={400} height={300} fill="#d4e3f1" />
      <rect width={400} height={50} fill="#e9a3bd" />
      {range(8).map((i) => <path key={i} d={`M0 ${6 + i * 6} Q100 ${i * 6} 200 ${8 + i * 6} T400 ${6 + i * 6}`} fill="none" stroke="#d46f97" strokeWidth={1.5} opacity={0.8} />)}
      <ellipse cx={90} cy={42} rx={14} ry={3.5} fill={PURPLE} /><ellipse cx={310} cy={40} rx={14} ry={3.5} fill={PURPLE} />
      {singles.map(([x, y]) => <g key={`${x}${y}`}><ellipse cx={x} cy={y} rx={13} ry={10} fill="#eef5fb" stroke="#9fbfdc" strokeWidth={1.5} /><ellipse cx={x} cy={y} rx={8} ry={6} fill="#6b4ba0" /></g>)}
      {group.map(([x, y]) => <g key={`${x}${y}`}><ellipse cx={x} cy={y} rx={10} ry={8} fill="#eef5fb" stroke="#9fbfdc" strokeWidth={1.5} /><ellipse cx={x} cy={y} rx={6} ry={5} fill="#6b4ba0" /></g>)}
    </>
  )
}

function Bone(): ReactNode {
  const cx = 200, cy = 150
  const lacunae = range(12).map((i) => { const a = (i / 12) * Math.PI * 2; const r = i % 2 ? 62 : 48; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, a] })
  return (
    <>
      <rect width={400} height={300} fill="#e8dcc0" />
      {range(14).map((i) => <line key={i} x1={0} y1={i * 24} x2={400} y2={i * 24 - 60} stroke="#cdbd96" strokeWidth={1.5} opacity={0.6} />)}
      <circle cx={cx} cy={cy} r={90} fill="#dccfa8" stroke="#8c7a4c" strokeWidth={3} />
      {[76, 62, 48, 34].map((r) => <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="#a99568" strokeWidth={3} />)}
      <circle cx={cx} cy={cy} r={18} fill="#c0506f" stroke="#7a2f4d" strokeWidth={3} />
      <circle cx={cx - 5} cy={cy - 3} r={4} fill="#e87a8f" />
      {lacunae.map(([x, y, a], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={cx + Math.cos(a) * 22} y2={cy + Math.sin(a) * 22} stroke="#6f5e38" strokeWidth={0.8} opacity={0.7} />
          <ellipse cx={x} cy={y} rx={6} ry={3.5} fill="#4a3b1f" transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`} />
        </g>
      ))}
    </>
  )
}

const DRAWINGS: Record<string, () => ReactNode> = {
  epithelial: Epithelial, connective: Connective, muscle: Muscle, nervous: Nervous, blood: Blood, cartilage: Cartilage, bone: Bone,
}

export function HistologySchematic({ topicId }: { topicId: string }) {
  const Draw = DRAWINGS[topicId]
  return Draw ? <>{Draw()}</> : null
}
