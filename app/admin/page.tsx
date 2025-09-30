'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAdmin } from '@/lib/auth'
import { Plus, Edit, Trash2, Eye, Users, LogOut, FileText } from 'lucide-react'
import Link from 'next/link'
import AdminGuard from '@/components/admin-guard'
import type { Test } from '@/lib/types'

export default function AdminDashboardPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [testsLoading, setTestsLoading] = useState(true)
  const router = useRouter()
  const { admin, logout } = useAdmin()

  useEffect(() => {
    loadTests()
  }, [])

  const loadTests = async () => {
    try {
      setTestsLoading(true)
      // Загружаем все тесты (включая черновики)
      const response = await fetch('/api/tests?status=all')
      const result = await response.json()
      if (result.success) {
        setTests(result.data || [])
      }
    } catch (error) {
      console.error('Error loading tests:', error)
    } finally {
      setTestsLoading(false)
    }
  }

  const handleDelete = async (testId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот тест?')) return

    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        setTests(tests.filter(t => t.id !== testId))
      }
    } catch (error) {
      console.error('Error deleting test:', error)
      alert('Ошибка при удалении теста')
    }
  }

  const handlePublish = async (testId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    
    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const result = await response.json()
      if (result.success) {
        setTests(tests.map(t => t.id === testId ? { ...t, status: newStatus } : t))
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Ошибка при изменении статуса')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <AdminGuard>
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Панель Администратора</h1>
              <p className="text-sm text-muted-foreground">
                Добро пожаловать, {admin?.name || admin?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline">
                <Link href="/">
                  <Eye className="h-4 w-4 mr-2" />
                  Главная
                </Link>
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Управление Тестами</h2>
            <p className="text-muted-foreground mt-1">
              Создавайте, редактируйте и управляйте тестами
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/admin/tests/create">
              <Plus className="h-5 w-5 mr-2" />
                Создать тест
            </Link>
          </Button>
        </div>

        {/* Tests List */}
        {testsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка тестов...</p>
          </div>
        ) : tests.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Тесты отсутствуют</h3>
              <p className="text-muted-foreground mb-4">
                Создайте первый тест для начала работы
              </p>
              <Button asChild>
                <Link href="/admin/tests/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать тест
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {tests.map((test) => (
              <Card key={test.id}>
            <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{test.title}</CardTitle>
                        <Badge variant={test.status === 'published' ? 'default' : 'secondary'}>
                          {test.status === 'published' ? 'Опубликован' : 'Черновик'}
                        </Badge>
                      </div>
                      {test.description && (
                        <CardDescription>{test.description}</CardDescription>
                      )}
                    </div>
                  </div>
            </CardHeader>
            <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{test.total_responses} ответов</span>
                      </div>
                      {test.time_limit_minutes && (
                        <div className="flex items-center gap-2">
                          <span>⏱️</span>
                          <span>{test.time_limit_minutes} мин</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/tests/${test.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Просмотр
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/tests/${test.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </Button>
                      <Button
                        variant={test.status === 'published' ? 'secondary' : 'default'}
                        size="sm"
                        onClick={() => handlePublish(test.id, test.status)}
                      >
                        {test.status === 'published' ? 'Снять с публикации' : 'Опубликовать'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(test.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
            </CardContent>
          </Card>
            ))}
        </div>
        )}
      </main>
    </div>
    </AdminGuard>
  )
}