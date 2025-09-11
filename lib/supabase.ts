import { createClient } from '@supabase/supabase-js'

// Создаем единый экземпляр клиента для клиентской части
export const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
)

// Создаем отдельный клиент для серверной части с service role
export const supabaseAdmin = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
)