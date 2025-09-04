export interface Database {
  public: {
    Tables: {
      digital_skill_categories: {
        Row: {
          id: string
          name: string
          name_ru: string
          description: string | null
          icon: string | null
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_ru: string
          description?: string | null
          icon?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_ru?: string
          description?: string | null
          icon?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      digital_skills: {
        Row: {
          id: string
          category_id: string
          name: string
          name_ru: string
          description: string | null
          max_level: number
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          name_ru: string
          description?: string | null
          max_level?: number
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          name_ru?: string
          description?: string | null
          max_level?: number
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      regions: {
        Row: {
          id: string
          name: string
          name_ru: string
          country: string
          federal_district: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          name_ru: string
          country?: string
          federal_district?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_ru?: string
          country?: string
          federal_district?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      professions: {
        Row: {
          id: string
          name: string
          name_ru: string
          description: string | null
          industry: string | null
          is_ict_related: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_ru: string
          description?: string | null
          industry?: string | null
          is_ict_related?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_ru?: string
          description?: string | null
          industry?: string | null
          is_ict_related?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profession_skill_requirements: {
        Row: {
          id: string
          profession_id: string
          region_id: string
          skill_id: string
          required_level: number
          importance_weight: number
          demand_level: 'low' | 'medium' | 'high' | 'critical' | null
          salary_impact: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profession_id: string
          region_id: string
          skill_id: string
          required_level: number
          importance_weight?: number
          demand_level?: 'low' | 'medium' | 'high' | 'critical' | null
          salary_impact?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profession_id?: string
          region_id?: string
          skill_id?: string
          required_level?: number
          importance_weight?: number
          demand_level?: 'low' | 'medium' | 'high' | 'critical' | null
          salary_impact?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      regional_salary_data: {
        Row: {
          id: string
          profession_id: string
          region_id: string
          salary_min: number | null
          salary_median: number | null
          salary_max: number | null
          currency: string
          vacancy_count: number
          competition_level: 'low' | 'medium' | 'high' | null
          growth_trend: 'declining' | 'stable' | 'growing' | null
          data_source: string | null
          collection_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profession_id: string
          region_id: string
          salary_min?: number | null
          salary_median?: number | null
          salary_max?: number | null
          currency?: string
          vacancy_count?: number
          competition_level?: 'low' | 'medium' | 'high' | null
          growth_trend?: 'declining' | 'stable' | 'growing' | null
          data_source?: string | null
          collection_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profession_id?: string
          region_id?: string
          salary_min?: number | null
          salary_median?: number | null
          salary_max?: number | null
          currency?: string
          vacancy_count?: number
          competition_level?: 'low' | 'medium' | 'high' | null
          growth_trend?: 'declining' | 'stable' | 'growing' | null
          data_source?: string | null
          collection_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_skill_assessments: {
        Row: {
          id: string
          user_id: string
          current_profession_id: string | null
          target_profession_id: string | null
          region_id: string | null
          experience_years: number | null
          current_salary: number | null
          target_salary: number | null
          assessment_data: Record<string, any>
          overall_score: number | null
          competitiveness_level: 'low' | 'below_average' | 'average' | 'above_average' | 'high' | null
          assessment_duration: number | null
          is_completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_profession_id?: string | null
          target_profession_id?: string | null
          region_id?: string | null
          experience_years?: number | null
          current_salary?: number | null
          target_salary?: number | null
          assessment_data: Record<string, any>
          overall_score?: number | null
          competitiveness_level?: 'low' | 'below_average' | 'average' | 'above_average' | 'high' | null
          assessment_duration?: number | null
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_profession_id?: string | null
          target_profession_id?: string | null
          region_id?: string | null
          experience_years?: number | null
          current_salary?: number | null
          target_salary?: number | null
          assessment_data?: Record<string, any>
          overall_score?: number | null
          competitiveness_level?: 'low' | 'below_average' | 'average' | 'above_average' | 'high' | null
          assessment_duration?: number | null
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_skill_scores: {
        Row: {
          id: string
          assessment_id: string
          skill_id: string
          self_assessment_level: number
          confidence_level: number | null
          market_required_level: number | null
          gap_analysis: number | null
          improvement_priority: 'low' | 'medium' | 'high' | 'critical' | null
          created_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          skill_id: string
          self_assessment_level: number
          confidence_level?: number | null
          market_required_level?: number | null
          gap_analysis?: number | null
          improvement_priority?: 'low' | 'medium' | 'high' | 'critical' | null
          created_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          skill_id?: string
          self_assessment_level?: number
          confidence_level?: number | null
          market_required_level?: number | null
          gap_analysis?: number | null
          improvement_priority?: 'low' | 'medium' | 'high' | 'critical' | null
          created_at?: string
        }
      }
      learning_resources: {
        Row: {
          id: string
          title: string
          description: string | null
          provider: string | null
          url: string | null
          resource_type: 'course' | 'certification' | 'book' | 'video' | 'article' | 'practice'
          target_skills: Record<string, any> | null
          skill_level_from: number
          skill_level_to: number
          duration_hours: number | null
          price_rub: number
          language: string
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          rating: number | null
          reviews_count: number
          completion_rate: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          provider?: string | null
          url?: string | null
          resource_type: 'course' | 'certification' | 'book' | 'video' | 'article' | 'practice'
          target_skills?: Record<string, any> | null
          skill_level_from?: number
          skill_level_to?: number
          duration_hours?: number | null
          price_rub?: number
          language?: string
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          rating?: number | null
          reviews_count?: number
          completion_rate?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          provider?: string | null
          url?: string | null
          resource_type?: 'course' | 'certification' | 'book' | 'video' | 'article' | 'practice'
          target_skills?: Record<string, any> | null
          skill_level_from?: number
          skill_level_to?: number
          duration_hours?: number | null
          price_rub?: number
          language?: string
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          rating?: number | null
          reviews_count?: number
          completion_rate?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_recommendations: {
        Row: {
          id: string
          assessment_id: string
          priority_skills: Record<string, any>
          recommended_resources: Record<string, any>
          career_paths: Record<string, any>
          salary_potential: Record<string, any>
          ai_analysis: string | null
          action_plan: Record<string, any>
          timeline_months: number | null
          generated_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          priority_skills: Record<string, any>
          recommended_resources: Record<string, any>
          career_paths: Record<string, any>
          salary_potential: Record<string, any>
          ai_analysis?: string | null
          action_plan: Record<string, any>
          timeline_months?: number | null
          generated_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          priority_skills?: Record<string, any>
          recommended_resources?: Record<string, any>
          career_paths?: Record<string, any>
          salary_potential?: Record<string, any>
          ai_analysis?: string | null
          action_plan?: Record<string, any>
          timeline_months?: number | null
          generated_at?: string
          expires_at?: string
        }
      }
    }
  }
}
