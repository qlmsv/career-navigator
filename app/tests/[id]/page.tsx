'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Clock, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Test {
  id: string
  title_ru: string
  description_ru: string
  instructions_ru: string | null
  time_limit_minutes: number | null
  passing_score: number
  max_attempts: number | null
  questions: Question[]
  category: {
    name_ru: string
    color: string
    icon: string
  }
}

interface Question {
  id: string
  question_text_ru: string
  question_type: string
  points: number
  required: boolean
  order_index: number
  answer_options: AnswerOption[]
}

interface AnswerOption {
  id: string
  option_text_ru: string
  is_correct: boolean
  points: number
  order_index: number
}

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [testStarted, setTestStarted] = useState(false)


  useEffect(() => {
    if (params['id']) {
      loadTest(params['id'] as string)
    }
  }, [params['id']])

  useEffect(() => {
    if (testStarted && timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      finishTest()
    }
    return undefined
  }, [timeLeft, testStarted])

  const loadTest = async (testId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tests/${testId}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      setTest(result.data)
    } catch (error) {
      console.error('Ошибка загрузки теста:', error)
      router.push('/tests')
    } finally {
      setLoading(false)
    }
  }

  const startTest = () => {
    setTestStarted(true)
    if (test?.time_limit_minutes) {
      setTimeLeft(test.time_limit_minutes * 60)
    }
  }

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < (test?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const finishTest = async () => {
    if (!test) return

    try {
      const timeSpent = test.time_limit_minutes ? (test.time_limit_minutes * 60 - (timeLeft || 0)) : 0
      
      const response = await fetch(`/api/tests/${test.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          timeSpent
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      // Перенаправляем на результаты
      router.push(`/tests/${test.id}/results/${result.data.attempt_id}`)
    } catch (error) {
      console.error('Ошибка завершения теста:', error)
      alert('Ошибка при завершении теста')
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
        <div>Загрузка теста...</div>
      </div>
    )
  }
  
  if (!test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Тест не найден</div>
      </div>
    )
  }

  if (!testStarted) {
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

          <div className="max-w-2xl mx-auto">
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
              </CardHeader>
              <CardContent className="space-y-6">
                {test.description_ru && (
                  <p className="text-muted-foreground">{test.description_ru}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Количество вопросов:</span>
                    <span className="ml-2">{test.questions.length}</span>
                  </div>
                  <div>
                    <span className="font-medium">Проходной балл:</span>
                    <span className="ml-2">{test.passing_score}%</span>
                </div>
                  {test.time_limit_minutes && (
                    <div>
                      <span className="font-medium">Время на прохождение:</span>
                      <span className="ml-2">{test.time_limit_minutes} минут</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Максимум попыток:</span>
                    <span className="ml-2">{test.max_attempts}</span>
                  </div>
                </div>

                {test.instructions_ru && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Инструкции:</h4>
                    <p className="text-sm text-muted-foreground">{test.instructions_ru}</p>
                  </div>
                )}

                <Button onClick={startTest} className="w-full" size="lg">
                  Начать тест
                </Button>
              </CardContent>
            </Card>
          </div>
            </div>
          </div>
        )
  }

  const currentQuestion = test.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
      {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
                <div>
              <h1 className="text-2xl font-bold">{test.title_ru}</h1>
              <p className="text-muted-foreground">
                Вопрос {currentQuestionIndex + 1} из {test.questions.length}
              </p>
            </div>
            {timeLeft !== null && (
              <div className="flex items-center gap-2 text-lg font-medium">
                <Clock className="h-5 w-5" />
                {formatTime(timeLeft)}
              </div>
            )}
            </div>
            <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {currentQuestion?.question_text_ru}
              </CardTitle>
              {currentQuestion?.required && (
                <Badge variant="destructive" className="w-fit">
                  Обязательный вопрос
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion?.question_type === 'multiple_choice' && (
                <RadioGroup
                  value={answers[currentQuestion?.id] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion?.id, value)}
                >
                  {currentQuestion?.answer_options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.option_text_ru}
                      </Label>
      </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion?.question_type === 'multiple_select' && (
                <div className="space-y-2">
                  {currentQuestion?.answer_options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={(answers[currentQuestion?.id] || []).includes(option.id)}
                        onCheckedChange={(checked) => {
                          const currentAnswers = answers[currentQuestion?.id] || []
                          if (checked) {
                            handleAnswerChange(currentQuestion?.id, [...currentAnswers, option.id])
                          } else {
                            handleAnswerChange(currentQuestion?.id, currentAnswers.filter((id: string) => id !== option.id))
                          }
                        }}
                      />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.option_text_ru}
                      </Label>
                  </div>
                  ))}
                </div>
              )}

              {currentQuestion?.question_type === 'true_false' && (
                <RadioGroup
                  value={answers[currentQuestion?.id] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion?.id, value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true" className="cursor-pointer">Правда</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false" className="cursor-pointer">Ложь</Label>
              </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>
              
              {/* Navigation */}
          <div className="flex justify-between mt-6">
                <Button
              variant="outline"
              onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
              <ArrowLeft className="h-4 w-4 mr-2" />
                  Предыдущий
                </Button>
                
                <div className="flex gap-2">
              {currentQuestionIndex === test.questions.length - 1 ? (
                <Button onClick={finishTest}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                        Завершить тест
                  </Button>
                ) : (
                <Button onClick={nextQuestion}>
                    Следующий
                  <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
          </div>
              </div>
      </div>
    </div>
  )
}