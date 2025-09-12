import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// Временный роут для обновления статуса тестов
export async function POST() {
  try {
    // Обновляем все тесты со статусом 'draft' на 'published'
    const { data, error } = await supabaseAdmin
      .from('tests')
      .update({ status: 'published' })
      .eq('status', 'draft')
      .eq('is_public', true)
      .select()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${data?.length || 0} tests to published status`,
      data 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
