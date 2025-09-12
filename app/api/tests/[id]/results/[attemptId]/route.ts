import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET - получение результатов попытки прохождения теста
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const params = await context.params
    const testId = params.id
    const attemptId = params.attemptId

    // Получаем тест
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .select(`
        id,
        title_ru,
        description_ru,
        passing_score,
        category:test_categories(name_ru, color, icon)
      `)
      .eq('id', testId)
      .single()

    if (testError || !test) {
      return NextResponse.json({ success: false, error: 'Test not found' }, { status: 404 })
    }

    // Получаем попытку прохождения
    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from('test_attempts')
      .select('*')
      .eq('id', attemptId)
      .eq('test_id', testId)
      .single()

    if (attemptError || !attempt) {
      return NextResponse.json({ success: false, error: 'Attempt not found' }, { status: 404 })
    }

    // Получаем вопросы с ответами пользователя
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select(`
        id,
        question_text_ru,
        question_type,
        points,
        answer_options(id, option_text_ru, is_correct),
        user_answers!inner(
          answer_data,
          is_correct,
          points_earned
        )
      `)
      .eq('test_id', testId)
      .eq('user_answers.attempt_id', attemptId)
      .order('order_index')

    if (questionsError) {
      return NextResponse.json({ success: false, error: questionsError.message }, { status: 400 })
    }

    // Формируем результат
    const result = {
      test,
      attempt,
      questions: questions?.map(q => ({
        id: q.id,
        question_text_ru: q.question_text_ru,
        question_type: q.question_type,
        points: q.points,
        user_answer: q.user_answers[0]?.answer_data,
        correct_answer: q.answer_options?.filter(opt => opt.is_correct).map(opt => opt.id),
        is_correct: q.user_answers[0]?.is_correct,
        points_earned: q.user_answers[0]?.points_earned || 0,
        answer_options: q.answer_options || []
      })) || []
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
