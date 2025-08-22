'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import {
  Brain,
  Clock,
  TrendingUp,
  Target,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/client'


export default function Dashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [testCount, setTestCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    async function getTestCount() {
      if (!user) {
        setIsLoading(false)
        return
      }
      const supabase = createClient()
      try {
        const { count, error } = await supabase
          .from('test_results')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (error) throw error
        setTestCount(count || 0)
      } catch (error) {
        console.error('Error fetching test count:', error)
      } finally {
        setIsLoading(false)
      }
    }
    getTestCount()
  }, [user])

  // Show loading until client-side hydration is complete
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth')
    return null
  }

  const displayName = user?.user_metadata?.['name'] || user?.email?.split('@')[0] || 'Пользователь'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm"></div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Evolv</h1>
                <p className="text-blue-100">Платформа карьерного развития</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                onClick={signOut}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                variant="outline"
              >
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
            Добро пожаловать, {displayName}!
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Откройте свой потенциал с помощью психологического анализа
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Start Test Card */}
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-lg">
                <Brain className="h-5 w-5" />
                Пройти тест
              </CardTitle>
              <CardDescription className="text-blue-100 text-sm">
                Анализ личности Big Five
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span>50 вопросов</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>15-20 минут</span>
                </div>
              </div>
              <Button
                onClick={() => router.push('/ai-assistant')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                size="sm"
              >
                Начать тест
                <TrendingUp className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* View Results Card */}
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-lg">
                <TrendingUp className="h-5 w-5" />
                Результаты
              </CardTitle>
              <CardDescription className="text-green-100 text-sm">
                Просмотр прошлых тестов
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Target className="h-4 w-4 text-green-500" />
                  <span>{testCount} тестов пройдено</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>История результатов</span>
                </div>
              </div>
              <Button
                onClick={() => router.push('/test-history')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                size="sm"
              >
                Посмотреть
                <TrendingUp className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>


      </main>

      {/* Mobile Navigation */}

    </div>
  )
}
