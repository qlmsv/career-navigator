'use client'

import {
  useState,
  useEffect,
  useMemo
} from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, Edit, Eye, Trash2, BarChart3, Users, Clock } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

interface Test {
  id: string
  title_ru: string
  description_ru: string
  status: string
  is_public: boolean
  total_questions: number
  total_attempts: number
  average_score: number | null
  created_at: string
  updated_at: string
  category: {
    name_ru: string
    color: string
    icon: string
  }
}

export default function AdminTestsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const supabase = createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
  )

  useEffect(() => {
    if (user === null) {
      // Пользователь еще не загружен, ждем
      return
    }
    if (!user) {
      router.push('/auth')
        return
    }
    loadTests()
  }, [user, router, statusFilter])

  const loadTests = useMemo(() => async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tests${statusFilter ? `?status=${statusFilter}` : ''}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      setTests(result.data || [])
    } catch (error) {
      console.error('Ошибка загрузки тестов:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  const updateTestStatus = async (testId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tests')
        .update({ status: newStatus })
        .eq('id', testId)

      if (error) throw error

      // Обновляем локальное состояние
      setTests(tests.map(test => 
        test.id === testId ? { ...test, status: newStatus } : test
      ))
    } catch (error) {
      console.error('Ошибка обновления статуса:', error)
      alert('Ошибка при обновлении статуса теста')
    }
  }

  const deleteTest = async (testId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот тест?')) {
      return
    }

    try {
      const { error } = await supabase
      .from('tests')
        .delete()
        .eq('id', testId)

      if (error) throw error

      // Обновляем локальное состояние
      setTests(tests.filter(test => test.id !== testId))
    } catch (error) {
      console.error('Ошибка удаления теста:', error)
      alert('Ошибка при удалении теста')
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default'
      case 'draft':
        return 'secondary'
      case 'archived':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Опубликован'
      case 'draft':
        return 'Черновик'
      case 'archived':
        return 'Архив'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (user === null || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка тестов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к админ-панели
          </Button>
          <div className="flex items-center justify-between">
              <div>
              <h1 className="text-3xl font-bold">Управление тестами</h1>
              <p className="text-muted-foreground">
                Создавайте, редактируйте и управляйте тестами
              </p>
            </div>
            <Button onClick={() => router.push('/admin/tests/create')}>
              <Plus className="h-4 w-4 mr-2" />
                Создать тест
              </Button>
            </div>
          </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Статус:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все статусы</SelectItem>
                  <SelectItem value="draft">Черновики</SelectItem>
                  <SelectItem value="published">Опубликованные</SelectItem>
                  <SelectItem value="archived">Архив</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            </div>

        {/* Tests List */}
          <div className="grid gap-6">
          {tests.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{test.category?.icon}</span>
                        <Badge 
                        variant="secondary" 
                        style={{ backgroundColor: test.category?.color + '20', color: test.category?.color }}
                        >
                        {test.category?.name_ru}
                        </Badge>
                      <Badge variant={getStatusBadgeVariant(test.status)}>
                        {getStatusLabel(test.status)}
                        </Badge>
                      {test.is_public && (
                        <Badge variant="outline">Публичный</Badge>
                      )}
                      </div>
                    <CardTitle className="text-xl">{test.title_ru}</CardTitle>
                    {test.description_ru && (
                      <p className="text-muted-foreground mt-2">{test.description_ru}</p>
                    )}
                        </div>
                      </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4" />
                    <span>{test.total_questions} вопросов</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{test.total_attempts} попыток</span>
                  </div>
                  {test.average_score && (
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="h-4 w-4" />
                      <span>{test.average_score.toFixed(1)}% средний балл</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Создан {formatDate(test.created_at)}</span>
                  </div>
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
                    
                  <Select
                    value={test.status}
                    onValueChange={(value) => updateTestStatus(test.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Черновик</SelectItem>
                      <SelectItem value="published">Опубликовать</SelectItem>
                      <SelectItem value="archived">Архив</SelectItem>
                    </SelectContent>
                  </Select>
                    
                    <Button
                    variant="destructive"
                      size="sm"
                    onClick={() => deleteTest(test.id)}
                    >
                    <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {tests.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Тесты не найдены</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter 
                ? `Нет тестов со статусом "${getStatusLabel(statusFilter)}"`
                : 'У вас пока нет созданных тестов'
              }
            </p>
            <Button onClick={() => router.push('/admin/tests/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Создать первый тест
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}