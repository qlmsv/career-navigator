import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST() {
  try {
    // SQL для добавления колонки factor_scores
    const sql = `
      ALTER TABLE test_attempts 
      ADD COLUMN IF NOT EXISTS factor_scores JSONB DEFAULT '{}'::jsonb;
    `
    
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('Error adding factor_scores column:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'factor_scores column added successfully' 
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
