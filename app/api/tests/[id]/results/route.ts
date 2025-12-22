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

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  // Skip during build
  if (process.env['NEXT_PHASE'] === 'phase-production-build') {
    return NextResponse.json(
      { success: false, error: 'Results endpoint not available during build' },
      { status: 503 },
    )
  }

  try {
    const supabase = getSupabaseClient()
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const responseId = searchParams.get('responseId')

    if (!responseId) {
      return NextResponse.json({ success: false, error: 'Response ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('test_responses')
      .select('*')
      .eq('id', responseId)
      .eq('test_id', id)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get results error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    )
  }
}
