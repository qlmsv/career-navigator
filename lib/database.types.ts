export interface Database {
  public: {
    Tables: {
      candidates: {
        Row: {
          id: string
          email: string
          name: string
          resume_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      test_results: {
        Row: {
          id: string
          candidate_id: string
          archetype: string | null
          big5_scores: Record<string, number> | null
          recommendations: string | null
          pdf_url: string | null
          test_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          archetype?: string | null
          big5_scores?: Record<string, number> | null
          recommendations?: string | null
          pdf_url?: string | null
          test_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          archetype?: string | null
          big5_scores?: Record<string, number> | null
          recommendations?: string | null
          pdf_url?: string | null
          test_completed?: boolean
          created_at?: string
        }
      }
      hr_users: {
        Row: {
          id: string
          email: string
          company: string | null
          role: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          company?: string | null
          role?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          company?: string | null
          role?: string | null
          created_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          hr_id: string
          unique_code: string
          used_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          hr_id: string
          unique_code?: string
          used_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          hr_id?: string
          unique_code?: string
          used_by?: string | null
          created_at?: string
        }
      }
    }
  }
}
