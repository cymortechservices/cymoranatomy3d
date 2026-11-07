import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True only when BOTH public Supabase variables are present. Otherwise the app runs in demo mode. */
export const isBackendConfigured = Boolean(url && anon && url.startsWith('http'))

export const supabase: SupabaseClient | null = isBackendConfigured ? createClient(url!, anon!) : null
