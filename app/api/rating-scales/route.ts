import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET - получить все шкалы оценок
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('rating_scales')
      .select('*')
      .order('name')

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// POST - создать новую шкалу оценок
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, min_value, max_value, labels, description } = body

    if (!name || min_value === undefined || max_value === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name, min_value, and max_value are required' 
      }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('rating_scales')
      .insert({
        name,
        min_value,
        max_value,
        labels: labels || {},
        description: description || ''
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
