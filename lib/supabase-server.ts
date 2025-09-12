import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role. Never import in client code.
export const supabaseAdmin = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
)


