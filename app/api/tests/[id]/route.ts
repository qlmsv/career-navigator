import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
)

// GET - получение теста с вопросами и ответами
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const testId = params.id

    // Получаем тест
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select(`
        *,
        category:test_categories(name_ru, color, icon)
      `)
      .eq('id', testId)
      .eq('status', 'published')
      .eq('is_public', true)
      .single()

    if (testError || !test) {
      return NextResponse.json({ success: false, error: 'Test not found' }, { status: 404 })
    }

    // Получаем вопросы
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        *,
        answer_options(*)
      `)
      .eq('test_id', testId)
      .order('order_index')

    if (questionsError) {
      return NextResponse.json({ success: false, error: questionsError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...test,
        questions: questions || []
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
