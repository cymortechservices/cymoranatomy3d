import { isBackendConfigured, supabase } from '../lib/supabase'
import type { ChatMessage, TutorContext } from '../types'

export class TutorSetupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TutorSetupError'
  }
}

export const MAX_INPUT_CHARS = 1500

/** Calls the `tutor` Supabase Edge Function. The Gemini key lives only on the server. */
export async function askTutor(history: ChatMessage[], context: TutorContext): Promise<string> {
  if (!isBackendConfigured || !supabase) {
    throw new TutorSetupError('The AI tutor needs Supabase and a Gemini API key. See docs/GEMINI_SETUP.md.')
  }
  const messages = history
    .filter((m) => !m.error)
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_INPUT_CHARS) }))

  const { data, error } = await supabase.functions.invoke('tutor', { body: { messages, context } })
  if (error) {
    const status = (error as { context?: Response }).context?.status
    if (status === 429) throw new Error('The tutor is receiving many requests right now. Please wait a minute and try again.')
    if (status === 404) throw new TutorSetupError('The tutor function is not deployed yet. See docs/GEMINI_SETUP.md.')
    if (status === 503) throw new TutorSetupError('The tutor is not configured on the server (missing Gemini key).')
    throw new Error('The tutor could not answer right now. Please try again.')
  }
  const reply = (data as { reply?: string } | null)?.reply
  if (!reply) throw new Error('The tutor returned an empty answer. Please try again.')
  return reply
}
