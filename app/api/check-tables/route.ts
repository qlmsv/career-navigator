import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Проверяем существование таблицы tests
    const { data: testsTable, error: testsError } = await supabase
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
    const { data: categoriesTable, error: categoriesError } = await supabase
      .from('test_categories')
      .select('id')
      .limit(1)
    
    const { data: questionsTable, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .limit(1)
    
    const { data: optionsTable, error: optionsError } = await supabase
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
      },
      errors: {
        tests: testsError?.message,
        categories: categoriesError?.message,
        questions: questionsError?.message,
        options: optionsError?.message,
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
