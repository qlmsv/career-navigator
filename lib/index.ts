// PROGRESS: Обновлен для Карьерного навигатора

// Core utilities
export * from './types'
export * from './utils'
export * from './logger'

// Supabase
export * from './supabase-browser'
export * from './supabase-server'

// Career Assessment System
export * from './services/career-assessment'
export type {
  DigitalSkillCategory,
  DigitalSkill,
  Region,
  Profession,
  ProfessionSkillRequirement,
  RegionalSalaryData,
  UserSkillAssessment,
  UserSkillScore,
  LearningResource,
  UserRecommendation,
  SkillAssessmentForm,
  AssessmentResult,
  CareerRecommendations,
  SkillLevel,
  SKILL_LEVEL_NAMES,
  COMPETITIVENESS_LEVEL_NAMES,
  DEMAND_LEVEL_NAMES
} from './types/career-navigator'

// PDF processing (если еще используется)
export * from './pdf-processor'

// Database types
export * from './database.types'
