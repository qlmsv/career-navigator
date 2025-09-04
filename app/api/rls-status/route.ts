import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    console.log('API: Проверка статуса RLS...')

    const supabase = createClient()

    const tables = [
      'digital_skill_categories',
      'digital_skills',
      'regions',
      'professions',
      'profession_skill_requirements',
      'regional_salary_data',
      'user_skill_assessments',
      'user_skill_scores',
      'learning_resources',
      'user_recommendations'
    ]

    const results = []

    for (const table of tables) {
      try {
        // Попытка выполнить запрос с текущими правами пользователя
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1)
          .single()

        if (error) {
          // Если есть ошибка, это может быть из-за RLS или отсутствия данных
          if (error.code === 'PGRST116') { // No rows returned
            results.push({ table, status: 'RLS Enabled (No Data)', message: 'Политики RLS включены, но данных нет или они не доступны текущему пользователю.' })
          } else if (error.message.includes('permission denied') || error.message.includes('policy')) {
            results.push({ table, status: 'RLS Blocking', message: `Политики RLS блокируют доступ: ${error.message}` })
          } else {
            results.push({ table, status: 'Error', message: `Ошибка при доступе к таблице: ${error.message}` })
          }
        } else {
          results.push({ table, status: 'RLS Enabled (Access Granted)', message: 'Политики RLS включены, доступ разрешен.' })
        }
      } catch (err) {
        console.error(`Исключение при проверке ${table}:`, err)
        results.push({ table, status: 'Error', message: err instanceof Error ? err.message : 'Неизвестная ошибка' })
      }
    }

    const rlsBlockingTables = results.filter(r => r.status === 'RLS Blocking')

    if (rlsBlockingTables.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Обнаружены проблемы с RLS в ${rlsBlockingTables.length} таблицах.`,
        results,
        instructions: 'Убедитесь, что политики RLS правильно настроены в Supabase для публичного чтения справочных данных и доступа пользователя к своим данным.'
      }, { status: 200 })
    } else {
      return NextResponse.json({
        success: true,
        message: 'RLS политики настроены корректно или не блокируют доступ.',
        results
      }, { status: 200 })
    }

  } catch (error) {
    console.error('API: Ошибка проверки RLS:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 })
  }
}
