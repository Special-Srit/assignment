import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Use placeholder values during Next.js prerender (static export build phase).
// All actual Supabase calls happen inside useEffect (client-only), so the
// placeholder client is never used to make real network requests.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
