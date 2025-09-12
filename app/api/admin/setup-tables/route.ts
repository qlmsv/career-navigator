'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// Dev-only: setup missing tables
export async function POST() {
  try {
    if (process.env['NODE_ENV'] !== 'development') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
    }

    // Using centralized server admin client

    // Create user_roles table
    const { error: createTableError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_roles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, role)
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
        
        -- Enable RLS
        ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY IF NOT EXISTS "Users can view their own roles" ON user_roles
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Service role can manage all roles" ON user_roles
          FOR ALL USING (auth.role() = 'service_role');
      `
    })

    if (createTableError) {
      console.error('Error creating table:', createTableError)
      return NextResponse.json({ error: createTableError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tables created successfully' 
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
