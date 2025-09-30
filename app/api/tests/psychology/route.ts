import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createPsychologyTestService } from '@/lib/services/psychology-test-service'
import { CreatePsychologyTestData } from '@/lib/types/test-system'

// POST - создать психологический тест
export async function POST(request: NextRequest) {
  try {
    const body: CreatePsychologyTestData = await request.json()

    const psychologyService = createPsychologyTestService(supabaseAdmin)
    const result = await psychologyService.createPsychologyTest(body)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json({ 
      ...result,
      message: 'Psychology test created successfully'
    })
  } catch (error) {
    console.error('Error creating psychology test:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// GET - получить психологические тесты
export async function GET() {
  try {
    const psychologyService = createPsychologyTestService(supabaseAdmin)
    
    // Get all tests (could be filtered by test_type if needed)
    const result = await psychologyService.getTests({
      // Add filters if needed
    })

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}