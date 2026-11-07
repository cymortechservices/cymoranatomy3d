import { getOrgan } from '../data/organs'
import { getRegion } from '../data/regions'
import { QUESTIONS } from '../data/questions'
import { STRUCTURES, getStructure } from '../data/structures'
import { SYSTEMS, getSystem } from '../data/systems'
import { searchAnatomy } from './search'
import type { Structure, TutorContext } from '../types'

/**
 * Offline study helper. This is NOT an AI. It answers from the verified notes bundled with the app so that
 * learners still get useful, accurate output when no Gemini key is configured.
 */

const STOP = new Set(['what', 'is', 'are', 'the', 'a', 'an', 'of', 'in', 'on', 'and', 'to', 'me', 'about', 'explain', 'tell', 'describe', 'does', 'do', 'how', 'why', 'where', 'give', 'show', 'please', 'its', 'it', 'for', 'with', 'compare', 'vs', 'versus', 'between', 'difference', 'differences', 'functions', 'function', 'adaptations', 'adaptation', 'clinical', 'relevance', 'location', 'notes', 'revision', 'flashcards', 'flashcard', 'quiz', 'mcq', 'question', 'questions', 'make', 'create', 'generate'])

function findStructures(text: string): Structure[] {
  const q = text.toLowerCase()
  const found: Structure[] = []
  // longest names first so "left ventricle" wins over "ventricle"
  const sorted = [...STRUCTURES].sort((a, b) => b.anatomical_name.length - a.anatomical_name.length)
  for (const s of sorted) {
    const names = [s.anatomical_name, s.common_name, ...s.synonyms].map((n) => n.toLowerCase().replace(/\s*\(.*?\)\s*/g, ' ').trim()).filter((n) => n.length > 2)
    if (names.some((n) => q.includes(n)) && !found.includes(s)) found.push(s)
  }
  if (found.length) return found.slice(0, 3)
  const tokens = q.split(/[^a-z]+/).filter((t) => t.length > 2 && !STOP.has(t)).join(' ')
  return searchAnatomy(tokens, 3).filter((r) => r.kind === 'structure').map((r) => getStructure(r.id)!).filter(Boolean)
}

const list = (items?: string[]) => (items && items.length ? items.map((i) => `- ${i}`).join('\n') : '')

function describe(s: Structure, focus: 'all' | 'adaptations' | 'functions' | 'clinical' | 'location'): string {
  const system = getSystem(s.system_id)?.name
  const organ = getOrgan(s.organ_id)?.name
  const region = getRegion(s.region_id)?.name
  const parts: string[] = [`## ${s.anatomical_name}`]
  if (focus === 'all') parts.push(`**Definition:** ${s.anatomical_name} (${s.common_name}) is classified as: ${s.classification}.`)
  if (focus === 'all' || focus === 'location') parts.push(`**Location:** ${s.location}${organ || region ? ` (${[system, region, organ].filter(Boolean).join(' › ')})` : ''}`)
  if (focus === 'all') {
    const chars = [...(s.external_characteristics ?? []), ...(s.internal_characteristics ?? [])]
    if (chars.length) parts.push(`**Characteristics:**\n${list(chars)}`)
  }
  if ((focus === 'all' || focus === 'adaptations') && s.structural_adaptations?.length) parts.push(`**Structural adaptations:**\n${list(s.structural_adaptations)}`)
  if (focus === 'adaptations' && !s.structural_adaptations?.length) parts.push('No structural adaptations are recorded for this structure in the built-in notes.')
  if (focus === 'all' || focus === 'functions') parts.push(`**Functions:**\n${list(s.functions)}`)
  if ((focus === 'all' || focus === 'clinical') && s.clinical_relevance?.length) parts.push(`**Clinical relevance:**\n${list(s.clinical_relevance)}`)
  if (focus === 'clinical' && !s.clinical_relevance?.length) parts.push('No clinical notes are recorded for this structure in the built-in notes.')
  if (focus === 'all' && s.related_structures.length) {
    parts.push(`**Related structures:** ${s.related_structures.map((r) => getStructure(r)?.anatomical_name ?? r).join(', ')}`)
  }
  return parts.join('\n\n')
}

