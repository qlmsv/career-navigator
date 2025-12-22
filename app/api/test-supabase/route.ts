import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
    const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          status: 'Error',
          message: 'Missing Supabase credentials',
          config: {
            url: supabaseUrl ? 'Set' : 'Missing',
            key: supabaseKey ? 'Set' : 'Missing',
          },
        },
        { status: 500 },
      )
    }

    // Create a new client to test the connection
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Just get the current user session to test the connection
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json(
        {
          status: 'Error',
          message: 'Failed to connect to Supabase',
          error: error.message,
          config: {
            url: 'Set',
            key: 'Set',
            connectionTest: 'Failed',
          },
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: 'Success',
      message: 'Successfully connected to Supabase',
      config: {
        url: 'Set',
        key: 'Set',
        connectionTest: 'Success',
        authenticated: !!session,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error', details: error },
      { status: 500 }
    )
  }
}
