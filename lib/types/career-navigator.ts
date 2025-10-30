// ТИПЫ для системы Карьерный навигатор
// Самодиагностика конкурентоспособности на рынке труда

// ========== БАЗОВЫЕ СПРАВОЧНИКИ ==========

export interface DigitalSkillCategory {
  id: string
  name: string
  name_ru: string
  description?: string
  icon?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DigitalSkill {
  id: string
  category_id: string
  name: string
  name_ru: string
  description?: string
  max_level: number // 1-5
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string

  // Связанные данные
  category?: DigitalSkillCategory
}

export interface Region {
  id: string
  name: string
  name_ru: string
  country: string
  federal_district?: string
  is_active: boolean
  created_at: string
}

export interface Profession {
  id: string
  name: string
  name_ru: string
  description?: string
  industry?: string
  is_ict_related: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// ========== ТРЕБОВАНИЯ РЫНКА ТРУДА ==========

export interface ProfessionSkillRequirement {
  id: string
  profession_id: string
  region_id: string
  skill_id: string

  required_level: number // 1-5
  importance_weight: number // 0.1-1.0
  demand_level: 'low' | 'medium' | 'high' | 'critical'
  salary_impact?: number // влияние на зарплату в %

  created_at: string
  updated_at: string

  // Связанные данные
  profession?: Profession
  region?: Region
  skill?: DigitalSkill
}

export interface RegionalSalaryData {
  id: string
  profession_id: string
  region_id: string

  salary_min?: number
  salary_median?: number
  salary_max?: number
  currency: string

  vacancy_count: number
  competition_level: 'low' | 'medium' | 'high'
  growth_trend: 'declining' | 'stable' | 'growing'

  data_source?: string
  collection_date: string
  created_at: string
  updated_at: string

  // Связанные данные
  profession?: Profession
  region?: Region
}

// ========== ПОЛЬЗОВАТЕЛЬСКИЕ ОЦЕНКИ ==========

export interface UserSkillAssessment {
  id: string
  user_id: string

  // Профессиональная информация
  current_profession_id?: string
  target_profession_id?: string
  region_id?: string
  experience_years?: number
  current_salary?: number
  target_salary?: number

  // Результаты
  assessment_data: Record<string, any> // JSONB
  overall_score?: number
  competitiveness_level?: 'low' | 'below_average' | 'average' | 'above_average' | 'high'

  // Метаданные
  assessment_duration?: number // секунды
  is_completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string

  // Связанные данные
  current_profession?: Profession
  target_profession?: Profession
  region?: Region
  skill_scores?: UserSkillScore[]
  recommendations?: UserRecommendation
}

export interface UserSkillScore {
  id: string
  assessment_id: string
  skill_id: string

  self_assessment_level: number // 1-5
  confidence_level?: number // 1-5

  // Сравнение с рынком
  market_required_level?: number
  gap_analysis?: number // разница между требуемым и текущим
  improvement_priority?: 'low' | 'medium' | 'high' | 'critical'

  created_at: string

  // Связанные данные
  skill?: DigitalSkill
}

// ========== ОБРАЗОВАТЕЛЬНЫЕ РЕСУРСЫ ==========

export interface LearningResource {
  id: string
  title: string
  description?: string
  provider?: string
  url?: string
  resource_type: 'course' | 'certification' | 'book' | 'video' | 'article' | 'practice'

  // Связь с навыками
  target_skills?: string[] // массив skill_id
  skill_level_from: number
  skill_level_to: number

  // Характеристики
  duration_hours?: number
  price_rub: number
  language: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'

  // Рейтинг
  rating?: number
  reviews_count: number
  completion_rate?: number

  is_active: boolean
  created_at: string
  updated_at: string
}

// ========== РЕКОМЕНДАЦИИ ==========

export interface UserRecommendation {
  id: string
  assessment_id: string

  // Рекомендации
  priority_skills: Record<string, any> // JSONB
  recommended_resources: Record<string, any> // JSONB
  career_paths: Record<string, any> // JSONB
  salary_potential: Record<string, any> // JSONB

  // ИИ-анализ
  ai_analysis?: string
  action_plan: Record<string, any> // JSONB
  timeline_months?: number

  generated_at: string
  expires_at: string
}

// ========== ФОРМЫ И ИНТЕРФЕЙСЫ ==========

export interface SkillAssessmentForm {
  // Профессиональная информация
  current_profession_id: string
  target_profession_id?: string
  region_id: string
  experience_years: number
  current_salary?: number
  target_salary?: number

  // Оценки навыков по категориям
  skill_assessments: {
    [skillId: string]: {
      self_assessment_level: number
      confidence_level: number
    }
  }
}

export interface AssessmentResult {
  overall_score: number
  competitiveness_level: 'low' | 'below_average' | 'average' | 'above_average' | 'high'

  // Детализация по навыкам
  skill_results: {
    [skillId: string]: {
      current_level: number
      required_level: number
      gap: number
      priority: 'low' | 'medium' | 'high' | 'critical'
    }
  }

  // Статистика
  strengths: DigitalSkill[]
  improvement_areas: DigitalSkill[]

  // Сравнение с рынком
  market_comparison: {
    salary_potential_min: number
    salary_potential_max: number
    competition_level: 'low' | 'medium' | 'high'
    demand_trend: 'declining' | 'stable' | 'growing'
  }
}

export interface CareerRecommendations {
  // Приоритетные навыки для развития
  priority_skills: Array<{
    skill: DigitalSkill
    current_level: number
    target_level: number
    importance: 'high' | 'medium' | 'low'
    salary_impact: number
  }>

  // Рекомендуемые курсы и ресурсы
  recommended_resources: Array<{
    resource: LearningResource
    relevance_score: number
    expected_improvement: number
    roi_estimate: number // возврат инвестиций
  }>

  // Карьерные пути
  career_paths: Array<{
    target_profession: Profession
    required_skills: DigitalSkill[]
    timeline_months: number
    salary_increase_potential: number
    difficulty: 'easy' | 'medium' | 'hard'
  }>

  // План действий
  action_plan: Array<{
    step: number
    title: string
    description: string
    timeline: string
    resources: LearningResource[]
    expected_outcome: string
  }>
}

// ========== API ОТВЕТЫ ==========

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error?: string
  message?: string
}

export interface AssessmentApiResponse
  extends ApiResponse<{
    assessment: UserSkillAssessment
    results: AssessmentResult
    recommendations: CareerRecommendations
  }> {}

// ========== УТИЛИТЫ ==========

export type SkillLevel = 1 | 2 | 3 | 4 | 5

export const SKILL_LEVEL_NAMES: Record<SkillLevel, string> = {
  1: 'Начинающий',
  2: 'Базовый',
  3: 'Средний',
  4: 'Продвинутый',
  5: 'Экспертный',
}

export const COMPETITIVENESS_LEVEL_NAMES = {
  low: 'Низкая',
  below_average: 'Ниже среднего',
  average: 'Средняя',
  above_average: 'Выше среднего',
  high: 'Высокая',
} as const

export const DEMAND_LEVEL_NAMES = {
  low: 'Низкий спрос',
  medium: 'Средний спрос',
  high: 'Высокий спрос',
  critical: 'Критически важно',
} as const