function compare(a: Structure, b: Structure): string {
  const row = (label: string, x: string, y: string) => `- **${label}:** ${a.anatomical_name}: ${x} | ${b.anatomical_name}: ${y}`
  return [
    `## ${a.anatomical_name} vs ${b.anatomical_name}`,
    row('Classification', a.classification, b.classification),
    row('Location', a.location, b.location),
    row('Adaptations', (a.structural_adaptations ?? ['not recorded']).join('; '), (b.structural_adaptations ?? ['not recorded']).join('; ')),
    row('Functions', a.functions.join('; '), b.functions.join('; ')),
  ].join('\n')
}

function flashcards(structs: Structure[]): string {
  const cards = structs.flatMap((s) => [
    `**Q:** Where is the ${s.anatomical_name.toLowerCase()} located?\n**A:** ${s.location}`,
    `**Q:** What are the main functions of the ${s.anatomical_name.toLowerCase()}?\n**A:** ${s.functions.join('; ')}`,
    ...(s.structural_adaptations?.length ? [`**Q:** Name an adaptation of the ${s.anatomical_name.toLowerCase()}.\n**A:** ${s.structural_adaptations[0]}`] : []),
  ])
  return `## Flashcards\n\n${cards.join('\n\n')}`
}

function quizMe(structs: Structure[], ctx: TutorContext): string {
  const topic = (ctx.system ?? structs[0]?.system_id ?? '').toLowerCase()
  const pool = QUESTIONS.filter((q) => (q.type === 'mcq' || q.type === 'tf') && (!topic || q.topic === topic || (structs[0] && q.structure_id === structs[0].id)))
  const chosen = (pool.length ? pool : QUESTIONS.filter((q) => q.type === 'mcq')).slice(0, 3)
  return `## Practice questions\n\n${chosen
    .map((q, i) => `**${i + 1}. ${q.prompt}**\n${(q.options ?? []).map((o) => `- ${o.text}`).join('\n')}\n*Answer:* ${(q.options ?? []).find((o) => o.id === q.correct)?.text}. ${q.explanation}`)
    .join('\n\n')}`
}

export function offlineAnswer(question: string, ctx: TutorContext): string {
  const q = question.toLowerCase()
  let structs = findStructures(question)
  if (!structs.length && ctx.structure) {
    const fromCtx = STRUCTURES.find((s) => s.anatomical_name.toLowerCase() === ctx.structure!.toLowerCase())
    if (fromCtx) structs = [fromCtx]
  }

  // System-level questions
  if (!structs.length) {
    const sys = SYSTEMS.find((s) => q.includes(s.name.toLowerCase().replace(' system', '')) || q.includes(s.id))
    if (sys) {
      return `## ${sys.name}\n\n${sys.introduction}\n\n**Functions:**\n${list(sys.functions)}\n\n**Structural adaptations:**\n${list(sys.structural_adaptations)}\n\n**Learning objectives:**\n${list(sys.learning_objectives)}`
    }
    return 'I could not match that to a topic in the built-in notes. Try naming a structure, for example "left ventricle", "femur" or "mitral valve", or ask about the cardiovascular or skeletal system.'
  }

  if (/flash ?cards?/.test(q)) return flashcards(structs)
  if (/\bquiz\b|\bmcq\b|test me|practice questions?/.test(q)) return quizMe(structs, ctx)
  if (/compare|difference|versus|\bvs\b/.test(q) && structs.length >= 2) return compare(structs[0], structs[1])
  if (/adapt/.test(q)) return describe(structs[0], 'adaptations')
  if (/clinical|disease|fracture|problem/.test(q)) return describe(structs[0], 'clinical')
  if (/function|what does|role/.test(q)) return describe(structs[0], 'functions')
  if (/where|located|location|position/.test(q)) return describe(structs[0], 'location')
  return describe(structs[0], 'all')
}

export const OFFLINE_SUGGESTIONS = [
  'Explain the left ventricle',
  'Structural adaptations of the aorta',
  'Compare the left and right ventricle',
  'Flashcards for the femur',
  'Quiz me on the heart valves',
  'Clinical relevance of the clavicle',
]
