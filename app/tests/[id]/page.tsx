'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import SimpleTestViewer from '@/components/simple-test-viewer'
import type { Test } from '@/lib/types'

export default function TakeTestPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.id as string

  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    loadTest()
  }, [testId])

  const loadTest = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tests/${testId}`)
      const result = await response.json()

      if (result.success) {
        setTest(result.data)
      } else {
        alert('Тест не найден')
        router.push('/')
      }
    } catch (error) {
      console.error('Error loading test:', error)
      alert('Ошибка загрузки теста')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    if (!confirm('Вы уверены, что хотите отправить ответы? Изменить их после отправки будет невозможно.')) {
      return
    }

    setSubmitting(true)
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)

      const response = await fetch(`/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response_data: values,
          time_spent_seconds: timeSpent
        })
      })

      const result = await response.json()

      if (result.success) {
        // Переход на страницу результатов
        router.push(`/tests/${testId}/results?responseId=${result.data.response_id}`)
      } else {
        alert('Ошибка отправки: ' + result.error)
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      alert('Ошибка при отправке теста')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка теста...</p>
        </div>
      </div>
    )
  }

  if (!test) {
    return null
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
        <div className="max-w-4xl mx-auto">
          {/* Test Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl">{test.title}</CardTitle>
              {test.description && (
                <CardDescription className="text-base mt-2">
                  {test.description}
                </CardDescription>
              )}
            </CardHeader>
            {test.time_limit_minutes && (
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Ограничение по времени: {test.time_limit_minutes} минут</span>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Warning */}
          {!test.allow_multiple_attempts && (
            <Card className="mb-8 border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-700 dark:text-yellow-500">
                      Внимание!
                    </h4>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                      У вас только одна попытка прохождения этого теста. После отправки ответов вы не сможете пройти тест повторно.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Form */}
          <Card>
            <CardContent className="pt-6">
              <SimpleTestViewer
                schema={test.formily_schema}
                onSubmit={handleSubmit}
                submitting={submitting}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}