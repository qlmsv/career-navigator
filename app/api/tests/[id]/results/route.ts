import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const responseId = searchParams.get('responseId')

    if (!responseId) {
      return NextResponse.json(
        { success: false, error: 'Response ID required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('test_responses')
      .select('*')
      .eq('id', responseId)
      .eq('test_id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get results error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
