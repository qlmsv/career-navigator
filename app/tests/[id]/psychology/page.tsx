'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Brain, CheckCircle } from 'lucide-react'
import PsychologyQuestion from '@/components/psychology-question'
import { supabase } from '@/lib/supabase-browser'

interface PsychologyTest {
  id: string
  title_ru: string
  description_ru: string
  instructions_ru?: string
  time_limit_minutes?: number
  passing_score: number
  questions: {
    id: string
    question_text_ru: string
    question_type: 'rating_scale' | 'matrix_rating'
    scale_min: number
    scale_max: number
    scale_labels: { [key: string]: string }
    is_reverse: boolean
    required: boolean
    explanation_ru?: string
    personality_factors?: {
      name: string
      display_name: string
    }
  }[]
}

export default function PsychologyTestPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.id as string

  const [test, setTest] = useState<PsychologyTest | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (testId) {
      loadTest()
    }
  }, [testId])

  useEffect(() => {
    if (test?.time_limit_minutes) {
      setTimeLeft(test.time_limit_minutes * 60)
    }
  }, [test])

  useEffect(() => {
    if (timeLeft === null) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const loadTest = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tests')
        .select(`
          id,
          title_ru,
          description_ru,
          instructions_ru,
          time_limit_minutes,
          passing_score,
          questions(
            id,
            question_text_ru,
            question_type,
            scale_min,
            scale_max,
            scale_labels,
            is_reverse,
            required,
            explanation_ru,
            personality_factors(
              name,
              display_name
            )
          )
        `)
        .eq('id', testId)
        .eq('status', 'published')
        .single()

      if (error) throw error
      setTest(data)
    } catch (error) {
      console.error('Ошибка загрузки теста:', error)
      setError('Тест не найден или недоступен')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < (test?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!test) return

    // Проверяем обязательные вопросы
    const requiredQuestions = test.questions.filter(q => q.required)
    const unansweredRequired = requiredQuestions.filter(q => answers[q.id] === undefined)
    
    if (unansweredRequired.length > 0) {
      alert(`Пожалуйста, ответьте на все обязательные вопросы. Не отвечено: ${unansweredRequired.length}`)
      return
    }

    try {
      setSubmitting(true)
      
      const timeSpent = test.time_limit_minutes 
        ? (test.time_limit_minutes * 60) - (timeLeft || 0)
        : null

      const response = await fetch(`/api/tests/${testId}/psychology-complete`, {
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

      if (result.success) {
        // Перенаправляем на страницу результатов
        router.push(`/tests/${testId}/results/${result.data.attempt_id}`)
      } else {
        setError(result.error || 'Ошибка при отправке ответов')
      }
    } catch (error) {
      console.error('Ошибка отправки:', error)
      setError('Ошибка при отправке ответов')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Загрузка теста...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h1>
            <p className="text-gray-600 mb-6">{error || 'Тест не найден'}</p>
            <Button onClick={() => router.push('/tests')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться к тестам
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = test.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100
  const answeredQuestions = Object.keys(answers).length

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Заголовок и таймер */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/tests')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{test.title_ru}</h1>
            <p className="text-gray-600">{test.description_ru}</p>
          </div>
        </div>
        
        {timeLeft !== null && (
          <div className="flex items-center gap-2 text-lg font-mono">
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Инструкции */}
      {test.instructions_ru && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Инструкции</h3>
                <p className="text-blue-800">{test.instructions_ru}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Прогресс */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Вопрос {currentQuestionIndex + 1} из {test.questions.length}
              </Badge>
              <Badge variant="secondary">
                Отвечено: {answeredQuestions} из {test.questions.length}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              {Math.round(progress)}% завершено
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Вопрос */}
      {currentQuestion && (
        <PsychologyQuestion
          question={currentQuestion}
          value={answers[currentQuestion.id]}
          onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={test.questions.length}
        />
      )}

      {/* Навигация */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Предыдущий
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex < test.questions.length - 1 ? (
            <Button onClick={handleNext}>
              Следующий
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Отправка...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Завершить тест
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
