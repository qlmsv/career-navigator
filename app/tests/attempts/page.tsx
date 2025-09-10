'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MyAttemptsPage() {
  const router = useRouter()
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Получаем попытки из localStorage (временное хранение 24 часа)
    const stored = localStorage.getItem('test_attempts')
    if (stored) {
      try {
        const attempts = JSON.parse(stored)
        // Фильтруем старые записи (старше 24 часов)
        const now = Date.now()
        const validAttempts = attempts.filter((a: any) => now - a.timestamp < 24 * 60 * 60 * 1000)
        setAttempts(validAttempts)
        // Обновляем localStorage без старых записей
        localStorage.setItem('test_attempts', JSON.stringify(validAttempts))
      } catch (e) {
        console.error('Error parsing stored attempts:', e)
      }
    }
    setLoading(false)
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка…</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Мои попытки</h1>
      <div className="space-y-3">
        {attempts.map(a => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle>Попытка {a.id.slice(0, 8)}…</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600">Дата: {new Date(a.timestamp).toLocaleString()}</div>
              <div className="text-sm text-slate-600">Процент: {Math.round(a.percentage || 0)}%</div>
              <div className="text-sm text-slate-600">Статус: {a.passed ? 'Пройдено' : 'Не пройдено'}</div>
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/tests/results/${a.id}`)}>Открыть</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {attempts.length === 0 && <div className="text-slate-600">Пока нет попыток</div>}
      </div>
    </div>
  )
}


