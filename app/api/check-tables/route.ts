import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    
    // Проверяем существование таблицы tests
    const { data: testsTable, error: testsError } = await supabaseAdmin
      .from('tests')
      .select('id')
      .limit(1)
    
    if (testsError) {
      return NextResponse.json({
        success: false,
        error: testsError.message,
        tables: {
          tests: false,
          test_categories: false,
          questions: false,
          answer_options: false,
        }
      })
    }
    
    // Проверяем другие таблицы
    const { data: categoriesTable, error: categoriesError } = await supabaseAdmin
      .from('test_categories')
      .select('id')
      .limit(1)
    
    const { data: questionsTable, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select('id')
      .limit(1)
    
    const { data: optionsTable, error: optionsError } = await supabaseAdmin
      .from('answer_options')
      .select('id')
      .limit(1)
    
    return NextResponse.json({
      success: true,
      tables: {
        tests: !testsError,
        test_categories: !categoriesError,
        questions: !questionsError,
        answer_options: !optionsError,
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tables: {
        tests: false,
        test_categories: false,
        questions: false,
        answer_options: false,
      }
    })
  }
}
