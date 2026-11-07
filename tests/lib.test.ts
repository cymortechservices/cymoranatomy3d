import { existsSync, readFileSync, statSync } from 'node:fs'
import { ATLAS_LINKS, resolveLink } from '../src/lib/atlasLinks'
import { BUILTIN_BUNDLES } from '../src/data/atlas'
import { describe, expect, it } from 'vitest'
import { buildQuiz, correctAnswerValue, isCorrect, normaliseAnswer, scoreQuiz, shuffle } from '../src/lib/quiz'
import { QUESTIONS } from '../src/data/questions'
import { searchAnatomy } from '../src/lib/search'
import { isPartVisible } from '../src/lib/visibility'
import { cardiacState } from '../src/lib/cardiac'
import { CIRCUIT, pointAt, stepStarts } from '../src/lib/circulation'
import { ANIMATIONS } from '../src/data/animations'
import { STRUCTURES } from '../src/data/structures'
import { LESSONS } from '../src/data/lessons'
import { ORGANS } from '../src/data/organs'
import { REGIONS } from '../src/data/regions'
import { SYSTEMS } from '../src/data/systems'
import { HISTOLOGY } from '../src/data/histology'
import { offlineAnswer } from '../src/lib/offlineTutor'

const seeded = (seed = 1) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
const q = (id: string) => QUESTIONS.find((x) => x.id === id)!

describe('quiz scoring', () => {
  it('scores mcq / tf / identify by option id', () => {
    expect(isCorrect(q('cv-01'), 'a')).toBe(true)
    expect(isCorrect(q('cv-01'), 'b')).toBe(false)
    expect(isCorrect(q('cv-06'), 'b')).toBe(true)
    expect(isCorrect(q('cv-10'), 'b')).toBe(true)
    expect(isCorrect(q('cv-01'), null)).toBe(false)
  })
  it('normalises fill-in answers', () => {
    expect(normaliseAnswer('  The Aortic! ')).toBe('aortic')
    expect(isCorrect(q('cv-08'), 'Aortic valve')).toBe(true)
    expect(isCorrect(q('cv-08'), 'the aortic')).toBe(true)
    expect(isCorrect(q('cv-08'), 'mitral')).toBe(false)
    expect(isCorrect(q('cv-08'), '')).toBe(false)
    expect(isCorrect(q('sk-06'), 'Diaphysis')).toBe(true)
  })
  it('requires every pair for match questions', () => {
    const m = q('cv-09')
    const right = Object.fromEntries(m.pairs!.map((p) => [p.left, p.right]))
    expect(isCorrect(m, right)).toBe(true)
    expect(isCorrect(m, { ...right, 'Aortic valve': 'Initiates the heartbeat' })).toBe(false)
    expect(isCorrect(m, {})).toBe(false)
  })
  it('requires every pin for label questions', () => {
    const l = q('cv-12')
    expect(isCorrect(l, { ...l.pin_answers })).toBe(true)
    expect(isCorrect(l, { ...l.pin_answers, '1': 'b' })).toBe(false)
  })
  it('computes score, percent and incorrect ids', () => {
    const items = buildQuiz(QUESTIONS, { topic: 'cardiovascular', difficulty: 'beginner', count: 3, mode: 'untimed' }, seeded(3))
    expect(items.length).toBe(3)
    const answers: Record<string, string | Record<string, string> | null> = {}
    items.forEach((it, i) => { answers[it.question.id] = i === 0 ? (correctAnswerValue(it.question) as string) : 'zz' })
    const r = scoreQuiz(items, answers)
    expect(r.total).toBe(3)
    expect(r.correct).toBe(1)
    expect(r.percent).toBe(33)
    expect(r.incorrectIds).toHaveLength(2)
  })
  it('every question accepts its own correct answer value', () => {
    for (const x of QUESTIONS) expect(isCorrect(x, correctAnswerValue(x)), x.id).toBe(true)
  })
  it('filters by topic and difficulty and never exceeds the pool', () => {
    const items = buildQuiz(QUESTIONS, { topic: 'histology', difficulty: 'beginner', count: 50, mode: 'untimed' })
    expect(items.every((i) => i.question.topic === 'histology' && i.question.difficulty === 'beginner')).toBe(true)
    expect(buildQuiz(QUESTIONS, { topic: 'all', difficulty: 'any', count: 5, mode: 'untimed' })).toHaveLength(5)
  })
  it('shuffle keeps all items', () => {
    expect([...shuffle([1, 2, 3, 4, 5], seeded(9))].sort()).toEqual([1, 2, 3, 4, 5])
  })
})

