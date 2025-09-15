import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// Функция для генерации интерпретации результатов
function generatePsychologyInterpretation(factorScores: { [key: string]: number }, factors: any[]) {
  const interpretations: { [key: string]: any } = {}

  for (const [factorId, score] of Object.entries(factorScores)) {
    const factor = factors.find(f => f.id === factorId)
    if (!factor) continue

    let level = 'medium'
    if (score <= 40) {
      level = 'low'
    } else if (score >= 60) {
      level = 'high'
    }

    const descriptions = {
      low: factor.low_description || 'Низкий уровень',
      medium: factor.medium_description || 'Средний уровень', 
      high: factor.high_description || 'Высокий уровень'
    }

    interpretations[factorId] = {
      factor_name: factor.name,
      factor_display_name: factor.display_name,
      score: score,
      level: level,
      description: descriptions[level as keyof typeof descriptions]
    }
  }

  return interpretations
}

// POST - завершение психологического теста с улучшенной логикой
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const testId = params.id
    const body = await request.json()
    const { answers, timeSpent } = body

    // Получаем тест с вопросами и факторами
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .select(`
        *,
        questions(
          id,
          question_text_ru,
          question_type,
          factor_id,
          rating_scale_id,
          scale_min,
          scale_max,
          scale_labels,
          points,
          weight,
          is_reverse,
          required,
          order_index,
          personality_factors(
            id,
            name,
            display_name,
            low_description,
            medium_description,
            high_description
          )
        )
      `)
      .eq('id', testId)
      .single()

    if (testError || !test) {
      return NextResponse.json({ success: false, error: 'Test not found' }, { status: 404 })
    }

    // Рассчитываем результаты с учетом весов и обратных вопросов
    let totalScore = 0
    let maxPossibleScore = 0
    const questionResults = []
    const factorScores: { [key: string]: { score: number, maxScore: number, count: number, weight: number } } = {}

    for (const question of test.questions || []) {
      const userAnswer = answers[question.id]
      const maxPoints = question.points
      maxPossibleScore += maxPoints

      let isCorrect = false
      let earnedPoints = 0

      if (userAnswer !== undefined && userAnswer !== null) {
        if (question.question_type === 'rating_scale') {
          // Для психологических тестов со шкалой оценок
          const ratingValue = parseFloat(userAnswer)
          if (!isNaN(ratingValue)) {
            // Применяем обратную логику если нужно
            let adjustedValue = ratingValue
            if (question.is_reverse) {
              adjustedValue = question.scale_max - ratingValue + question.scale_min
            }

            // Применяем вес вопроса
            const weightedValue = adjustedValue * question.weight
            earnedPoints = maxPoints
            totalScore += earnedPoints
            isCorrect = true

            // Определяем фактор
            const factorId = question.factor_id || 'general'
            
            // Добавляем балл к фактору с учетом веса
            if (!factorScores[factorId]) {
              factorScores[factorId] = { 
                score: 0, 
                maxScore: 0, 
                count: 0, 
                weight: 0 
              }
            }
            
            const factorData = factorScores[factorId]!
            factorData.score += weightedValue
            factorData.maxScore += (question.scale_max * question.weight)
            factorData.count += 1
            factorData.weight += question.weight
          }
        } else {
          // Обычные тесты с вариантами ответов
          const correctOptions = question.answer_options?.filter(opt => opt.is_correct) || []
          
          if (Array.isArray(userAnswer)) {
            // Множественный выбор
            const correctIds = correctOptions.map(opt => opt.id)
            const userIds = userAnswer
            isCorrect = correctIds.length === userIds.length &&
                       correctIds.every(id => userIds.includes(id))
          } else {
            // Одиночный выбор
            isCorrect = correctOptions.some(opt => opt.id === userAnswer)
          }

          earnedPoints = isCorrect ? maxPoints : 0
          totalScore += earnedPoints
        }
      }

      questionResults.push({
        question_id: question.id,
        answer_data: userAnswer,
        is_correct: isCorrect,
        points_earned: earnedPoints,
        max_points: maxPoints
      })
    }

    const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0
    const passed = percentage >= test.passing_score

    // Рассчитываем средние баллы по факторам с нормализацией
    const factorAverages: { [key: string]: number } = {}
    const factors = test.questions
      ?.map(q => q.personality_factors)
      .filter(Boolean)
      .reduce((acc, factor) => {
        if (factor && !acc.find(f => f.id === factor.id)) {
          acc.push(factor)
        }
        return acc
      }, [] as any[]) || []

    for (const [factorId, data] of Object.entries(factorScores)) {
      if (data.count > 0) {
        // Нормализуем к 0-100 с учетом весов
        const normalizedScore = (data.score / data.maxScore) * 100
        factorAverages[factorId] = Math.round(normalizedScore)
      }
    }

    // Создаем попытку прохождения
    let attempt
    let attemptError
    
    // Пытаемся создать попытку с factor_scores
    const { data: attemptWithFactors, error: errorWithFactors } = await supabaseAdmin
      .from('test_attempts')
      .insert({
        test_id: testId,
        status: 'completed',
        score: totalScore,
        max_possible_score: maxPossibleScore,
        percentage: percentage,
        passed: passed,
        time_spent_seconds: timeSpent || 0,
        completed_at: new Date().toISOString(),
        factor_scores: factorAverages
      })
      .select()
      .single()
    
    if (errorWithFactors && errorWithFactors.message.includes('factor_scores')) {
      // Если колонка factor_scores не существует, создаем без неё
      const { data: attemptWithoutFactors, error: errorWithoutFactors } = await supabaseAdmin
        .from('test_attempts')
        .insert({
          test_id: testId,
          status: 'completed',
          score: totalScore,
          max_possible_score: maxPossibleScore,
          percentage: percentage,
          passed: passed,
          time_spent_seconds: timeSpent || 0,
          completed_at: new Date().toISOString()
        })
        .select()
        .single()
      
      attempt = attemptWithoutFactors
      attemptError = errorWithoutFactors
    } else {
      attempt = attemptWithFactors
      attemptError = errorWithFactors
    }

    if (attemptError) {
      return NextResponse.json({ success: false, error: attemptError.message }, { status: 400 })
    }

    // Сохраняем ответы пользователя
    for (const result of questionResults) {
      const { error: answerError } = await supabaseAdmin
        .from('user_answers')
        .insert({
          attempt_id: attempt.id,
          question_id: result.question_id,
          answer_data: result.answer_data,
          is_correct: result.is_correct,
          points_earned: result.points_earned,
          max_points: result.max_points
        })

      if (answerError) {
        console.error('Error saving answer:', answerError)
      }
    }

    // Обновляем статистику теста
    const { error: statsError } = await supabaseAdmin
      .from('tests')
      .update({
        total_attempts: test.total_attempts + 1,
        average_score: test.average_score
          ? (test.average_score * test.total_attempts + percentage) / (test.total_attempts + 1)
          : percentage
      })
      .eq('id', testId)

    if (statsError) {
      console.error('Error updating test stats:', statsError)
    }

    // Генерируем интерпретацию
    const interpretation = generatePsychologyInterpretation(factorAverages, factors)

    return NextResponse.json({
      success: true,
      data: {
        attempt_id: attempt.id,
        score: totalScore,
        max_possible_score: maxPossibleScore,
        percentage: percentage,
        passed: passed,
        factor_scores: factorAverages,
        interpretation: interpretation,
        factors_summary: factors.map(f => ({
          id: f.id,
          name: f.name,
          display_name: f.display_name,
          score: factorAverages[f.id] || 0
        }))
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
