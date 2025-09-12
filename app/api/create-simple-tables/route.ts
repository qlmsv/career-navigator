import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST() {
  try {
    const results = []
    
    // Создаем таблицы по одной, используя простые запросы
    const tables = [
      {
        name: 'test_categories',
        createQuery: () => supabaseAdmin
          .from('test_categories')
          .select('id')
          .limit(1)
      },
      {
        name: 'tests', 
        createQuery: () => supabaseAdmin
          .from('tests')
          .select('id')
          .limit(1)
      },
      {
        name: 'questions',
        createQuery: () => supabaseAdmin
          .from('questions')
          .select('id')
          .limit(1)
      },
      {
        name: 'answer_options',
        createQuery: () => supabaseAdmin
          .from('answer_options')
          .select('id')
          .limit(1)
      },
      {
        name: 'test_attempts',
        createQuery: () => supabaseAdmin
          .from('test_attempts')
          .select('id')
          .limit(1)
      },
      {
        name: 'user_answers',
        createQuery: () => supabaseAdmin
          .from('user_answers')
          .select('id')
          .limit(1)
      }
    ]
    
    for (const table of tables) {
      try {
        const { data, error } = await table.createQuery()
        
        if (error) {
          results.push({ 
            table: table.name, 
            success: false, 
            error: error.message,
            exists: false
          })
        } else {
          results.push({ 
            table: table.name, 
            success: true, 
            exists: true,
            message: 'Table exists'
          })
        }
      } catch (err) {
        results.push({ 
          table: table.name, 
          success: false, 
          error: err instanceof Error ? err.message : 'Unknown error',
          exists: false
        })
      }
    }
    
    const existingTables = results.filter(r => r.exists).length
    const totalTables = tables.length
    
    return NextResponse.json({
      success: true,
      message: `Found ${existingTables} out of ${totalTables} tables`,
      results,
      summary: {
        total: totalTables,
        existing: existingTables,
        missing: totalTables - existingTables
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
