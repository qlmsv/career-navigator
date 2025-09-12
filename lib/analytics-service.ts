import { supabase } from '@/lib/supabase-browser'
import { logger } from '@/lib/logger'

export interface AnalyticsEvent {
  id: string
  user_id: string
  event_type: string
  event_data: Record<string, any>
  timestamp: string
  session_id: string
}

export interface UserInsights {
  totalTests: number
  averageScore: number
  improvementRate: number
  favoriteArchetype: string
  testFrequency: number
  completionRate: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export interface TestComparison {
  previousTest: any
  currentTest: any
  improvements: Record<string, number>
  changes: Record<string, string>
}

class AnalyticsService {
  private supabaseClient = supabase

  // Track user events
  async trackEvent(
    userId: string,
    eventType: string,
    eventData: Record<string, any> = {}
  ): Promise<void> {
    try {
      const sessionId = this.generateSessionId()
      
      const event: AnalyticsEvent = {
        id: crypto.randomUUID(),
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        timestamp: new Date().toISOString(),
        session_id: sessionId
      }

      const { error } = await this.supabaseClient
        .from('analytics_events')
        .insert(event)

      if (error) throw error

      logger.info('Analytics event tracked:', { eventType, userId })
    } catch (error) {
      logger.error('Failed to track analytics event:', error)
    }
  }

  // Track test completion
  async trackTestCompletion(
    userId: string,
    testResult: any,
    duration: number
  ): Promise<void> {
    await this.trackEvent(userId, 'test_completed', {
      testType: 'personality',
      score: testResult.big_five_scores,
      archetype: testResult.dominant_archetype,
      duration,
      questionsAnswered: Object.keys(testResult.all_answers).length
    })
  }

  // Track user progress
  async trackUserProgress(
    userId: string,
    action: string,
    data: Record<string, any> = {}
  ): Promise<void> {
    await this.trackEvent(userId, 'user_progress', {
      action,
      ...data
    })
  }

  // Generate user insights
  async generateUserInsights(userId: string): Promise<UserInsights> {
    try {
      // Get user's test history
      const { data: testResults, error } = await this.supabaseClient
        .from('test_results')
        .select('*')
        .eq('user_id', userId)
        .order('test_date', { ascending: false })

      if (error) throw error

      if (!testResults || testResults.length === 0) {
        return this.getDefaultInsights()
      }

      const totalTests = testResults.length
      const averageScore = this.calculateAverageScore(testResults)
      const improvementRate = this.calculateImprovementRate(testResults)
      const favoriteArchetype = this.getFavoriteArchetype(testResults)
      const testFrequency = this.calculateTestFrequency(testResults)
      const completionRate = this.calculateCompletionRate(testResults)
      const strengths = this.identifyStrengths(testResults)
      const weaknesses = this.identifyWeaknesses(testResults)
      const recommendations = this.generateRecommendations(testResults)

      return {
        totalTests,
        averageScore,
        improvementRate,
        favoriteArchetype,
        testFrequency,
        completionRate,
        strengths,
        weaknesses,
        recommendations
      }
    } catch (error) {
      logger.error('Failed to generate user insights:', error)
      return this.getDefaultInsights()
    }
  }

  // Compare test results
  async compareTestResults(userId: string): Promise<TestComparison | null> {
    try {
      const { data: testResults, error } = await this.supabaseClient
        .from('test_results')
        .select('*')
        .eq('user_id', userId)
        .order('test_date', { ascending: false })
        .limit(2)

      if (error) throw error

      if (!testResults || testResults.length < 2) {
        return null
      }

      const currentTest = testResults[0]
      const previousTest = testResults[1]

      const improvements = this.calculateImprovements(previousTest, currentTest)
      const changes = this.identifyChanges(previousTest, currentTest)

      return {
        previousTest,
        currentTest,
        improvements,
        changes
      }
    } catch (error) {
      logger.error('Failed to compare test results:', error)
      return null
    }
  }

  // Private helper methods
  private generateSessionId(): string {
    return crypto.randomUUID()
  }

