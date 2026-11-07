/** Geometry of the circulation diagram: one closed circuit of straight segments (viewBox 600 x 340). */
export type Pt = [number, number]
export type SegmentKind = 'sys-arteries' | 'sys-capillaries' | 'sys-veins' | 'heart-right' | 'pulm-arteries' | 'pulm-capillaries' | 'pulm-veins' | 'heart-left'

export interface Segment { kind: SegmentKind; points: Pt[]; color: string; step: number }

export const CIRCUIT: Segment[] = [
  { kind: 'sys-arteries', points: [[350, 215], [430, 215], [430, 315], [340, 315]], color: '#ef4444', step: 0 },
  { kind: 'sys-capillaries', points: [[340, 315], [260, 315]], color: '#a78bfa', step: 1 },
  { kind: 'sys-veins', points: [[260, 315], [230, 315], [230, 150], [250, 150]], color: '#3b82f6', step: 2 },
  { kind: 'heart-right', points: [[250, 150], [275, 150], [275, 200], [250, 205]], color: '#3b82f6', step: 2 },
  { kind: 'pulm-arteries', points: [[250, 205], [210, 205], [210, 45], [260, 45]], color: '#3b82f6', step: 3 },
  { kind: 'pulm-capillaries', points: [[260, 45], [340, 45]], color: '#a78bfa', step: 4 },
  { kind: 'pulm-veins', points: [[340, 45], [390, 45], [390, 150], [350, 150]], color: '#ef4444', step: 5 },
  { kind: 'heart-left', points: [[350, 150], [325, 150], [325, 215], [350, 215]], color: '#ef4444', step: 5 },
]

const segLen = (pts: Pt[]) => pts.slice(1).reduce((n, p, i) => n + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0)
export const TOTAL_LENGTH = CIRCUIT.reduce((n, s) => n + segLen(s.points), 0)

/** Point and segment at fraction u (0..1) around the circuit. */
export function pointAt(uIn: number): { x: number; y: number; segment: Segment } {
  const u = ((uIn % 1) + 1) % 1
  let d = u * TOTAL_LENGTH
  for (const seg of CIRCUIT) {
    const len = segLen(seg.points)
    if (d <= len) {
      for (let i = 1; i < seg.points.length; i++) {
        const [x0, y0] = seg.points[i - 1]
        const [x1, y1] = seg.points[i]
        const l = Math.hypot(x1 - x0, y1 - y0)
        if (d <= l) { const k = l === 0 ? 0 : d / l; return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k, segment: seg } }
        d -= l
      }
    }
    d -= len
  }
  const last = CIRCUIT[CIRCUIT.length - 1]
  const p = last.points[last.points.length - 1]
  return { x: p[0], y: p[1], segment: last }
}

/** Start fraction of the first segment of each of the six steps (used to check the data file's `at` values). */
export function stepStarts(): number[] {
  const starts: number[] = []
  let acc = 0
  for (const seg of CIRCUIT) {
    if (starts[seg.step] === undefined) starts[seg.step] = acc / TOTAL_LENGTH
    acc += segLen(seg.points)
  }
  return starts
}
