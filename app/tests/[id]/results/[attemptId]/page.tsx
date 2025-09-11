'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle, XCircle, Clock, Trophy, Target, RotateCcw } from 'lucide-react'

interface TestResult {
  test: {
    id: string
    title_ru: string
    description_ru: string
    passing_score: number
    category: {
      name_ru: string
      color: string
      icon: string
    }
  }
  attempt: {
    id: string
    score: number
    max_possible_score: number
    percentage: number
    passed: boolean
    time_spent_seconds: number
    completed_at: string
  }
  questions: Array<{
    id: string
    question_text_ru: string
    question_type: string
    points: number
    user_answer: any
    correct_answer: any
    is_correct: boolean
    points_earned: number
    answer_options: Array<{
      id: string
      option_text_ru: string
      is_correct: boolean
    }>
  }>
}

export default function TestResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id && params.attemptId) {
      loadTestResult(params.id as string, params.attemptId as string)
    }
  }, [params.id, params.attemptId])

  const loadTestResult = async (testId: string, attemptId: string) => {
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

  const getScoreColor = (percentage: number, passingScore: number) => {
    if (percentage >= passingScore) {
      return 'text-green-600'
    } else if (percentage >= passingScore * 0.8) {
      return 'text-yellow-600'
    } else {
      return 'text-red-600'
    }
  }

  const getScoreBadgeVariant = (percentage: number, passingScore: number) => {
    if (percentage >= passingScore) {
      return 'default'
    } else if (percentage >= passingScore * 0.8) {
      return 'secondary'
    } else {
      return 'destructive'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Загрузка результатов...</div>
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

  const { test, attempt, questions } = result

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/tests')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к тестам
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{test.category?.icon}</span>
                <Badge 
                  variant="secondary" 
                  style={{ backgroundColor: test.category?.color + '20', color: test.category?.color }}
                >
                  {test.category?.name_ru}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{test.title_ru}</CardTitle>
              {test.description_ru && (
                <p className="text-muted-foreground">{test.description_ru}</p>
              )}
            </CardHeader>
          </Card>

          {/* Results Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {attempt.passed ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                Результаты теста
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Score */}
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(attempt.percentage, test.passing_score)}`}>
                    {attempt.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Общий балл</div>
                  <Badge 
                    variant={getScoreBadgeVariant(attempt.percentage, test.passing_score)}
                    className="mt-2"
                  >
                    {attempt.passed ? 'Пройден' : 'Не пройден'}
                  </Badge>
                </div>

                {/* Points */}
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">
                    {attempt.score.toFixed(1)} / {attempt.max_possible_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Баллы</div>
                </div>

                {/* Time */}
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2 flex items-center justify-center gap-1">
                    <Clock className="h-5 w-5" />
                    {formatTime(attempt.time_spent_seconds)}
                  </div>
                  <div className="text-sm text-muted-foreground">Время прохождения</div>
                </div>

                {/* Passing Score */}
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2 flex items-center justify-center gap-1">
                    <Target className="h-5 w-5" />
                    {test.passing_score}%
                  </div>
                  <div className="text-sm text-muted-foreground">Проходной балл</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Прогресс</span>
                  <span>{attempt.percentage.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={attempt.percentage} 
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Детальные результаты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">
                        Вопрос {index + 1}: {question.question_text_ru}
                      </h4>
                      <div className="flex items-center gap-2">
                        {question.is_correct ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {question.points_earned.toFixed(1)} / {question.points} баллов
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-2">
                    {question.answer_options.map((option) => {
                      const isUserAnswer = question.user_answer === option.id || 
                        (Array.isArray(question.user_answer) && question.user_answer.includes(option.id))
                      const isCorrect = option.is_correct
                      
                      return (
                        <div 
                          key={option.id} 
                          className={`p-2 rounded border ${
                            isUserAnswer && isCorrect 
                              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                              : isUserAnswer && !isCorrect
                              ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                              : isCorrect
                              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isUserAnswer && isCorrect && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            {isUserAnswer && !isCorrect && (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            {!isUserAnswer && isCorrect && (
                              <CheckCircle className="h-4 w-4 text-green-600 opacity-50" />
                            )}
                            <span className={isUserAnswer ? 'font-medium' : ''}>
                              {option.option_text_ru}
                            </span>
                            {isUserAnswer && (
                              <Badge variant="outline" className="ml-auto">
                                Ваш ответ
                              </Badge>
                            )}
                            {!isUserAnswer && isCorrect && (
                              <Badge variant="outline" className="ml-auto">
                                Правильный ответ
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/tests')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              К списку тестов
            </Button>
            <Button 
              onClick={() => router.push(`/tests/${test.id}`)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Пройти снова
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
