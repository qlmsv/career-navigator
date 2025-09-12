import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST() {
  try {
    const results = []
    
    // Создаем таблицы по одной через прямые SQL запросы
    const tables = [
      {
        name: 'test_types',
        sql: `CREATE TABLE IF NOT EXISTS test_types (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          description TEXT,
          version TEXT DEFAULT '1.0',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      },
      {
        name: 'personality_factors',
        sql: `CREATE TABLE IF NOT EXISTS personality_factors (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          test_type_id UUID NOT NULL REFERENCES test_types(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          display_name TEXT NOT NULL,
          description TEXT,
          order_index INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      },
      {
        name: 'rating_scales',
        sql: `CREATE TABLE IF NOT EXISTS rating_scales (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          min_value INTEGER NOT NULL DEFAULT 1,
          max_value INTEGER NOT NULL DEFAULT 5,
          labels JSONB DEFAULT '{}',
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      }
    ]
    
    for (const table of tables) {
      try {
        // Пытаемся создать таблицу через прямой SQL
        const { data, error } = await supabaseAdmin
          .from('_sql')
          .select('*')
          .eq('query', table.sql)
        
        if (error) {
          // Если не работает, пробуем через rpc
          const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('exec_sql', { 
            sql: table.sql 
          })
          
          if (rpcError) {
            results.push({ table: table.name, success: false, error: rpcError.message })
          } else {
            results.push({ table: table.name, success: true })
          }
        } else {
          results.push({ table: table.name, success: true })
        }
      } catch (err) {
        results.push({ 
          table: table.name, 
          success: false, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Psychology tables creation attempted',
      results
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
