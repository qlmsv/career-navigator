'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Timer,
  Send
} from 'lucide-react'

type Question = {
  id: string
  question_text: string
  question_type: string
  points: number
}
type AnswerOption = {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
}

export default function TakeTestPage() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const testId = params.id
  const [loading, setLoading] = useState(true)
  const [test, setTest] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [options, setOptions] = useState<AnswerOption[]>([])
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data: t } = await supabase
        .from('tests')
        .select('id,title,description,time_limit_minutes')
        .eq('id', testId)
        .single()
      const { data: qs } = await supabase
        .from('questions')
        .select('id,question_text,question_type,points')
        .eq('test_id', testId)
        .order('order_index')
      const { data: opts } = await supabase
        .from('answer_options')
        .select('id,question_id,option_text,is_correct')
        .in('question_id', (qs || []).map(q => q.id))
      setTest(t)
      setQuestions(qs || [])
      setOptions(opts || [])
      setLoading(false)
      if (t?.time_limit_minutes) {
        setSecondsLeft(t.time_limit_minutes * 60)
      }
    })()
  }, [testId])

  useEffect(() => {
    if (secondsLeft === null) return
    if (secondsLeft <= 0) {
      handleSubmit()
      return
    }
    const id = setInterval(() => setSecondsLeft(s => (s ?? 1) - 1), 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      // Validation for required questions
      for (const q of questions) {
        const required = true // backend stores per question; assume required default true here
        if (!required) continue
        const val = answers[q.id]
        const empty = val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0)
        if (empty) {
          setError('Пожалуйста, ответьте на все обязательные вопросы')
          setSubmitting(false)
          return
        }
      }
      const res = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_id: testId, answers })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка отправки теста')
      
      // Сохраняем результат в localStorage
      const attemptData = {
        id: data.attempt_id,
        test_id: testId,
        percentage: data.percentage,
        score: data.score,
        max_possible_score: data.max_possible_score,
        passed: data.passed,
        timestamp: data.timestamp,
        answers: data.answers
      }
      
      // Получаем существующие попытки
      const stored = localStorage.getItem('test_attempts')
      const attempts = stored ? JSON.parse(stored) : []
      attempts.push(attemptData)
      localStorage.setItem('test_attempts', JSON.stringify(attempts))
      
      router.push(`/tests/results/${data.attempt_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-spin opacity-25"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">Загружаем тест...</p>
        </div>
      </div>
    )
  }
  
  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Тест не найден
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Возможно, тест был удален или ссылка неверна
          </p>
          <Button onClick={() => router.push('/tests')} variant="outline">
            Вернуться к каталогу
          </Button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
  const answeredCount = Object.keys(answers).length
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }

  const renderQuestion = (question: Question) => {
    const questionOptions = options.filter(o => o.question_id === question.id)
    
    switch (question.question_type) {
      case 'multiple_choice':
      case 'true_false':
        return (
          <div className="space-y-3">
            {questionOptions.map((option, index) => (
              <label 
                key={option.id} 
                className="flex items-center p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all group"
                style={{
                  borderColor: String(answers[question.id] || '') === String(option.id) ? '#3b82f6' : undefined,
                  backgroundColor: String(answers[question.id] || '') === String(option.id) ? '#eff6ff' : undefined
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center group-hover:border-blue-400 transition-colors"
                       style={{
                         borderColor: String(answers[question.id] || '') === String(option.id) ? '#3b82f6' : undefined,
                         backgroundColor: String(answers[question.id] || '') === String(option.id) ? '#3b82f6' : undefined
                       }}>
                    {String(answers[question.id] || '') === String(option.id) && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                    {option.option_text}
                  </span>
                </div>
                <input
                  type="radio"
                  name={`q_${question.id}`}
                  checked={String(answers[question.id] || '') === String(option.id)}
                  onChange={() => setAnswers(a => ({ ...a, [question.id]: option.id }))}
                  className="sr-only"
                />
              </label>
            ))}
          </div>
        )
      
      case 'multiple_select':
        return (
          <div className="space-y-3">
            {questionOptions.map((option) => {
              const current: string[] = Array.isArray(answers[question.id]) ? answers[question.id] : []
              const checked = current.map(String).includes(String(option.id))
              
              return (
                <label 
                  key={option.id} 
                  className="flex items-center p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all group"
                  style={{
                    borderColor: checked ? '#3b82f6' : undefined,
                    backgroundColor: checked ? '#eff6ff' : undefined
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-6 h-6 rounded border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center group-hover:border-blue-400 transition-colors"
                         style={{
                           borderColor: checked ? '#3b82f6' : undefined,
                           backgroundColor: checked ? '#3b82f6' : undefined
                         }}>
                      {checked && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                      {option.option_text}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setAnswers(a => {
                      const prev: string[] = Array.isArray(a[question.id]) ? a[question.id] : []
                      const set = new Set(prev.map(String))
                      if (e.target.checked) set.add(String(option.id)); else set.delete(String(option.id))
                      return { ...a, [question.id]: Array.from(set) }
                    })}
                    className="sr-only"
                  />
                </label>
              )
            })}
          </div>
        )
      
      case 'rating_scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Не согласен</span>
              <span>Полностью согласен</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={answers[question.id] ?? 3}
              onChange={(e) => setAnswers(a => ({ ...a, [question.id]: Number(e.target.value) }))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center">
              <Badge variant="secondary">
                Значение: {answers[question.id] ?? 3}
              </Badge>
            </div>
          </div>
        )
      
      case 'number_input':
        return (
          <input
            type="number"
            className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            placeholder="Введите число"
            value={answers[question.id] ?? ''}
            onChange={(e) => setAnswers(a => ({ ...a, [question.id]: Number(e.target.value) }))}
          />
        )
      
      default:
        return (
          <input
            className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            placeholder="Введите ваш ответ"
            value={answers[question.id] ?? ''}
            onChange={(e) => setAnswers(a => ({ ...a, [question.id]: e.target.value }))}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => router.push('/tests')}
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-slate-400"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {test.title}
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Вопрос {currentQuestionIndex + 1} из {questions.length}
                  </p>
                </div>
              </div>
            </div>
            
            {secondsLeft !== null && (
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Timer className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  {formatTime(secondsLeft)}
                </span>
              </div>
            )}
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Прогресс прохождения</span>
              <span>{answeredCount} из {questions.length} отвечено</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {currentQuestion && (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      Вопрос {currentQuestionIndex + 1}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {currentQuestion.points} балл{currentQuestion.points > 1 ? (currentQuestion.points > 4 ? 'ов' : 'а') : ''}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-slate-800 dark:text-slate-200 leading-relaxed">
                    {currentQuestion.question_text}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {renderQuestion(currentQuestion)}
              
              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Предыдущий
                </Button>
                
                <div className="flex gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                        index === currentQuestionIndex
                          ? 'bg-blue-500 text-white'
                          : questions[index]?.id && answers[questions[index].id]
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-white mr-2"></div>
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Завершить тест
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Следующий
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Error Message */}
        {error && (
          <Card className="mt-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


