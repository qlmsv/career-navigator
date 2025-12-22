import { NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

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

// GET - получить конкретный тест
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (isBuildPhase()) {
    return NextResponse.json(
      { success: false, error: 'Test endpoint not available during build' },
      { status: 503 },
    )
  }

  try {
    const supabase = getSupabaseClient()
    const { id } = await context.params

    const { data, error } = await supabase.from('tests').select('*').eq('id', id).single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get test error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - обновить тест
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (isBuildPhase()) {
    return NextResponse.json(
      { success: false, error: 'Test endpoint not available during build' },
      { status: 503 },
    )
  }

  try {
    const supabase = getSupabaseClient()
    const { id } = await context.params
    const updates = await request.json()

    const { data, error } = await supabase
      .from('tests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update test error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - удалить тест
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (isBuildPhase()) {
    return NextResponse.json(
      { success: false, error: 'Test endpoint not available during build' },
      { status: 503 },
    )
  }

  try {
    const supabase = getSupabaseClient()
    const { id } = await context.params

    const { error } = await supabase.from('tests').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete test error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
