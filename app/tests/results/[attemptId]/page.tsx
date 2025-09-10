'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function AttemptResultsPage() {
  const params = useParams() as { attemptId: string }
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    // Читаем из localStorage для временных результатов
    const stored = localStorage.getItem('test_attempts')
    if (stored) {
      try {
        const attempts = JSON.parse(stored)
        const attempt = attempts.find((a: any) => a.id === params.attemptId)
        if (attempt) {
          setAttempt(attempt)
          setAnswers(attempt.answers || [])
          
          // Загружаем вопросы для отображения
          const supabase = createClient()
          supabase
            .from('questions')
            .select('id,question_text,points')
            .eq('test_id', attempt.test_id)
            .order('order_index')
            .then(({ data: qs }) => setQuestions(qs || []))
        }
      } catch (e) {
        console.error('Error parsing stored attempts:', e)
      }
    }
    setLoading(false)
  }, [params.attemptId])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка…</div>
  if (!attempt) return <div className="min-h-screen flex items-center justify-center">Результаты не найдены</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Результаты</h1>
      <Card>
        <CardHeader>
          <CardTitle>Итог</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-700">Баллы: {attempt.score} / {attempt.max_possible_score}</div>
          <div className="text-slate-700">Процент: {Math.round(attempt.percentage)}%</div>
          <div className="text-slate-700">Статус: {attempt.passed ? 'Пройдено' : 'Не пройдено'}</div>
          <div className="text-xs text-slate-500 mt-2">Результат действителен 24 часа</div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-3">
        {questions.map((q, idx) => {
          const a = answers.find(x => x.question_id === q.id)
          return (
            <Card key={q.id}>
              <CardHeader>
                <CardTitle>Вопрос {idx + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">{q.question_text}</div>
                <div className="text-sm text-slate-600">Ответ: {typeof a?.answer_data === 'object' ? JSON.stringify(a?.answer_data) : String(a?.answer_data ?? '')}</div>
                <div className="text-sm text-slate-600">Баллы: {a?.points_earned ?? 0} / {a?.max_points ?? q.points}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push('/tests')}>К каталогу тестов</Button>
      </div>
    </div>
  )
}


