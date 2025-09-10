'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Dev-only: grant admin role to a user by email
export async function POST(request: Request) {
  try {
    if (process.env['NODE_ENV'] !== 'development') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
    }
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const { data: users, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
    if (listErr) throw new Error(listErr.message)
    const user = users.users.find(u => u.email?.toLowerCase() === String(email).toLowerCase())
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { error: upErr } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: user.id, role: 'admin', is_active: true }, { onConflict: 'user_id,role' })
    if (upErr) throw new Error(upErr.message)

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


