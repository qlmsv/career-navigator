'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle, Clock, BarChart3 } from 'lucide-react'

interface TestResult {
  id: string
  test_id: string
  user_id: string
  score: number
  time_spent: number
  completed_at: string
  answers: any
  test: {
    title_ru: string
    passing_score: number
    category: {
      name_ru: string
      color: string
      icon: string
    }
  }
}

export default function TestResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params['id'] && params['attemptId']) {
      loadResult(params['id'] as string, params['attemptId'] as string)
    }
  }, [params])

  const loadResult = async (testId: string, attemptId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tests/${testId}/results/${attemptId}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error)
      }

      setResult(data.data)
    } catch (error) {
      console.error('Ошибка загрузки результатов:', error)
      router.push('/tests')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка результатов...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Результаты не найдены</div>
      </div>
    )
  }

  const isPassed = result.score >= result.test.passing_score

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/tests')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к тестам
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{result.test.category?.icon}</span>
                <Badge 
                  variant="secondary" 
                  style={{ backgroundColor: result.test.category?.color + '20', color: result.test.category?.color }}
                >
                  {result.test.category?.name_ru}
                </Badge>
                <Badge variant={isPassed ? 'default' : 'destructive'}>
                  {isPassed ? 'Пройден' : 'Не пройден'}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{result.test.title_ru}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Результат */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{result.score}%</div>
                <div className="text-muted-foreground mb-4">
                  Проходной балл: {result.test.passing_score}%
                </div>
                <Progress value={result.score} className="h-3 mb-4" />
                {isPassed ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Тест успешно пройден!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-medium">Тест не пройден</span>
                  </div>
                )}
              </div>

              {/* Детали */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Время прохождения:</span>
                  <span className="font-medium">{formatTime(result.time_spent)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Результат:</span>
                  <span className="font-medium">{result.score}%</span>
                </div>
              </div>

              <div className="text-center">
                <Button onClick={() => router.push('/tests')} className="w-full">
                  Вернуться к тестам
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}