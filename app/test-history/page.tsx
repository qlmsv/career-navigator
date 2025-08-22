'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { testService, TestResult } from '@/lib/test-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, TrendingUp, Eye } from 'lucide-react'
import Link from 'next/link'

export default function TestHistoryPage() {
  const { user } = useAuth()
  const [testHistory, setTestHistory] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const loadHistory = async () => {
      try {
        console.log('Loading test history for user:', user.id)
        const history = await testService.loadTestHistory(user.id)
        console.log('Loaded test history:', history)
        setTestHistory(history)
        console.log('Set test history state')
      } catch (err) {
        setError('Ошибка загрузки истории тестов')
        console.error('Failed to load test history:', err)
      } finally {
        setLoading(false)
        console.log('Set loading to false')
      }
    }

    loadHistory()
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getArchetypeColor = (archetype: string) => {
    const colors: Record<string, string> = {
      'ruler': 'bg-purple-500',
      'creator': 'bg-blue-500',
      'sage': 'bg-green-500',
      'innocent': 'bg-yellow-500',
      'explorer': 'bg-orange-500',
      'hero': 'bg-red-500',
      'outlaw': 'bg-gray-500',
      'magician': 'bg-indigo-500',
      'everyman': 'bg-teal-500',
      'lover': 'bg-pink-500',
      'jester': 'bg-cyan-500',
      'caregiver': 'bg-emerald-500'
    }
    return colors[archetype] || 'bg-gray-500'
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-slate-900 dark:text-white">Необходимо войти в систему</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-slate-900 dark:text-white">Загрузка истории тестов...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">История тестов</h1>
          <p className="text-slate-700 dark:text-slate-300">
            Все ваши пройденные психометрические тесты и их результаты
          </p>
        </div>

        {testHistory.length === 0 ? (
          <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-16 h-16 text-slate-500 dark:text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                История тестов пуста
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-6">
                Пройдите свой первый психометрический тест, чтобы увидеть результаты здесь
              </p>
              <Link href="/ai-assistant">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                  Пройти тест
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testHistory.map((test) => (
              <Card key={test.id} className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm hover:bg-white dark:hover:bg-white/15 transition-colors shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-900 dark:text-white text-lg">
                      Тест #{test.id.slice(0, 8)}
                    </CardTitle>
                    <Badge className={getArchetypeColor(test.dominant_archetype)}>
                      {test.dominant_archetype}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-slate-700 dark:text-slate-300 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(test.test_date)}
                    </div>
                    
                    <div className="flex items-center text-slate-700 dark:text-slate-300 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      Анализ: {test.analysis_time}ms
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {test.big_five_scores && Object.keys(test.big_five_scores).length > 0 ? (
                        Object.entries(test.big_five_scores).map(([trait, score]) => (
                          <div key={trait} className="text-center">
                            <div className="font-semibold text-slate-900 dark:text-white">{score as number}%</div>
                            <div className="text-slate-600 dark:text-slate-400 capitalize">{trait}</div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center text-slate-500 dark:text-slate-400 text-xs">
                          Данные Big Five недоступны
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <Link href={`/test-results/${test.id}`}>
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                          <Eye className="w-4 h-4 mr-2" />
                          Посмотреть детали
                        </Button>
                      </Link>
                    </div>
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
