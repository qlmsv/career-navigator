import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/database-status
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Supabase admin client is not configured'
      }, { status: 500 })
    }

    const supabase = supabaseAdmin
    
    const status = {
      tables_exist: false,
      tables_status: {} as Record<string, boolean>,
      data_counts: {} as Record<string, number>,
      error: null as string | null
    }

    // Проверяем существование основных таблиц
    const tablesToCheck = [
      'digital_skill_categories',
      'digital_skills', 
      'regions',
      'professions',
      'user_skill_assessments'
    ]

    let allTablesExist = true

    for (const tableName of tablesToCheck) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })

        if (error) {
          status.tables_status[tableName] = false
          allTablesExist = false
          if (!status.error) {
            status.error = `Таблица ${tableName} не найдена`
          }
        } else {
          status.tables_status[tableName] = true
          status.data_counts[tableName] = count || 0
        }
      } catch (err) {
        status.tables_status[tableName] = false
        allTablesExist = false
      }
    }

    status.tables_exist = allTablesExist

    return NextResponse.json({
      success: true,
      data: status,
      error: null
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
    
    return NextResponse.json({
      success: false,
      data: null,
      error: errorMessage
    }, { status: 500 })
  }
}
