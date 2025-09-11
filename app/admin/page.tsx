'use client'

import {
  useState,
  useEffect,
  useCallback
} from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Settings, BarChart3, Users } from 'lucide-react'

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user === null) {
      // Пользователь еще не загружен, ждем
      return
    }
    if (!user) {
      router.push('/auth')
      return
    }

    // Проверяем, является ли пользователь админом
    // В реальном приложении это должно проверяться через API
    checkAdminStatus()
  }, [user, router])

  const checkAdminStatus = useCallback(async () => {
    try {
      // Здесь должна быть проверка роли пользователя
      // Пока что просто разрешаем доступ
      setIsAdmin(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Перенаправление...</p>
        </div>
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Доступ запрещен</h2>
            <p className="text-muted-foreground mb-4">
              У вас нет прав для доступа к админ-панели
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Вернуться к дашборду
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Админ-панель</h1>
          <p className="text-muted-foreground">
            Управление платформой тестирования
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Создание тестов */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/admin/tests/create')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Создать тест
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Создайте новый тест с вопросами и вариантами ответов
              </p>
            </CardContent>
          </Card>

          {/* Управление тестами */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/admin/tests')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-600" />
                Управление тестами
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Редактируйте, публикуйте и архивируйте тесты
              </p>
            </CardContent>
          </Card>

          {/* Аналитика */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/admin/analytics')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Аналитика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Статистика прохождений и результаты тестов
              </p>
            </CardContent>
          </Card>

          {/* Пользователи */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/admin/users')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Пользователи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Управление пользователями и их ролями
              </p>
            </CardContent>
          </Card>

          {/* Категории тестов */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/admin/categories')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-600" />
                Категории
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Управление категориями тестов
              </p>
            </CardContent>
          </Card>

          {/* Настройки */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/admin/settings')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Настройки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Общие настройки платформы
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}