  private calculateAverageScore(testResults: any[]): number {
    const scores = testResults.flatMap(test => 
      Object.values(test.big_five_scores)
    ) as number[]
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
  }

  private calculateImprovementRate(testResults: any[]): number {
    if (testResults.length < 2) return 0

    const recent = testResults[0]
    const older = testResults[testResults.length - 1]

    const recentAvg = this.calculateAverageScore([recent])
    const olderAvg = this.calculateAverageScore([older])

    return Math.round(((recentAvg - olderAvg) / olderAvg) * 100)
  }

  private getFavoriteArchetype(testResults: any[]): string {
    const archetypes = testResults.map(test => test.dominant_archetype)
    const counts = archetypes.reduce((acc, archetype) => {
      acc[archetype] = (acc[archetype] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(counts).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'sage'
  }

  private calculateTestFrequency(testResults: any[]): number {
    if (testResults.length < 2) return 0

    const firstTest = new Date(testResults[testResults.length - 1].test_date)
    const lastTest = new Date(testResults[0].test_date)
    const daysDiff = (lastTest.getTime() - firstTest.getTime()) / (1000 * 60 * 60 * 24)

    return Math.round(testResults.length / (daysDiff / 30)) // tests per month
  }

  private calculateCompletionRate(testResults: any[]): number {
    // Assuming all saved tests are completed
    return 100
  }

  private identifyStrengths(testResults: any[]): string[] {
    const latestTest = testResults[0]
    const scores = latestTest.big_five_scores as Record<string, number>

    const strengths = Object.entries(scores)
      .filter(([, score]) => score > 70)
      .map(([trait]) => trait)

    return strengths.length > 0 ? strengths : ['Адаптивность', 'Готовность к развитию']
  }

  private identifyWeaknesses(testResults: any[]): string[] {
    const latestTest = testResults[0]
    const scores = latestTest.big_five_scores as Record<string, number>

    const weaknesses = Object.entries(scores)
      .filter(([, score]) => score < 30)
      .map(([trait]) => trait)

    return weaknesses.length > 0 ? weaknesses : ['Нужно больше тестов для анализа']
  }

  private generateRecommendations(testResults: any[]): string[] {
    const recommendations = []

    if (testResults.length < 3) {
      recommendations.push('Пройти больше тестов для точного анализа')
    }

    const improvementRate = this.calculateImprovementRate(testResults)
    if (improvementRate < 0) {
      recommendations.push('Сосредоточиться на развитии слабых сторон')
    }

    const testFrequency = this.calculateTestFrequency(testResults)
    if (testFrequency < 1) {
      recommendations.push('Регулярно проходить тесты для отслеживания прогресса')
    }

    return recommendations.length > 0 ? recommendations : ['Продолжать развиваться в выбранном направлении']
  }

  private calculateImprovements(previousTest: any, currentTest: any): Record<string, number> {
    const improvements: Record<string, number> = {}

    Object.keys(currentTest.big_five_scores).forEach(trait => {
      const current = currentTest.big_five_scores[trait] as number
      const previous = previousTest.big_five_scores[trait] as number
      improvements[trait] = Math.round(current - previous)
    })

    return improvements
  }

  private identifyChanges(previousTest: any, currentTest: any): Record<string, string> {
    const changes: Record<string, string> = {}

    if (previousTest.dominant_archetype !== currentTest.dominant_archetype) {
      changes['archetype'] = `Изменение с ${previousTest.dominant_archetype} на ${currentTest.dominant_archetype}`
    }

    return changes
  }

  private getDefaultInsights(): UserInsights {
    return {
      totalTests: 0,
      averageScore: 50,
      improvementRate: 0,
      favoriteArchetype: 'sage',
      testFrequency: 0,
      completionRate: 0,
      strengths: ['Потенциал роста'],
      weaknesses: ['Нужно пройти первый тест'],
      recommendations: ['Начать с прохождения психометрического теста']
    }
  }
}

export const analyticsService = new AnalyticsService()
