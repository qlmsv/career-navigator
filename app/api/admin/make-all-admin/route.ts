'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Dev-only endpoint to make all existing users admins
export async function POST() {
  try {
    if (process.env['NODE_ENV'] !== 'development') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
    }
    
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    // Get all users from auth.users
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    if (usersError) throw new Error(usersError.message)

    // Get existing admin roles to avoid duplicates
    const { data: existingAdmins } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .eq('is_active', true)

    const existingAdminIds = new Set(existingAdmins?.map(a => a.user_id) || [])

    // Add admin role for users who don't have it
    const newAdmins = users.users.filter(user => !existingAdminIds.has(user.id))
    
    if (newAdmins.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'All users already have admin role',
        count: 0 
      })
    }

    const adminRoles = newAdmins.map(user => ({
      user_id: user.id,
      role: 'admin',
      is_active: true,
      granted_at: new Date().toISOString()
    }))

    const { error: insertError } = await supabaseAdmin
      .from('user_roles')
      .insert(adminRoles)

    if (insertError) throw new Error(insertError.message)

    return NextResponse.json({ 
      success: true, 
      message: `Added admin role to ${newAdmins.length} users`,
      count: newAdmins.length,
      users: newAdmins.map(u => ({ id: u.id, email: u.email }))
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
