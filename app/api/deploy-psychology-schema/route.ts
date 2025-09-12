import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    // Читаем SQL файл с новой схемой
    const sqlPath = path.join(process.cwd(), 'database-universal-psychology.sql')
    const migrationSQL = fs.readFileSync(sqlPath, 'utf8')

    console.log('Начинаем развертывание схемы психологических тестов...')

    // Выполняем миграцию
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
      sql: migrationSQL 
    })

    if (error) {
      console.error('Ошибка выполнения миграции:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }

    console.log('Схема успешно развернута')

    // Проверяем, что таблицы созданы
    const tablesToCheck = [
      'test_types',
      'personality_factors', 
      'rating_scales',
      'result_interpretations',
      'normative_data'
    ]

    const checkResults = []
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(1)
        
        checkResults.push({
          table: tableName,
          exists: !error,
          error: error?.message || null
        })
      } catch (err) {
        checkResults.push({
          table: tableName,
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Схема психологических тестов успешно развернута',
      data: {
        migrationResult: data,
        tableChecks: checkResults
      }
    })

  } catch (error) {
    console.error('Ошибка развертывания схемы:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
