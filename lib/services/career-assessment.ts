// СЕРВИС для работы с системой самодиагностики карьеры
import { createClient } from '@/lib/supabase/client'
import type {
  DigitalSkillCategory,
  DigitalSkill,
  Region,
  Profession,
  UserSkillAssessment,
  UserSkillScore,
  SkillAssessmentForm,
  AssessmentResult,
  CareerRecommendations,
  LearningResource,
  ProfessionSkillRequirement,
  RegionalSalaryData
} from '@/lib/types/career-navigator'

export class CareerAssessmentService {
  private _supabase: any = null

  private get supabase() {
    if (!this._supabase) {
      this._supabase = createClient()
    }
    return this._supabase
  }

  // ========== ПОЛУЧЕНИЕ СПРАВОЧНЫХ ДАННЫХ ==========

  /**
   * Получить все категории навыков
   */
  async getSkillCategories(): Promise<DigitalSkillCategory[]> {
    const { data, error } = await this.supabase
      .from('digital_skill_categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index')

    if (error) throw new Error(`Ошибка получения категорий навыков: ${error.message}`)
    return data || []
  }

  /**
   * Получить навыки по категории
   */
  async getSkillsByCategory(categoryId?: string): Promise<DigitalSkill[]> {
    let query = this.supabase
      .from('digital_skills')
      .select(`
        *,
        category:digital_skill_categories(*)
      `)
      .eq('is_active', true)
      .order('order_index')

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query

    if (error) throw new Error(`Ошибка получения навыков: ${error.message}`)
    return data || []
  }

  /**
   * Получить все навыки с категориями
   */
  async getAllSkills(): Promise<DigitalSkill[]> {
    const { data, error } = await this.supabase
      .from('digital_skills')
      .select(`
        *,
        category:digital_skill_categories(*)
      `)
      .eq('is_active', true)
      .order('category.order_index, order_index')

    if (error) throw new Error(`Ошибка получения всех навыков: ${error.message}`)
    return data || []
  }

  /**
   * Получить регионы
   */
  async getRegions(): Promise<Region[]> {
    const { data, error } = await this.supabase
      .from('regions')
      .select('*')
      .eq('is_active', true)
      .order('name_ru')

    if (error) throw new Error(`Ошибка получения регионов: ${error.message}`)
    return data || []
  }

  /**
   * Получить профессии (не ИКТ)
   */
  async getProfessions(): Promise<Profession[]> {
    const { data, error } = await this.supabase
      .from('professions')
      .select('*')
      .eq('is_active', true)
      .eq('is_ict_related', false)
      .order('name_ru')

    if (error) throw new Error(`Ошибка получения профессий: ${error.message}`)
    return data || []
  }

  // ========== РАБОТА С ОЦЕНКАМИ ==========

  /**
   * Создать новую оценку
   */
  async createAssessment(userId: string, formData: SkillAssessmentForm): Promise<string> {
    const assessmentData = {
      user_id: userId,
      current_profession_id: formData.current_profession_id,
      target_profession_id: formData.target_profession_id,
      region_id: formData.region_id,
      experience_years: formData.experience_years,
      current_salary: formData.current_salary,
      target_salary: formData.target_salary,
      assessment_data: formData.skill_assessments,
      is_completed: false
    }

    const { data, error } = await this.supabase
      .from('user_skill_assessments')
      .insert(assessmentData)
      .select('id')
      .single()

    if (error) throw new Error(`Ошибка создания оценки: ${error.message}`)
    return data.id
  }

  /**
   * Сохранить оценки навыков
   */
  async saveSkillScores(assessmentId: string, skillScores: Record<string, any>): Promise<void> {
    const scores = Object.entries(skillScores).map(([skillId, score]) => ({
      assessment_id: assessmentId,
      skill_id: skillId,
      self_assessment_level: score.self_assessment_level,
      confidence_level: score.confidence_level
    }))

    const { error } = await this.supabase
      .from('user_skill_scores')
      .insert(scores)

    if (error) throw new Error(`Ошибка сохранения оценок навыков: ${error.message}`)
  }

