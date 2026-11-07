/** Shared content schema. Field names are snake_case so they map 1:1 to the Supabase columns. */

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type ContentStatus = 'demonstration' | 'introductory'
export type Subject = 'anatomy' | 'physiology' | 'histology' | 'embryology'

export interface Reference {
  title: string
  source: string
  url?: string
  note?: string
}

export interface BodySystem {
  id: string
  name: string
  summary: string
  introduction: string
  status: ContentStatus
  major_organs: string[]
  major_structures: string[]
  functions: string[]
  structural_adaptations: string[]
  physiological_relationships: string[]
  related_systems: string[]
  learning_objectives: string[]
  revision_questions: { question: string; answer: string }[]
  references: Reference[]
  /** Atlas bundles (3D models) that represent this system; empty when no model is available. */
  bundle_ids: string[]
}

export interface Region {
  id: string
  name: string
  description: string
}

export interface Organ {
  id: string
  name: string
  system_id: string
  region_id: string
  description: string
  structure_ids: string[]
}

export interface Structure {
  id: string
  anatomical_name: string
  common_name: string
  synonyms: string[]
  system_id: string
  region_id: string
  organ_id: string
  classification: string
  anatomical_position?: string
  location: string
  external_characteristics?: string[]
  internal_characteristics?: string[]
  structural_adaptations?: string[]
  functions: string[]
  blood_supply?: string
  nerve_supply?: string
  lymphatic_drainage?: string
  anatomical_relations?: string[]
  articulations?: string[]
  attachments?: string[]
  clinical_relevance?: string[]
  related_structures: string[]
  illustration_reference?: string
  references: Reference[]
  difficulty_level: Difficulty
}

export interface AnimationStep {
  title: string
  description: string
  /** 0..1 position in the loop */
  at: number
}

export interface PhysiologyAnimation {
  id: string
  title: string
  system_id: string
  summary: string
  duration_s: number
  steps: AnimationStep[]
  structure_ids: string[]
  simplifications: string[]
  kind: 'cardiac' | 'breathing' | 'joint' | 'peristalsis' | 'circulation'
}

export interface LessonSection {
  heading: string
  body: string[]
  kind?: 'text' | 'characteristics' | 'adaptations' | 'functions'
}

export interface Lesson {
  id: string
  title: string
  subject: Subject
  system_id: string
  region_id?: string
  organ_id?: string
  difficulty: Difficulty
  summary: string
  learning_objectives: string[]
  sections: LessonSection[]
  related_structure_ids: string[]
  exercises: { question: string; answer: string }[]
  /** Atlas bundle opened by 'Related 3D model'. */
  bundle_id?: string
  references: Reference[]
}

export interface HistologyLabel {
  x: number
  y: number
  text: string
}

export interface HistologyTopic {
  id: string
  name: string
  classification: string
  cellular_characteristics: string[]
  structural_adaptations: string[]
  functions: string[]
  locations: string[]
  identification_features: string[]
  related_organs: string[]
  related_structure_ids: string[]
  image: {
    kind: 'schematic' | 'photomicrograph'
    /** For photomicrographs only: file path + licence metadata. */
    url?: string
    credit: string
    licence: string
    magnification: string
    stain: string
    labels: HistologyLabel[]
  }
  practice: { question: string; answer: string }[]
}

export type QuestionType = 'mcq' | 'tf' | 'match' | 'identify' | 'label' | 'fill'

export interface QuestionOption {
  id: string
  text: string
}

export interface Question {
  id: string
  type: QuestionType
  topic: 'cardiovascular' | 'skeletal' | 'histology'
  difficulty: Difficulty
  prompt: string
  options?: QuestionOption[]
  /** mcq/tf/identify: option id. fill: unused. */
  correct?: string
  /** fill: accepted answers (normalised comparison). */
  accepted?: string[]
  /** match: left item -> correct right item. */
  pairs?: { left: string; right: string }[]
  /** label: pin number -> correct option id; options are shared. */
  pin_answers?: Record<string, string>
  diagram?: 'heart' | 'long-bone'
  highlight_pin?: string
  explanation: string
  structure_id?: string
}

export type UserAnswer = string | Record<string, string> | null

export interface QuizAttempt {
  id: string
  topic: string
  difficulty: string
  mode: 'timed' | 'untimed'
  total: number
  correct: number
  percent: number
  taken_at: string
  incorrect_question_ids: string[]
}

export interface Bookmark {
  structure_id: string
  created_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  error?: boolean
}

export interface TutorContext {
  system?: string
  region?: string
  organ?: string
  structure?: string
  lesson?: string
  topic?: string
}
