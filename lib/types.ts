// PROGRESS: Step 1/1 done – Cleaned up types

/**
 * ==================================================================
 *                          Core User Types
 * ==================================================================
 */

import type { User as SupabaseUser } from '@supabase/supabase-js'

// Расширяем стандартный тип Supabase, если нужно
export interface AppUser extends SupabaseUser {}

export interface UserProfile {
  id: string
  user_id: string
  full_name?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  location?: string
  age?: number
  current_position?: string
  current_company?: string
  industry?: string
  preferred_industries?: string[]
  experience_level?: 'Junior' | 'Middle' | 'Senior' | 'Lead'
  total_experience?: string
  total_experience_months?: number
  salary_expectations?: string
  work_format?: 'remote' | 'office' | 'hybrid'
  relocation_readiness?: boolean
  university?: string
  degree?: string
  education_level?: string
  specialization?: string
  graduation_year?: number
  key_skills?: string[]
  technical_skills?: string[]
  languages?: Array<{ name: string; level: string }>
  soft_skills?: string[]
  career_goals?: string
  summary?: string
  resume_uploaded?: boolean
  resume_analyzed?: boolean
  profile_completeness?: number
  data_source?: string
}

/**
 * ==================================================================
 *                       Test Engine Types
 * ==================================================================
 */

export interface TestQuestion {
  id: string
  text: string
  type: 'big5' | 'jungian'
  facet?: string
  options: Array<{
    text: string
    score?: number
    archetype?: string
  }>
}

export interface TestResult {
  id: string
  user_id: string
  test_date: string
  big_five_scores: Record<string, number>
  dominant_archetype: string
  all_answers: Record<string, any>
  ai_analysis: string
  created_at: string
}

/**
 * ==================================================================
 *                       API & Error Handling
 * ==================================================================
 */

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  error: string | null
}

export interface ResumeAnalysis {
  personal_info?: {
    full_name?: string
    first_name?: string
    last_name?: string
    phone?: string
    email?: string
    location?: string
  }
  professional_info?: {
    current_position?: string
    current_company?: string
    industry?: string
    experience_level?: 'Junior' | 'Middle' | 'Senior' | 'Lead'
    total_experience?: string
    total_experience_months?: number
    salary_expectations?: any
    work_format?: string
  }
  experience?: WorkExperience[]
  education?: Education[]
  skills?: {
    technical_skills?: string[]
    soft_skills?: string[]
    languages?: string[]
  }
}

export interface WorkExperience {
  company?: string
  position?: string
  start_date?: string
  end_date?: string
  duration_months?: number
  location?: string
  industry?: string
  description?: string
  achievements?: string[]
  technologies?: string[]
}

export interface Education {
  institution?: string
  degree?: string
  specialization?: string
  graduation_year?: number
  grade?: string
}
