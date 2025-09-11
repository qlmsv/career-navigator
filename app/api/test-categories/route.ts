import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
)

// GET - получение списка категорий тестов
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('test_categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index')

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// POST - создание новой категории
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, name_ru, description, icon, color } = body

    const { data, error } = await supabase
      .from('test_categories')
      .insert({
        name,
        name_ru,
        description,
        icon,
        color
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
