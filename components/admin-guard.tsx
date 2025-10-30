'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/lib/auth'

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter()
  const { isAdmin, loading } = useAdmin()

  useEffect(() => {
    // Ждем пока загрузится состояние админа
    if (loading) return

    if (!isAdmin) {
      router.push('/admin/login')
    }
  }, [isAdmin, loading, router])

  // Показываем загрузку пока проверяется авторизация
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Проверка авторизации...</p>
        </div>
      </div>
    )
  }

  // Не показываем контент если не админ
  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}