describe('question bank integrity', () => {
  it('has unique ids and a valid answer for every question', () => {
    const ids = new Set<string>()
    for (const x of QUESTIONS) {
      expect(ids.has(x.id)).toBe(false)
      ids.add(x.id)
      expect(x.explanation.length).toBeGreaterThan(10)
      if (['mcq', 'tf', 'identify'].includes(x.type)) {
        expect(x.options!.some((o) => o.id === x.correct)).toBe(true)
        expect(new Set(x.options!.map((o) => o.text)).size).toBe(x.options!.length)
      }
      if (x.type === 'fill') expect(x.accepted!.length).toBeGreaterThan(0)
      if (x.type === 'match') expect(x.pairs!.length).toBeGreaterThanOrEqual(3)
      if (x.type === 'label') for (const opt of Object.values(x.pin_answers!)) expect(x.options!.some((o) => o.id === opt)).toBe(true)
      if (x.structure_id) expect(STRUCTURES.some((s) => s.id === x.structure_id)).toBe(true)
    }
  })
  it('covers every topic and difficulty', () => {
    for (const t of ['cardiovascular', 'skeletal', 'histology']) expect(QUESTIONS.some((x) => x.topic === t)).toBe(true)
    for (const d of ['beginner', 'intermediate', 'advanced']) expect(QUESTIONS.some((x) => x.difficulty === d)).toBe(true)
  })
})

describe('anatomical search', () => {
  it('finds by anatomical name, common name, synonym and system', () => {
    expect(searchAnatomy('left ventricle')[0].id).toBe('left-ventricle')
    expect(searchAnatomy('kneecap')[0].id).toBe('patella')
    expect(searchAnatomy('SAN')[0]?.id).toBe('sinoatrial-node')
    expect(searchAnatomy('collarbone')[0].id).toBe('clavicle')
    expect(searchAnatomy('skeletal').some((r) => r.kind === 'system' && r.id === 'skeletal')).toBe(true)
    expect(searchAnatomy('thorax').some((r) => r.kind === 'region')).toBe(true)
  })
  it('returns nothing for short or nonsense queries', () => {
    expect(searchAnatomy('a')).toEqual([])
    expect(searchAnatomy('zzzzqqq')).toEqual([])
  })
  it('requires every word to match', () => {
    expect(searchAnatomy('femur ventricle')).toEqual([])
  })
})

describe('part visibility', () => {
  const base = { hiddenParts: new Set<string>(), isolatedPartId: null, visibleLayers: new Set(['a', 'b']) }
  it('hides hidden parts and disabled layers', () => {
    expect(isPartVisible('x', 'a', base)).toBe(true)
    expect(isPartVisible('x', 'c', base)).toBe(false)
    expect(isPartVisible('x', 'a', { ...base, hiddenParts: new Set(['x']) })).toBe(false)
  })
  it('isolation shows only the isolated part', () => {
    expect(isPartVisible('x', 'a', { ...base, isolatedPartId: 'x' })).toBe(true)
    expect(isPartVisible('y', 'a', { ...base, isolatedPartId: 'x' })).toBe(false)
  })
})

describe('cardiac cycle model', () => {
  it('has the right valve states per phase', () => {
    expect(cardiacState(0.05)).toMatchObject({ phase: 'atrial-systole', avValvesOpen: true, semilunarValvesOpen: false })
    expect(cardiacState(0.14)).toMatchObject({ phase: 'isovolumetric-contraction', avValvesOpen: false, semilunarValvesOpen: false })
    expect(cardiacState(0.3)).toMatchObject({ phase: 'ejection', avValvesOpen: false, semilunarValvesOpen: true })
    expect(cardiacState(0.53)).toMatchObject({ phase: 'isovolumetric-relaxation', avValvesOpen: false, semilunarValvesOpen: false })
    expect(cardiacState(0.8)).toMatchObject({ phase: 'filling', avValvesOpen: true, semilunarValvesOpen: false })
  })
  it('never opens AV and semilunar valves together', () => {
    for (let i = 0; i < 200; i++) { const s = cardiacState(i / 200); expect(s.avValvesOpen && s.semilunarValvesOpen).toBe(false) }
  })
  it('loops continuously', () => {
    const a = cardiacState(0.0001), b = cardiacState(0.9999)
    expect(Math.abs(a.ventricleScale - b.ventricleScale)).toBeLessThan(0.05)
    expect(Math.abs(a.atrialScale - b.atrialScale)).toBeLessThan(0.05)
  })
  it('animation steps match the model phases', () => {
    const steps = ANIMATIONS.find((a) => a.id === 'cardiac-cycle')!.steps
    expect(steps.map((s) => s.at)).toEqual([0, 0.12, 0.17, 0.5, 0.57])
  })
})

describe('circulation diagram', () => {
  it('step start values in the data match the geometry', () => {
    const starts = stepStarts()
    const data = ANIMATIONS.find((a) => a.id === 'circulation')!.steps.map((s) => s.at)
    starts.forEach((s, i) => expect(Math.abs(s - data[i])).toBeLessThan(0.002))
  })
  it('circuit is closed and continuous', () => {
    for (let i = 1; i < CIRCUIT.length; i++) {
      const prev = CIRCUIT[i - 1].points.at(-1)!, cur = CIRCUIT[i].points[0]
      expect(Math.hypot(prev[0] - cur[0], prev[1] - cur[1])).toBeLessThan(10)
    }
    const p0 = pointAt(0), p1 = pointAt(0.9999)
    expect(Math.hypot(p0.x - p1.x, p0.y - p1.y)).toBeLessThan(5)
  })
})

