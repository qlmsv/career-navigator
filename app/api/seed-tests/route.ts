import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a function to get the Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured')
  }

  return createClient(supabaseUrl, supabaseKey)
}

export const dynamic = 'force-dynamic' // Prevent static generation

export async function POST() {
  // Skip during build
  if (process.env['NEXT_PHASE'] === 'phase-production-build') {
    return NextResponse.json(
      { success: false, error: 'Seed endpoint not available during build' },
      { status: 503 },
    )
  }

  try {
    const supabase = getSupabaseClient()
    // ... rest of your existing code ...

    // Replace all instances of supabaseAdmin with the new supabase client
    await supabase.from('tests').delete().eq('title', 'Big Five - Тест личности')
    await supabase.from('tests').delete().eq('title', 'HEXACO - Личностный опросник')

    const { data: big5, error: big5Error } = await supabase
      .from('tests')
      .insert({
        title: 'Big Five - Тест личности',
        description: 'Полноценный опросник Большой Пятерки (50 утверждений). Оцените по шкале от 1 до 5.',
        formily_schema: big5Schema,
        status: 'published',
        show_results: true,
        allow_multiple_attempts: true,
        time_limit_minutes: 20,
      })
      .select()
      .single()

    // ... rest of your existing code ...
  } catch (error) {
    console.error('Seed tests error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}