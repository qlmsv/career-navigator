'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import AdminGuard from '@/components/admin-guard'
import TestBuilder from '@/components/test-builder'
import type { ISchema } from '@formily/react'

interface TestRecord {
  id: string
  title: string
  description?: string
  formily_schema: ISchema
}

export default function EditTestPage() {
  const params = useParams()
  const testId = params['id'] as string
  const [loading, setLoading] = useState(true)
  const [test, setTest] = useState<TestRecord | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/tests/${testId}`)
        const json = await res.json()
        if (json.success && json.data) {
          setTest(json.data)
        } else {
          alert('Тест не найден')
          window.location.href = '/admin'
        }
      } catch (e) {
        console.error(e)
        alert('Ошибка загрузки теста')
        window.location.href = '/admin'
      } finally {
        setLoading(false)
      }
    }
    if (testId) load()
  }, [testId])

  const handleSave = async (schema: ISchema, metadata: any) => {
    try {
      const res = await fetch(`/api/tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: metadata.title ?? test?.title,
          description: metadata.description ?? test?.description,
          formily_schema: schema,
        })
      })
      const json = await res.json()
      if (json.success) {
        alert('Изменения сохранены')
        window.location.href = '/admin'
      } else {
        alert('Ошибка: ' + json.error)
      }
    } catch (e) {
      console.error(e)
      alert('Ошибка сохранения теста')
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-6 py-4">
            <Button variant="ghost" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад к панели
              </Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12">
          {loading ? (
            <p className="text-muted-foreground">Загрузка...</p>
          ) : test ? (
            <TestBuilder
              initialSchema={test.formily_schema as ISchema}
              onSave={handleSave}
            />
          ) : null}
        </main>
      </div>
    </AdminGuard>
  )
}


