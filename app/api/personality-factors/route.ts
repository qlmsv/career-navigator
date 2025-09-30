import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createPsychologyTestService } from '@/lib/services/psychology-test-service'

// GET - получить все факторы личности
export async function GET() {
  try {
    const psychologyService = createPsychologyTestService(supabaseAdmin)
    const result = await psychologyService.getPersonalityFactors()

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

// POST - создать новый фактор личности
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const psychologyService = createPsychologyTestService(supabaseAdmin)
    const result = await psychologyService.createPersonalityFactor(body)

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