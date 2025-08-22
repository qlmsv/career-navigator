import { createClient } from '@/lib/supabase/client'

export interface TestResult {
  id: string
  user_id: string
  test_date: string
  big_five_scores: any
  dominant_archetype: string
  all_answers: any[]
  ai_analysis: any
  analysis_time: number
  created_at: string
}

export interface TestProgress {
  id: string
  user_id: string
  current_question_index: number
  answers: any[]
  is_completed: boolean
  started_at: string
  updated_at: string
}

export class TestService {
  private supabase = createClient()

  // Сохранение прогресса теста
  async saveProgress(userId: string, currentQuestionIndex: number, answers: any[]): Promise<void> {
    try {
      console.log('TestService: Saving progress:', {
        userId,
        currentQuestionIndex,
        answersCount: answers.length
      })

      const { error } = await this.supabase
        .from('test_progress')
        .upsert({
          user_id: userId,
          current_question_index: currentQuestionIndex,
          answers: answers,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('TestService: Supabase error saving progress:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log('TestService: Progress saved successfully')
    } catch (error) {
      console.error('TestService: Failed to save progress:', error)
      throw error
    }
  }

  // Проверка есть ли завершенные результаты теста
  async hasCompletedResults(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('test_results')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (error) {
        console.error('TestService: Error checking completed results:', error)
        return false
      }

      return data && data.length > 0
    } catch (error) {
      console.error('TestService: Failed to check completed results:', error)
      return false
    }
  }

  // Загрузка прогресса теста
  async loadProgress(userId: string): Promise<TestProgress | null> {
    try {
      console.log('TestService: Loading progress for user:', userId)
      
      const { data, error } = await this.supabase
        .from('test_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

      console.log('TestService: Supabase response:', { data, error })

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('TestService: Supabase error loading progress:', {
          error,
          code: error.code,
          message: error.message
        })
        throw error
      }

      if (data) {
        console.log('TestService: Progress loaded successfully:', data)
      } else {
        console.log('TestService: No progress found for user')
      }

      return data
    } catch (error) {
      console.error('TestService: Failed to load progress:', error)
      return null
    }
  }

  // Сохранение результатов теста
  async saveResults(
    userId: string,
    bigFiveScores: any,
    dominantArchetype: string,
    allAnswers: any[],
    aiAnalysis: any,
    analysisTime: number
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('test_results')
        .insert({
          user_id: userId,
          big_five_scores: bigFiveScores,
          dominant_archetype: dominantArchetype,
          all_answers: allAnswers,
          ai_analysis: aiAnalysis,
          analysis_time: analysisTime
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error saving test results:', error)
        throw error
      }

      // Помечаем прогресс как завершенный
      await this.supabase
        .from('test_progress')
        .update({ 
          is_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      return data.id
    } catch (error) {
      console.error('Failed to save test results:', error)
      throw error
    }
  }

  // Загрузка истории результатов тестов
  async loadTestHistory(userId: string): Promise<TestResult[]> {
    try {
      const { data, error } = await this.supabase
        .from('test_results')
        .select('*')
        .eq('user_id', userId)
        .order('test_date', { ascending: false })

      if (error) {
        console.error('Error loading test history:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Failed to load test history:', error)
      return []
    }
  }

  // Загрузка конкретного результата теста
  async loadTestResult(resultId: string): Promise<TestResult | null> {
    try {
      const { data, error } = await this.supabase
        .from('test_results')
        .select('*')
        .eq('id', resultId)
        .single()

      if (error) {
        console.error('Error loading test result:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to load test result:', error)
      return null
    }
  }

  // Создание новой записи прогресса
  async createProgress(userId: string): Promise<void> {
    try {
      console.log('TestService: Creating new progress for user:', userId)
      
      const { error } = await this.supabase
        .from('test_progress')
        .insert({
          user_id: userId,
          current_question_index: 0,
          answers: [],
          is_completed: false
        })

      if (error) {
        console.error('TestService: Error creating progress:', error)
        throw error
      }

      console.log('TestService: Progress created successfully')
    } catch (error) {
      console.error('TestService: Failed to create progress:', error)
      throw error
    }
  }

  // Очистка прогресса теста
  async clearProgress(userId: string): Promise<void> {
    try {
      console.log('TestService: Clearing progress for user:', userId)
      
      const { error } = await this.supabase
        .from('test_progress')
        .update({ 
          current_question_index: 0,
          answers: [],
          is_completed: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        console.error('TestService: Error clearing progress:', error)
        throw error
      }

      console.log('TestService: Progress cleared successfully')
    } catch (error) {
      console.error('TestService: Failed to clear progress:', error)
      throw error
    }
  }
}

export const testService = new TestService()
