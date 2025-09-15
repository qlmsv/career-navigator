import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET - получить все факторы личности
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('personality_factors')
      .select('*')
      .order('order_index')

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

// POST - создать новый фактор личности
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, display_name, description, order_index } = body

    if (!name || !display_name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and display_name are required' 
      }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('personality_factors')
      .insert({
        name,
        display_name,
        description: description || '',
        order_index: order_index || 0
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
