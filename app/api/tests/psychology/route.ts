import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

interface PsychologyQuestion {
  question_text_ru: string
  question_type: 'rating_scale' | 'matrix_rating'
  factor_id?: string
  rating_scale_id?: string
  scale_min: number
  scale_max: number
  scale_labels: { [key: string]: string }
  points: number
  weight: number
  is_reverse: boolean
  required: boolean
  order_index: number
  explanation_ru?: string
  difficulty_level: 'easy' | 'medium' | 'hard'
}

interface PsychologyTestData {
  title: string
  title_ru: string
  description: string
  description_ru: string
  category_id?: string
  time_limit_minutes?: number
  passing_score: number
  max_attempts: number
  shuffle_questions: boolean
  shuffle_answers: boolean
  is_public: boolean
  requires_auth: boolean
  instructions?: string
  instructions_ru?: string
  questions: PsychologyQuestion[]
}

// POST - создать психологический тест
export async function POST(request: NextRequest) {
  try {
    const body: PsychologyTestData = await request.json()
    const { questions, ...testData } = body

    if (!testData.title_ru?.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title is required' 
      }, { status: 400 })
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'At least one question is required' 
      }, { status: 400 })
    }

    // Создаем тест
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .insert({
        ...testData,
        total_questions: questions.length,
        status: 'draft'
      })
      .select()
      .single()

    if (testError) {
      return NextResponse.json({ 
        success: false, 
        error: testError.message 
      }, { status: 400 })
    }

    // Создаем вопросы с улучшенной логикой
    const questionsToInsert = questions.map((q, index) => ({
      test_id: test.id,
      question_text: q.question_text_ru,
      question_text_ru: q.question_text_ru,
      question_type: q.question_type,
      factor_id: q.factor_id || null,
      rating_scale_id: q.rating_scale_id || null,
      scale_min: q.scale_min,
      scale_max: q.scale_max,
      scale_labels: q.scale_labels,
      points: q.points,
      weight: q.weight,
      is_reverse: q.is_reverse,
      required: q.required,
      order_index: q.order_index || index,
      explanation_ru: q.explanation_ru || '',
      difficulty_level: q.difficulty_level,
      // Дополнительные поля для психологических тестов
      slider_min: q.scale_min,
      slider_max: q.scale_max,
      slider_step: 1
    }))

    const { error: questionsError } = await supabaseAdmin
      .from('questions')
      .insert(questionsToInsert)

    if (questionsError) {
      // Удаляем созданный тест при ошибке
      await supabaseAdmin
        .from('tests')
        .delete()
        .eq('id', test.id)
      
      return NextResponse.json({ 
        success: false, 
        error: questionsError.message 
      }, { status: 400 })
    }

    // Получаем созданный тест с вопросами
    const { data: createdTest, error: fetchError } = await supabaseAdmin
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
          explanation_ru,
          difficulty_level
        )
      `)
      .eq('id', test.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ 
        success: false, 
        error: fetchError.message 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      data: createdTest 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// GET - получить психологические тесты
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
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
          explanation_ru,
          difficulty_level
        )
      `)
      .eq('test_type', 'psychology')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
