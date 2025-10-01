// ============================================================================
// Простая система аутентификации для админов
// ============================================================================

import type { Admin } from './types'

const ADMIN_SESSION_KEY = 'admin_session'

export interface AdminSession {
  admin: Admin
  token: string
  expiresAt: number
}

// Проверка админа по email/password через API
export async function loginAdmin(email: string, password: string): Promise<AdminSession | null> {
  try {
    // Вызываем API endpoint для проверки
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const result = await response.json()

    if (!result.success || !result.data?.admin) {
      console.error('Login failed:', result.error)
      return null
    }

    // Создаем сессию
    const session: AdminSession = {
      admin: result.data.admin,
      token: generateToken(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 часа
    }

    // Сохраняем в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
    }

    return session
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

// Получить текущую сессию
export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null

  try {
    const sessionStr = localStorage.getItem(ADMIN_SESSION_KEY)
    if (!sessionStr) return null

    const session: AdminSession = JSON.parse(sessionStr)

    // Проверяем срок действия
    if (Date.now() > session.expiresAt) {
      logoutAdmin()
      return null
    }

    return session
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

// Проверка, является ли пользователь админом
export function isAdmin(): boolean {
  return getAdminSession() !== null
}

// Выход
export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_SESSION_KEY)
  }
  console.log('[AUTH] Admin logged out')
}

// Генерация простого токена
function generateToken(): string {
  return Math.random().toString(36).substr(2) + Date.now().toString(36)
}

// React hook для использования в компонентах
import { useState, useEffect } from 'react'

export function useAdmin() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getAdminSession()
    setAdmin(session?.admin || null)
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const session = await loginAdmin(email, password)
    if (session) {
      setAdmin(session.admin)
      return true
    }
    return false
  }

  const logout = () => {
    logoutAdmin()
    setAdmin(null)
  }

  return {
    admin,
    isAdmin: !!admin,
    loading,
    login,
    logout
  }
}
