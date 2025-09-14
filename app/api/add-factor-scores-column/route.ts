import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Используем прямой SQL запрос для добавления колонки
    const response = await fetch(process.env['SUPABASE_URL'] + '/rest/v1/rpc/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env['SUPABASE_SERVICE_ROLE_KEY']}`,
        'apikey': process.env['SUPABASE_SERVICE_ROLE_KEY']!,
      },
      body: JSON.stringify({
        sql: "ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS factor_scores JSONB DEFAULT '{}'::jsonb;"
      })
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ 
        success: false, 
        error: `Failed to add column: ${error}` 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'factor_scores column added successfully' 
    })
  } catch (error) {
    console.error('Error adding column:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
