'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// Dev-only: confirm user email
export async function POST(request: Request) {
  try {
    if (process.env['NODE_ENV'] !== 'development') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
    }

    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Using centralized server admin client

    // Get user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user to confirm email
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    )

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email confirmed successfully',
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: updateData.user?.email_confirmed_at
      }
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
