'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Settings, 
  Eye, 
  EyeOff, 
  Edit, 
  Download,
  BarChart3,
  Users,
  FileText,
  Calendar
} from 'lucide-react'

export default function AdminTestsListPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [tests, setTests] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    ;(async () => {
      const { data: sessionRes } = await supabase.auth.getSession()
      const uid = sessionRes.session?.user?.id
      if (!uid) {
        router.replace('/admin')
        return
      }
      setIsAdmin(true)
      await loadTests()
    })()
  }, [])

  async function loadTests() {
    const query = supabase
      .from('tests')
      .select('id,title,status,is_public,created_at,average_score,completion_rate')
      .order('created_at', { ascending: false })
      .limit(100)
    const { data } = await query
    setTests(data || [])
  }

  async function updateTest(id: string, patch: any) {
    await supabase.from('tests').update(patch).eq('id', id)
    await loadTests()
  }

  const filtered = tests.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-spin opacity-25"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">Проверяем доступ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Админ панель
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Управление тестами
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => router.push('/admin/tests/import')}
                variant="outline"
                className="hidden md:flex"
              >
                <Download className="w-4 h-4 mr-2" />
                Импорт
              </Button>
              <Button 
                onClick={() => router.push('/admin/tests/new')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Создать тест
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Поиск тестов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isAdmin === false ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 rounded-full flex items-center justify-center">
              <Settings className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Доступ запрещен
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              У вас нет прав для доступа к админ панели
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center">
              <FileText className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Тесты не найдены
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Создайте первый тест или измените критерии поиска
            </p>
            <Button 
              onClick={() => router.push('/admin/tests/new')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Создать тест
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filtered.map(test => (
              <Card 
                key={test.id} 
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={test.status === 'published' ? 'default' : 'secondary'}
                          className={test.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}
                        >
                          {test.status === 'published' ? 'Опубликован' : 'Черновик'}
                        </Badge>
                        <Badge 
                          variant={test.is_public ? 'outline' : 'destructive'}
                          className={test.is_public ? 'border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300' : ''}
                        >
                          {test.is_public ? 'Публичный' : 'Приватный'}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-slate-800 dark:text-slate-200 mb-2">
                        {test.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(test.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/tests/${test.id}/edit`)}
                      className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Редактировать
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={test.status === 'published' ? 'destructive' : 'default'}
                      onClick={() => updateTest(test.id, { 
                        status: test.status === 'published' ? 'draft' : 'published' 
                      })}
                      className={test.status === 'published' 
                        ? '' 
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      }
                    >
                      {test.status === 'published' ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Скрыть
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Опубликовать
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTest(test.id, { is_public: !test.is_public })}
                      className="hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900/20"
                    >
                      {test.is_public ? 'Сделать приватным' : 'Сделать публичным'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/api/tests/export?test_id=${test.id}`, '_blank')}
                      className="hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Экспорт CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


