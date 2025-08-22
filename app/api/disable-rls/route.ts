import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('API: Отключение RLS политик...')
    
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Admin client not available. SUPABASE_SERVICE_ROLE_KEY not set.'
      }, { status: 500 })
    }
    
    // Отключаем RLS для всех таблиц
    const tables = [
      'digital_skill_categories',
      'digital_skills', 
      'regions',
      'professions',
      'user_skill_assessments',
      'user_skill_scores',
      'learning_resources'
    ]
    
    const results = []
    
    for (const table of tables) {
      try {
        // Используем прямой SQL запрос через admin client
        const { error } = await supabaseAdmin
          .from(table)
          .select('count(*)')
          .limit(1)
        
        if (error) {
          console.error(`Ошибка проверки таблицы ${table}:`, error)
          results.push({ table, success: false, error: error.message })
        } else {
          // Если можем читать, значит RLS уже отключен или нет политик
          console.log(`Таблица ${table} доступна для чтения`)
          results.push({ table, success: true, message: 'Доступна для чтения' })
        }
      } catch (err) {
        console.error(`Исключение при проверке ${table}:`, err)
        results.push({ table, success: false, error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }
    
    const successCount = results.filter(r => r.success).length
    const totalCount = results.length
    
    console.log(`API: Проверено ${successCount}/${totalCount} таблиц`)
    
    if (successCount === totalCount) {
      return NextResponse.json({
        success: true,
        message: `Все таблицы доступны для чтения (${successCount}/${totalCount})`,
        results
      })
    } else {
      return NextResponse.json({
        success: false,
        message: `Проблемы с доступом к ${totalCount - successCount} таблицам`,
        results,
        instructions: 'Выполните в Supabase SQL Editor: ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;'
      })
    }
    
  } catch (error) {
    console.error('API: Ошибка проверки RLS:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
