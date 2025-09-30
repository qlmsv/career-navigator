'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle, XCircle, Clock, Trophy, Home } from 'lucide-react'
import Link from 'next/link'

export default function TestResultsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const testId = params.id as string
  const responseId = searchParams.get('responseId')

  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!responseId) {
      alert('Результаты не найдены')
      router.push('/')
      return
    }
    loadResults()
  }, [responseId])

  const loadResults = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tests/${testId}/results?responseId=${responseId}`)
      const result = await response.json()

      if (result.success && result.data) {
        setResults(result.data)
      } else {
        alert('Не удалось загрузить результаты')
        router.push('/')
      }
    } catch (error) {
      console.error('Error loading results:', error)
      alert('Ошибка загрузки результатов')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка результатов...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return null
  }

  const displayResults = results.results_data || {
    percentage: results.score || 0,
    totalScore: 0,
    maxScore: 0,
    passed: false,
    timeSpent: results.time_spent_seconds || 0,
    details: {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              На главную
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Results Card */}
          <Card className="mb-8">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-6">
                {displayResults.passed ? (
                  <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                  </div>
                )}
              </div>
              
              <CardTitle className="text-3xl mb-2">
                {displayResults.passed ? 'Поздравляем!' : 'Попробуйте еще раз'}
              </CardTitle>
              
              <p className="text-muted-foreground">
                {displayResults.passed 
                  ? 'Вы успешно прошли тест!' 
                  : 'К сожалению, вы не набрали достаточно баллов'}
              </p>
            </CardHeader>

            <CardContent>
              {/* Score Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Ваш результат</span>
                  <span className="text-2xl font-bold">
                    {displayResults.percentage}%
                  </span>
                </div>
                <Progress value={displayResults.percentage} className="h-3" />
                <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                  <span>{displayResults.totalScore} из {displayResults.maxScore} баллов</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <div className="text-2xl font-bold">{displayResults.totalScore}</div>
                    <div className="text-sm text-muted-foreground">Набрано баллов</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">
                      {Math.floor((displayResults.timeSpent || 0) / 60)}м {(displayResults.timeSpent || 0) % 60}с
                    </div>
                    <div className="text-sm text-muted-foreground">Время прохождения</div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Results */}
              {displayResults.details && Object.keys(displayResults.details).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Детализация по вопросам</h3>
                  <div className="space-y-3">
                    {Object.entries(displayResults.details).map(([key, detail]: [string, any], index) => (
                      <div 
                        key={key}
                        className={`p-4 rounded-lg border ${
                          detail.isCorrect 
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                            : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">Вопрос {index + 1}</span>
                              {detail.isCorrect ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="text-muted-foreground">Ваш ответ: </span>
                                <span className="font-medium">{String(detail.userAnswer)}</span>
                              </div>
                              {!detail.isCorrect && (
                                <div>
                                  <span className="text-muted-foreground">Правильный ответ: </span>
                                  <span className="font-medium text-green-600 dark:text-green-400">
                                    {String(detail.correctAnswer)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant={detail.isCorrect ? 'default' : 'destructive'}>
                            {detail.points}/{detail.maxPoints} б
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 mt-8">
                <Button asChild className="flex-1" variant="outline">
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    На главную
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href={`/tests/${testId}`}>
                    Пройти еще раз
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
