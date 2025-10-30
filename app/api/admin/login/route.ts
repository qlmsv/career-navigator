import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
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

    // Получаем админа
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !admin) {
      console.error('Admin not found:', error)
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    // Простая проверка пароля (для демо)
    // В реальном приложении используйте bcrypt для сравнения хэшей
    if (admin.password_hash !== password) {
      console.error('Invalid password')
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const duration = Date.now() - startTime
    console.log(`[AUTH] Login successful for ${email} in ${duration}ms`)

    return NextResponse.json({
      success: true,
      data: {
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[AUTH] Login error after ${duration}ms:`, error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
