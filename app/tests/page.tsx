'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star, 
  ArrowRight,
  BookOpen,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react'

export default function PublicTestsCatalogPage() {
  const router = useRouter()
  const [tests, setTests] = useState<Array<{ id: string; title: string; description: string | null; category_id?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('')

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data } = await supabase
        .from('tests')
        .select('id,title,description,category_id')
        .eq('status', 'published')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50)
      setTests(data || [])
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-spin opacity-25"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">Загружаем тесты...</p>
        </div>
      </div>
    )
  }

  const filtered = tests.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) && (!category || t.category_id === category))

  const getTestIcon = (index: number) => {
    const icons = [BookOpen, TrendingUp, Award, Zap, Star, Users]
    const IconComponent = icons[index % icons.length]
    return IconComponent
  }

  const getTestColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500', 
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-cyan-500'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Каталог тестов
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Выберите тест и проверьте свои знания
                </p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="hidden md:flex"
            >
              На главную
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Поиск тестов..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="pl-10 pr-8 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все категории</option>
                <option value="programming">Программирование</option>
                <option value="design">Дизайн</option>
                <option value="marketing">Маркетинг</option>
                <option value="analytics">Аналитика</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Тесты не найдены
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Попробуйте изменить критерии поиска
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((test, index) => {
              const IconComponent = getTestIcon(index)
              const colorClass = getTestColor(index)
              
              return (
                <Card 
                  key={test.id} 
                  className="group hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:scale-[1.02] cursor-pointer"
                  onClick={() => router.push(`/tests/${test.id}`)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Новый
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {test.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {test.description || 'Проверьте свои знания в этой области'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>~15 мин</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>1.2k прошли</span>
                      </div>
                    </div>

                    <Button 
                      className={`w-full bg-gradient-to-r ${colorClass} hover:opacity-90 text-white font-medium group-hover:shadow-lg transition-all`}
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/tests/${test.id}`)
                      }}
                    >
                      <span>Начать тест</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}


