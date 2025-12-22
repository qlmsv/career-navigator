import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { CreateTestInput } from '@/lib/types'

function getSupabaseClient() {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured')
  }

  return createClient(supabaseUrl, supabaseKey)
}

export const dynamic = 'force-dynamic'

function isBuildPhase() {
  return process.env['NEXT_PHASE'] === 'phase-production-build'
}

// GET - получить список тестов
export async function GET(request: Request) {
  if (isBuildPhase()) {
    return NextResponse.json(
      { success: false, error: 'Tests endpoint not available during build' },
      { status: 503 },
    )
  }

  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase.from('tests').select('*').order('created_at', { ascending: false })

    // Фильтр по статусу
    if (status && status !== 'all') {
      // Если указан конкретный статус, фильтруем
      query = query.eq('status', status)
    } else if (!status) {
      // По умолчанию показываем только опубликованные для обычных пользователей
      query = query.eq('status', 'published')
    }
    // Если status='all' - не применяем фильтр, показываем все

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get tests error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - создать новый тест (только для админов)
export async function POST(request: Request) {
  if (isBuildPhase()) {
    return NextResponse.json(
      { success: false, error: 'Tests endpoint not available during build' },
      { status: 503 },
    )
  }

  try {
    const supabase = getSupabaseClient()
    const input: CreateTestInput = await request.json()

    if (!input.title || !input.formily_schema) {
      return NextResponse.json(
        { success: false, error: 'Title and formily_schema required' },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from('tests')
      .insert({
        title: input.title,
        description: input.description,
        formily_schema: input.formily_schema,
        show_results: input.show_results ?? true,
        allow_multiple_attempts: input.allow_multiple_attempts ?? true,
        time_limit_minutes: input.time_limit_minutes,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create test error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
