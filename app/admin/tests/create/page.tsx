'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import TestBuilder from '@/components/test-builder'
import AdminGuard from '@/components/admin-guard'
import type { ISchema } from '@formily/react'
import { useToast } from '@/hooks/use-toast'

export default function CreateTestPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSave = async (schema: ISchema, metadata: any) => {
    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: metadata.title,
          description: metadata.description,
          formily_schema: schema,
          show_results: true,
          allow_multiple_attempts: true,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: '✅ Тест успешно создан!',
          description: `Тест "${metadata.title}" сохранен как черновик.`,
        })
        router.push('/admin')
      } else {
        toast({
          variant: 'destructive',
          title: '❌ Ошибка сохранения',
          description: result.error || 'Произошла неизвестная ошибка на сервере.',
        })
        console.error('API Error:', result)
      }
    } catch (error) {
      console.error('Error creating test:', error)
      toast({
        variant: 'destructive',
        title: '❌ Ошибка при создании теста',
        description: 'Произошла непредвиденная ошибка. Проверьте консоль.',
      })
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Создание нового теста</h1>
            <p className="text-muted-foreground mt-2">
              Создайте тест, добавив вопросы различных типов
            </p>
          </div>

          <TestBuilder onSave={handleSave} />
        </main>
      </div>
    </AdminGuard>
  )
}
