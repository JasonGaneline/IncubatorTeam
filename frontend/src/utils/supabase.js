/**
 * Browser Supabase client (anon / publishable key).
 * Create a `todos` table in Supabase SQL editor to try the demo route, or use this client elsewhere.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export function isSupabaseConfigured() {
  return Boolean(supabase)
}
