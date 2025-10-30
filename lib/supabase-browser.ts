import { createClient } from '@supabase/supabase-js'

// Browser (public) Supabase client. Safe for client components.
export const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
)