  /**
   * Завершить оценку и рассчитать результаты
   */
  async completeAssessment(assessmentId: string): Promise<AssessmentResult> {
    // Получаем данные оценки
    const assessment = await this.getAssessmentById(assessmentId)
    if (!assessment) {
      throw new Error('Оценка не найдена')
    }

    // Рассчитываем результаты
    const results = await this.calculateAssessmentResults(assessment)

    // Обновляем статус оценки
    await this.supabase
      .from('user_skill_assessments')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        overall_score: results.overall_score,
        competitiveness_level: results.competitiveness_level
      })
      .eq('id', assessmentId)

    return results
  }

  /**
   * Получить оценку по ID
   */
  async getAssessmentById(assessmentId: string): Promise<UserSkillAssessment | null> {
    const { data, error } = await this.supabase
      .from('user_skill_assessments')
      .select(`
        *,
        current_profession:professions!current_profession_id(*),
        target_profession:professions!target_profession_id(*),
        region:regions(*),
        skill_scores:user_skill_scores(
          *,
          skill:digital_skills(
            *,
            category:digital_skill_categories(*)
          )
        )
      `)
      .eq('id', assessmentId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Ошибка получения оценки: ${error.message}`)
    }

    return data
  }

  /**
   * Получить оценки пользователя
   */
  async getUserAssessments(userId: string): Promise<UserSkillAssessment[]> {
    const { data, error } = await this.supabase
      .from('user_skill_assessments')
      .select(`
        *,
        current_profession:professions!current_profession_id(*),
        region:regions(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Ошибка получения оценок пользователя: ${error.message}`)
    return data || []
  }

  // ========== АНАЛИЗ И РАСЧЕТЫ ==========

  /**
   * Рассчитать результаты оценки
   */
  private async calculateAssessmentResults(assessment: UserSkillAssessment): Promise<AssessmentResult> {
    if (!assessment.skill_scores || !assessment.current_profession_id || !assessment.region_id) {
      throw new Error('Недостаточно данных для расчета результатов')
    }

    // Получаем требования рынка для профессии и региона
    const requirements = await this.getProfessionRequirements(
      assessment.current_profession_id,
      assessment.region_id
    )

    // Рассчитываем результаты по каждому навыку
    const skillResults: Record<string, any> = {}
    let totalScore = 0
    let totalWeight = 0
    const strengths: DigitalSkill[] = []
    const improvementAreas: DigitalSkill[] = []

    for (const skillScore of assessment.skill_scores) {
      if (!skillScore.skill) continue

      const requirement = requirements.find(r => r.skill_id === skillScore.skill_id)
      const requiredLevel = requirement?.required_level || 3
      const weight = requirement?.importance_weight || 1.0

      const gap = skillScore.self_assessment_level - requiredLevel
      let priority: 'low' | 'medium' | 'high' | 'critical' = 'low'

      if (gap < -2) priority = 'critical'
      else if (gap < -1) priority = 'high'
      else if (gap < 0) priority = 'medium'
      else priority = 'low'

      skillResults[skillScore.skill_id] = {
        current_level: skillScore.self_assessment_level,
        required_level: requiredLevel,
        gap,
        priority
      }

      // Взвешенный балл для общей оценки
      const normalizedScore = Math.min(skillScore.self_assessment_level / requiredLevel, 1.2) // максимум 120%
      totalScore += normalizedScore * weight
      totalWeight += weight

      // Определяем сильные стороны и области для улучшения
      if (gap >= 1) {
        strengths.push(skillScore.skill)
      } else if (gap < -1) {
        improvementAreas.push(skillScore.skill)
      }
    }

    // Общий балл конкурентоспособности (0-100)
    const overallScore = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 50

    // Уровень конкурентоспособности
    let competitivenessLevel: AssessmentResult['competitiveness_level'] = 'average'
    if (overallScore >= 90) competitivenessLevel = 'high'
    else if (overallScore >= 70) competitivenessLevel = 'above_average'
    else if (overallScore >= 50) competitivenessLevel = 'average'
    else if (overallScore >= 30) competitivenessLevel = 'below_average'
    else competitivenessLevel = 'low'

    // Получаем данные о зарплатах
    const salaryData = await this.getSalaryData(
      assessment.current_profession_id,
      assessment.region_id
    )

    return {
      overall_score: overallScore,
      competitiveness_level: competitivenessLevel,
      skill_results: skillResults,
      strengths,
      improvement_areas: improvementAreas,
      market_comparison: {
        salary_potential_min: salaryData?.salary_min || 0,
        salary_potential_max: salaryData?.salary_max || 0,
        competition_level: salaryData?.competition_level || 'medium',
        demand_trend: salaryData?.growth_trend || 'stable'
      }
    }
  }

  /**
   * Получить требования к навыкам для профессии и региона
   */
  async getProfessionRequirements(
    professionId: string,
    regionId: string
  ): Promise<ProfessionSkillRequirement[]> {
    const { data, error } = await this.supabase
      .from('profession_skill_requirements')
      .select(`
        *,
        profession:professions(*),
        region:regions(*),
        skill:digital_skills(
          *,
          category:digital_skill_categories(*)
        )
      `)
      .eq('profession_id', professionId)
      .eq('region_id', regionId)

    if (error) throw new Error(`Ошибка получения требований: ${error.message}`)
    return data || []
  }

  /**
   * Получить данные о зарплатах
   */
  async getSalaryData(professionId: string, regionId: string): Promise<RegionalSalaryData | null> {
    const { data, error } = await this.supabase
      .from('regional_salary_data')
      .select('*')
      .eq('profession_id', professionId)
      .eq('region_id', regionId)
      .order('collection_date', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Ошибка получения данных о зарплатах: ${error.message}`)
    }

    return data
  }

  // ========== РЕКОМЕНДАЦИИ ==========

  /**
   * Сгенерировать персональные рекомендации
   */
  async generateRecommendations(assessmentId: string): Promise<CareerRecommendations> {
    const assessment = await this.getAssessmentById(assessmentId)
    if (!assessment || !assessment.skill_scores) {
      throw new Error('Оценка не найдена или не завершена')
    }

    // Определяем приоритетные навыки для развития
    const prioritySkills = assessment.skill_scores
      .filter(score => score.gap_analysis && score.gap_analysis < -1)
      .sort((a, b) => (a.gap_analysis || 0) - (b.gap_analysis || 0))
      .slice(0, 5)
      .map(score => ({
        skill: score.skill!,
        current_level: score.self_assessment_level,
        target_level: score.market_required_level || 3,
        importance: score.improvement_priority as 'high' | 'medium' | 'low',
        salary_impact: 15 // примерное влияние на зарплату
      }))

    // Получаем рекомендуемые ресурсы
    const recommendedResources = await this.getRecommendedResources(prioritySkills.map(p => p.skill.id))

    // Формируем план действий
    const actionPlan = prioritySkills.map((skill, index) => ({
      step: index + 1,
      title: `Развитие навыка: ${skill.skill.name_ru}`,
      description: `Повысить уровень владения с ${skill.current_level} до ${skill.target_level}`,
      timeline: `${(skill.target_level - skill.current_level) * 2} недели`,
      resources: recommendedResources.filter(r => 
        r.resource.target_skills?.includes(skill.skill.id)
      ).slice(0, 2).map(r => r.resource),
      expected_outcome: `Увеличение конкурентоспособности на ${skill.salary_impact}%`
    }))

    return {
      priority_skills: prioritySkills,
      recommended_resources: recommendedResources,
      career_paths: [], // TODO: реализовать
      action_plan: actionPlan
    }
  }

  /**
   * Получить рекомендуемые образовательные ресурсы
   */
  async getRecommendedResources(skillIds: string[]): Promise<Array<{
    resource: LearningResource
    relevance_score: number
    expected_improvement: number
    roi_estimate: number
  }>> {
    const { data, error } = await this.supabase
      .from('learning_resources')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })

    if (error) throw new Error(`Ошибка получения ресурсов: ${error.message}`)

    return (data || [])
      .filter((resource: LearningResource) => 
        resource.target_skills?.some((skillId: string) => skillIds.includes(skillId))
      )
      .map((resource: LearningResource) => ({
        resource,
        relevance_score: 0.8, // TODO: рассчитать на основе соответствия навыков
        expected_improvement: 1.5, // TODO: рассчитать ожидаемое улучшение
        roi_estimate: resource.price_rub > 0 ? 300 : 500 // ROI в %
      }))
      .slice(0, 10)
  }
}

// Экспортируем единственный экземпляр сервиса
export const careerAssessmentService = new CareerAssessmentService()
