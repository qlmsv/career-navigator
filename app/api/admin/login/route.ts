import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a function to get the Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const supabaseKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured')
  }

  return createClient(supabaseUrl, supabaseKey)
}

export const dynamic = 'force-dynamic' // Prevent static generation

export async function POST(request: Request) {
  // Skip during build
  if (process.env['NEXT_PHASE'] === 'phase-production-build') {
    return NextResponse.json(
      { success: false, error: 'Login not available during build' },
      { status: 503 },
    )
  }

  const startTime = Date.now()
  console.log('[AUTH] Login attempt started')

  try {
    const { email, password } = await request.json()
    console.log(
      '[AUTH] Login attempt for email:',
      email ? email.substring(0, 3) + '***' : 'undefined',
    )

    if (!email || !password) {
      console.log('[AUTH] Login failed - missing credentials')
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data) {
      console.error('Login failed:', error)
      return NextResponse.json(
        { success: false, error: error?.message || 'Invalid credentials' },
        { status: 401 },
      )
    }

    const duration = Date.now() - startTime
    console.log(`[AUTH] Login successful for ${email} in ${duration}ms`)

    return NextResponse.json({
      success: true,
      data: {
        admin: {
          id: data.user?.id,
          email: data.user?.email,
          created_at: data.user?.created_at,
        },
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
        session: data.session,
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[AUTH] Login error after ${duration}ms:`, error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
