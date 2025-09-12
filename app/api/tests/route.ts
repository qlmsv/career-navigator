import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET - получение списка тестов
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const public_only = searchParams.get('public_only') === 'true'

    let query = supabaseAdmin
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
      query = query.eq('is_public', true).eq('status', 'published')
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
    const safeTitle = (test?.title ?? test?.title_ru ?? 'Без названия') as string
    const safeTitleRu = (test?.title_ru ?? test?.title ?? 'Без названия') as string
    const authorId = (test?.author_id ?? '00000000-0000-0000-0000-000000000000') as string

    const insertTest = {
      title: safeTitle,
      title_ru: safeTitleRu,
      description: test?.description ?? test?.description_ru ?? null,
      description_ru: test?.description_ru ?? test?.description ?? null,
      category_id: test?.category_id ?? null,
      author_id: authorId,
      time_limit_minutes: test?.time_limit_minutes ?? null,
      passing_score: test?.passing_score ?? 70,
      max_attempts: test?.max_attempts ?? 3,
      shuffle_questions: Boolean(test?.shuffle_questions),
      shuffle_answers: Boolean(test?.shuffle_answers),
      status: (test?.status ?? 'published') as string,
      is_public: test?.is_public ?? true,
      requires_auth: test?.requires_auth ?? true,
      total_questions: questions.length,
    }

    const { data: newTest, error: testError } = await supabaseAdmin
      .from('tests')
      .insert(insertTest)
      .select()
      .single()

    if (testError) {
      return NextResponse.json({ success: false, error: testError.message }, { status: 400 })
    }

    // Создаем вопросы
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const { data: savedQuestion, error: questionError } = await supabaseAdmin
        .from('questions')
        .insert({
          test_id: newTest.id,
          question_text: (question.question_text ?? question.question_text_ru ?? 'Вопрос') as string,
          question_text_ru: (question.question_text_ru ?? question.question_text ?? 'Вопрос') as string,
          question_type: (question.question_type ?? 'multiple_choice') as string,
          points: question.points ?? 1,
          required: question.required ?? true,
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
          const { error: optionError } = await supabaseAdmin
            .from('answer_options')
            .insert({
              question_id: savedQuestion.id,
              option_text: (option.option_text ?? option.option_text_ru ?? 'Вариант') as string,
              option_text_ru: (option.option_text_ru ?? option.option_text ?? 'Вариант') as string,
              is_correct: Boolean(option.is_correct),
              points: option.points ?? 0,
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
