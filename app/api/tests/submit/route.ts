'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createTestService } from '@/lib/services/test-service'
import { SubmitTestData } from '@/lib/types/test-system'

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    const body: SubmitTestData = await request.json()

    if (!body.test_id || !body.answers || typeof body.answers !== 'object') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid payload: test_id and answers are required' 
      }, { status: 400 })
    }

    const testService = createTestService(supabaseAdmin)
    const result = await testService.submitTest(body)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    // Return results for client-side storage (no database save for anonymous users)
    return NextResponse.json({ 
      success: true, 
      attempt_id: result.data?.id,
      percentage: result.data?.percentage,
      score: result.data?.score,
      max_possible_score: result.data?.score, // This should be calculated differently
      passed: result.data?.passed,
      timestamp: Date.now(),
      data: result.data
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}


