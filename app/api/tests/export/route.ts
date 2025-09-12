'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('test_id')
    if (!testId) return NextResponse.json({ error: 'test_id is required' }, { status: 400 })

    const { data: attempts, error: aErr } = await supabaseAdmin
      .from('test_attempts')
      .select('id,user_id,percentage,passed,score,max_possible_score,completed_at')
      .eq('test_id', testId)
      .order('completed_at', { ascending: false })
    if (aErr) throw new Error(aErr.message)

    const header = ['attempt_id','user_id','score','max_score','percentage','passed','completed_at']
    const rows = [header.join(',')]
    for (const a of attempts || []) {
      rows.push([
        a.id,
        a.user_id || '',
        a.score ?? 0,
        a.max_possible_score ?? 0,
        Math.round(a.percentage ?? 0),
        a.passed ? 'true' : 'false',
        a.completed_at || ''
      ].map(x => typeof x === 'string' && x.includes(',') ? `"${x.replace(/"/g, '""')}"` : String(x)).join(','))
    }
    const csv = rows.join('\n')
    return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="test_${testId}_results.csv"` } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


