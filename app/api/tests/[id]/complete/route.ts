import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST - завершение теста и расчет результатов
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const testId = params.id
    const body = await request.json()
    const { answers, timeSpent } = body

    // Получаем тест
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single()

    if (testError || !test) {
      return NextResponse.json({ success: false, error: 'Test not found' }, { status: 404 })
    }

    // Получаем вопросы с правильными ответами
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select(`
        id,
        points,
        answer_options(id, is_correct, points)
      `)
      .eq('test_id', testId)

    if (questionsError) {
      return NextResponse.json({ success: false, error: questionsError.message }, { status: 400 })
    }

    // Рассчитываем результаты
    let totalScore = 0
    let maxPossibleScore = 0
    const questionResults = []

    for (const question of questions || []) {
      const userAnswer = answers[question.id]
      const correctOptions = question.answer_options?.filter(opt => opt.is_correct) || []
      const maxPoints = question.points
      maxPossibleScore += maxPoints

      let isCorrect = false
      let earnedPoints = 0

      if (userAnswer !== undefined && userAnswer !== null) {
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

    // Создаем попытку прохождения
    const { data: attempt, error: attemptError } = await supabaseAdmin
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

    return NextResponse.json({ 
      success: true, 
      data: {
        attempt_id: attempt.id,
        score: totalScore,
        max_possible_score: maxPossibleScore,
        percentage: percentage,
        passed: passed
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
