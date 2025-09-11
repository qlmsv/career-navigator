import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - получение списка тестов
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const public_only = searchParams.get('public_only') === 'true'

    let query = supabase
      .from('tests')
      .select(`
        *,
        category:test_categories(name_ru, color, icon)
      `)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category_id', category)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (public_only) {
      query = query.eq('is_public', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// POST - создание нового теста
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { test, questions } = body

    // Создаем тест
    const { data: newTest, error: testError } = await supabase
      .from('tests')
      .insert({
        ...test,
        total_questions: questions.length
      })
      .select()
      .single()

    if (testError) {
      return NextResponse.json({ success: false, error: testError.message }, { status: 400 })
    }

    // Создаем вопросы
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const { data: savedQuestion, error: questionError } = await supabase
        .from('questions')
        .insert({
          test_id: newTest.id,
          question_text: question.question_text_ru,
          question_text_ru: question.question_text_ru,
          question_type: question.question_type,
          points: question.points,
          required: question.required,
          order_index: i
        })
        .select()
        .single()

      if (questionError) {
        return NextResponse.json({ success: false, error: questionError.message }, { status: 400 })
      }

      // Создаем варианты ответов
      if (question.answer_options && question.answer_options.length > 0) {
        for (let j = 0; j < question.answer_options.length; j++) {
          const option = question.answer_options[j]
          const { error: optionError } = await supabase
            .from('answer_options')
            .insert({
              question_id: savedQuestion.id,
              option_text: option.option_text_ru,
              option_text_ru: option.option_text_ru,
              is_correct: option.is_correct,
              points: option.points,
              order_index: j
            })

          if (optionError) {
            return NextResponse.json({ success: false, error: optionError.message }, { status: 400 })
          }
        }
      }
    }

    return NextResponse.json({ success: true, data: newTest })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
