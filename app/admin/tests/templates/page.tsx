'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, FileText, Users, Brain } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'

interface TestTemplate {
  id: string
  name: string
  description: string
  version: string
  factors: number
  questions: number
  file: string
}

export default function TestTemplatesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState<TestTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<TestTemplate | null>(null)
  const [testTitle, setTestTitle] = useState('')
  const [testDescription, setTestDescription] = useState('')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/test-templates')
      const result = await response.json()

      if (result.success) {
        setTemplates(result.data)
      } else {
        console.error('Ошибка загрузки шаблонов:', result.error)
      }
    } catch (error) {
      console.error('Ошибка загрузки шаблонов:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTestFromTemplate = async (template: TestTemplate) => {
    if (!user?.id) {
      alert('Необходимо войти в систему')
      return
    }

    if (!testTitle.trim()) {
      alert('Введите название теста')
      return
    }

    try {
      setCreating(template.id)
      const response = await fetch('/api/test-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          testTitle: testTitle.trim(),
          testDescription: testDescription.trim(),
          authorId: user.id
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Тест успешно создан!')
        router.push(`/admin/tests/${result.data.test.id}/edit`)
      } else {
        alert(`Ошибка создания теста: ${result.error}`)
      }
    } catch (error) {
      console.error('Ошибка создания теста:', error)
      alert('Ошибка создания теста')
    } finally {
      setCreating(null)
      setSelectedTemplate(null)
      setTestTitle('')
      setTestDescription('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Загрузка шаблонов...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Шаблоны психологических тестов</h1>
          <p className="text-muted-foreground">
            Создайте тест из готового шаблона или начните с нуля
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-primary" />
                    <Badge variant="secondary">v{template.version}</Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  {template.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {template.questions} вопросов
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {template.factors} факторов
                  </div>
                </div>

                <Button 
                  onClick={() => setSelectedTemplate(template)}
                  className="w-full"
                  disabled={creating === template.id}
                >
                  {creating === template.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Создание...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Создать тест
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Модальное окно создания теста */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Создать тест из шаблона</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.name}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testTitle">Название теста</Label>
                  <Input
                    id="testTitle"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    placeholder="Введите название теста"
                  />
                </div>

                <div>
                  <Label htmlFor="testDescription">Описание теста</Label>
                  <Textarea
                    id="testDescription"
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                    placeholder="Введите описание теста (необязательно)"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => createTestFromTemplate(selectedTemplate)}
                    className="flex-1"
                    disabled={creating === selectedTemplate.id}
                  >
                    {creating === selectedTemplate.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Создание...
                      </>
                    ) : (
                      'Создать тест'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTemplate(null)}
                    disabled={creating === selectedTemplate.id}
                  >
                    Отмена
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
