'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }
    const body = await request.json()
    const testId: string = body.test_id
    const answers: Record<string, any> = body.answers || {}

    if (!testId || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Generate temporary attempt ID for anonymous users
    const attemptId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Load questions and options to score
    const { data: questions, error: qErr } = await supabaseAdmin
      .from('questions')
      .select('id,points,question_type')
      .eq('test_id', testId)
      .order('order_index')
    if (qErr) throw new Error(qErr.message)

    const { data: options, error: oErr } = await supabaseAdmin
      .from('answer_options')
      .select('id,question_id,is_correct,points')
      .in('question_id', (questions || []).map(q => q.id))
    if (oErr) throw new Error(oErr.message)

    // Score answers (very basic for text input: no correctness check)
    let total = 0
    let maxTotal = 0
    const userAnswerRows: any[] = []
    for (const q of questions || []) {
      const ans = answers[q.id]
      const qOptions = (options || []).filter(o => o.question_id === q.id)
      const maxPoints = q.points || 1
      maxTotal += maxPoints
      let earned = 0

      if (q.question_type === 'multiple_choice' || q.question_type === 'true_false') {
        const correct = qOptions.find(o => o.is_correct)
        if (correct && String(ans) === String(correct.id) || String(ans) === 'true' && correct?.is_correct) {
          earned = maxPoints
        }
      } else if (q.question_type === 'multiple_select') {
        const correctIds = new Set(qOptions.filter(o => o.is_correct).map(o => String(o.id)))
        const chosen = new Set(Array.isArray(ans) ? ans.map((x: any) => String(x)) : [])
        const intersection = [...chosen].filter(x => correctIds.has(x))
        if (correctIds.size > 0) {
          earned = Math.min(maxPoints, Math.round((intersection.length / correctIds.size) * maxPoints))
        }
      } else {
        // text/number/rating/file — no auto scoring
        earned = 0
      }

      total += earned
      userAnswerRows.push({
        attempt_id: attemptId,
        question_id: q.id,
        answer_data: ans ?? null,
        is_correct: earned === maxPoints ? true : earned > 0 ? null : false,
        points_earned: earned,
        max_points: maxPoints,
      })
    }

    const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0
    const passed = percentage >= 70

    // Return results for client-side storage (no database save for anonymous users)
    return NextResponse.json({ 
      success: true, 
      attempt_id: attemptId, 
      percentage,
      score: total,
      max_possible_score: maxTotal,
      passed,
      answers: userAnswerRows,
      timestamp: Date.now()
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


