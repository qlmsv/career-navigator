import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test the Supabase connection
    const { data, error } = await supabaseAdmin
      .from('test_table')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json(
        { error: 'Supabase connection error', details: error },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      status: 'Success',
      message: 'Successfully connected to Supabase',
      config: {
        url: process.env['NEXT_PUBLIC_SUPABASE_URL'] ? 'Set' : 'Missing',
        key: process.env['SUPABASE_SERVICE_ROLE_KEY'] ? 'Set' : 'Missing'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error', details: error },
      { status: 500 }
    )
  }
}
