import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { ApiResponse, TestResult } from '@/lib/types'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

export const dynamic = 'force-dynamic'

// POST /api/tests
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, data: null, error: 'Authorization header is required' },
        { status: 401 },
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Supabase admin client is not configured on the server',
        },
        { status: 500 },
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, data: null, error: 'Invalid or expired token' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { test_type, answers, raw_scores } = body || {}
    if (!test_type || !answers) {
      return NextResponse.json(
        { success: false, data: null, error: 'test_type and answers are required' },
        { status: 400 },
      )
    }

    const { error } = await supabaseAdmin.from('test_results').insert({
      user_id: user.id,
      test_type,
      answers,
      raw_scores: raw_scores || null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      logger.error('Failed to save test result', {
        error: error.message,
        userId: user.id,
        test_type,
      })
      return NextResponse.json(
        { success: false, data: null, error: 'Failed to save test result' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, data: null, error: null })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    logger.error('Error in POST /api/tests:', { error: errorMessage })
    return NextResponse.json({ success: false, data: null, error: errorMessage }, { status: 500 })
  }
}

// GET /api/tests
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TestResult[]>>> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, data: null, error: 'Authorization header is required' },
        { status: 401 },
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Supabase admin client is not configured on the server',
        },
        { status: 500 },
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, data: null, error: 'Invalid or expired token' },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit') || '5')

    const { data, error } = await supabaseAdmin
      .from('test_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Failed to fetch test results', { error: error.message, userId: user.id })
      return NextResponse.json(
        { success: false, data: null, error: 'Failed to fetch test results' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, data, error: null })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    logger.error('Error in GET /api/tests:', { error: errorMessage })
    return NextResponse.json({ success: false, data: null, error: errorMessage }, { status: 500 })
  }
}
