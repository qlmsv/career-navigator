// PROGRESS: Step 1/1 done – Replace @supabase/ssr with @supabase/supabase-js to fix createClient runtime error
// Supabase clients (browser + server)

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { UserProfile, ResumeAnalysis, WorkExperience, TestResult } from './types'

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!

// Public client for general usage (browser/server)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side usage (bypasses RLS)
let supabaseAdmin: SupabaseClient | null = null

if (typeof window === 'undefined') {
  const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']
  if (supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  } else {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Admin client not created.')
  }
}

export { supabaseAdmin }

// Типы для базы данных теперь импортируются из lib/types.ts
export type { UserProfile, ResumeAnalysis, WorkExperience, TestResult }