describe('content integrity', () => {
  const ids = (a: { id: string }[]) => new Set(a.map((x) => x.id))
  it('has unique ids and valid foreign keys', () => {
    for (const list of [STRUCTURES, ORGANS, REGIONS, SYSTEMS, LESSONS, HISTOLOGY]) expect(ids(list).size).toBe(list.length)
    const sys = ids(SYSTEMS), reg = ids(REGIONS), org = ids(ORGANS), str = ids(STRUCTURES)
    for (const s of STRUCTURES) {
      expect(sys.has(s.system_id), s.id).toBe(true)
      expect(reg.has(s.region_id), s.id).toBe(true)
      expect(org.has(s.organ_id), s.id).toBe(true)
      for (const r of s.related_structures) expect(str.has(r), `${s.id} -> ${r}`).toBe(true)
      expect(s.functions.length).toBeGreaterThan(0)
      expect(s.references.length).toBeGreaterThan(0)
    }
    for (const o of ORGANS) { expect(sys.has(o.system_id)).toBe(true); for (const sid of o.structure_ids) expect(str.has(sid), `${o.id} -> ${sid}`).toBe(true) }
    for (const l of LESSONS) { expect(sys.has(l.system_id)).toBe(true); for (const sid of l.related_structure_ids) expect(str.has(sid), `${l.id} -> ${sid}`).toBe(true) }
  })
  it('every organ structure belongs to that organ', () => {
    for (const o of ORGANS) for (const sid of o.structure_ids) expect(STRUCTURES.find((s) => s.id === sid)!.organ_id).toBe(o.id)
  })
  it('every curated structure link resolves to real meshes in its bundle manifest (or is explicitly unlinked)', () => {
    const cache = new Map<string, { id: string; group_path: string[] }[]>()
    const rows = (b: string) => { if (!cache.has(b)) cache.set(b, JSON.parse(readFileSync(`public/models/zanatomy/${b}.json`, 'utf8')).meshes); return cache.get(b)! as never }
    const unlinked = STRUCTURES.filter((s) => !ATLAS_LINKS[s.id]).map((s) => s.id).sort()
    expect(unlinked).toEqual(['cardiac-muscle', 'sinoatrial-node'])
    for (const [sid, link] of Object.entries(ATLAS_LINKS)) {
      expect(STRUCTURES.some((s) => s.id === sid), sid).toBe(true)
      expect(resolveLink(link, rows(link.bundle)).length, `${sid} resolves to no mesh`).toBeGreaterThan(0)
      if (link.ids) for (const id of link.ids) expect((rows(link.bundle) as { id: string }[]).some((r) => r.id === id), `${sid}:${id}`).toBe(true)
    }
  })
  it('atlas catalogue matches the files on disk and mesh ids are unique', () => {
    for (const b of BUILTIN_BUNDLES) {
      const glb = `public/models/zanatomy/${b.id}.glb`
      expect(existsSync(glb), glb).toBe(true)
      expect(statSync(glb).size).toBe(b.bytes)
      const m = JSON.parse(readFileSync(`public/models/zanatomy/${b.id}.json`, 'utf8')) as { meshes: { id: string; parent: string | null }[] }
      expect(m.meshes.length).toBe(b.mesh_count)
      const ids = new Set(m.meshes.map((r) => r.id))
      expect(ids.size).toBe(m.meshes.length)
      for (const r of m.meshes) if (r.parent) expect(ids.has(r.parent), `${b.id}:${r.id} parent`).toBe(true)
    }
  })
  it('every system bundle exists in the catalogue', () => {
    const known = new Set(BUILTIN_BUNDLES.map((b) => b.id))
    for (const s of SYSTEMS) for (const b of s.bundle_ids) expect(known.has(b), `${s.id}:${b}`).toBe(true)
    for (const l of LESSONS) if (l.bundle_id) expect(known.has(l.bundle_id)).toBe(true)
  })
  it('histology labels lie inside the 400x300 canvas', () => {
    for (const h of HISTOLOGY) for (const l of h.image.labels) { expect(l.x).toBeGreaterThan(0); expect(l.x).toBeLessThan(400); expect(l.y).toBeGreaterThan(0); expect(l.y).toBeLessThan(300) }
  })
  it('only cardiovascular and skeletal are marked as demonstration content', () => {
    expect(SYSTEMS.filter((s) => s.status === 'demonstration').map((s) => s.id).sort()).toEqual(['cardiovascular', 'skeletal'])
    expect(SYSTEMS).toHaveLength(12)
  })
})

describe('offline study helper', () => {
  it('answers from the notes', () => {
    expect(offlineAnswer('Explain the left ventricle', {})).toMatch(/Left ventricle/)
    expect(offlineAnswer('structural adaptations of the aorta', {})).toMatch(/elastic/i)
    expect(offlineAnswer('compare the left ventricle and right ventricle', {})).toMatch(/vs/)
    expect(offlineAnswer('flashcards for the femur', {})).toMatch(/Flashcards/)
    expect(offlineAnswer('quiz me on the mitral valve', {})).toMatch(/Practice questions/)
  })
  it('is honest when it has no match', () => {
    expect(offlineAnswer('what is the best pizza', {})).toMatch(/could not match/i)
  })
})
