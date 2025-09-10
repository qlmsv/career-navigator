'use server'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Dev-only: create admin user directly
export async function POST(request: Request) {
  try {
    if (process.env['NODE_ENV'] !== 'development') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
    }

    const { email, password, fullName } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName || 'Admin User'
      }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Grant admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: authData.user.id, 
        role: 'admin', 
        is_active: true 
      }, { 
        onConflict: 'user_id,role' 
      })

    if (roleError) {
      console.error('Error granting admin role:', roleError)
      // Don't fail the request if role assignment fails
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: authData.user.id,
        email: authData.user.email
      }
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
