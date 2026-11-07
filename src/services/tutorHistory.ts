import { supabase } from '../lib/supabase'
import type { ChatMessage } from '../types'

/** Best-effort cloud copy of a conversation for signed-in users. Local storage remains the source of truth. */
export async function saveConversationToCloud(userId: string, conversationId: string, title: string, messages: ChatMessage[]): Promise<void> {
  if (!supabase) return
  try {
    await supabase.from('tutor_conversations').upsert({ id: conversationId, user_id: userId, title: title.slice(0, 120), updated_at: new Date().toISOString() })
    const rows = messages.filter((m) => !m.error).map((m) => ({ id: m.id, conversation_id: conversationId, user_id: userId, role: m.role, content: m.content.slice(0, 8000), created_at: m.created_at }))
    if (rows.length) await supabase.from('tutor_messages').upsert(rows)
  } catch {
    /* ignore: local history is still saved */
  }
}
