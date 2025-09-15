import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    // Читаем SQL скрипт
    const sql = fs.readFileSync(path.join(process.cwd(), 'scripts/seed-psychology-data.sql'), 'utf8')

    // Выполняем SQL
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql })

    if (error) {
      console.error('Error seeding psychology data:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Psychology data seeded successfully'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
