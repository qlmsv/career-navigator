'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function AdminCreateTestPage() {
  const router = useRouter()
  // Using centralized browser client
  const [saving, setSaving] = useState(false)
  const [test, setTest] = useState({
    title: '',
    title_ru: '',
    description: '',
    description_ru: '',
    time_limit_minutes: null as number | null,
    passing_score: 70,
    max_attempts: 3,
    shuffle_questions: false,
    shuffle_answers: false,
    is_public: true,
    requires_auth: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const { data: sessionRes } = await supabase.auth.getSession()
      const userId = sessionRes.session?.user?.id
      if (!userId) {
        alert('Необходимо войти в систему')
        router.push('/admin')
        return
      }

      const { data: newTest, error } = await supabase
        .from('tests')
        .insert({
          title: test.title,
          title_ru: test.title_ru || test.title,
          description: test.description || null,
          description_ru: test.description_ru || null,
          author_id: userId,
          time_limit_minutes: test.time_limit_minutes,
          passing_score: test.passing_score,
          max_attempts: test.max_attempts,
          shuffle_questions: test.shuffle_questions,
          shuffle_answers: test.shuffle_answers,
          status: 'draft',
          is_public: test.is_public,
          requires_auth: test.requires_auth,
          tags: '[]',
          instructions: null,
          instructions_ru: null
        })
        .select('id')
        .single()

      if (error) throw new Error(error.message)
      
      alert('Тест создан! Теперь добавьте вопросы.')
      router.push(`/admin/tests/${newTest.id}/edit`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка создания теста')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Создать новый тест</h1>
        <Button variant="outline" onClick={() => router.push('/admin/tests')}>
          ← Назад к списку
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Название (EN)</Label>
                <Input
                  id="title"
                  value={test.title}
                  onChange={(e) => setTest({ ...test, title: e.target.value })}
                  placeholder="Test Title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="title_ru">Название (RU)</Label>
                <Input
                  id="title_ru"
                  value={test.title_ru}
                  onChange={(e) => setTest({ ...test, title_ru: e.target.value })}
                  placeholder="Название теста"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description">Описание (EN)</Label>
                <Textarea
                  id="description"
                  value={test.description}
                  onChange={(e) => setTest({ ...test, description: e.target.value })}
                  placeholder="Test description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="description_ru">Описание (RU)</Label>
                <Textarea
                  id="description_ru"
                  value={test.description_ru}
                  onChange={(e) => setTest({ ...test, description_ru: e.target.value })}
                  placeholder="Описание теста"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="time_limit">Лимит времени (минуты)</Label>
                <Input
                  id="time_limit"
                  type="number"
                  value={test.time_limit_minutes || ''}
                  onChange={(e) => setTest({ ...test, time_limit_minutes: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Без лимита"
                />
              </div>
              <div>
                <Label htmlFor="passing_score">Проходной балл (%)</Label>
                <Input
                  id="passing_score"
                  type="number"
                  min="0"
                  max="100"
                  value={test.passing_score}
                  onChange={(e) => setTest({ ...test, passing_score: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="max_attempts">Макс. попыток</Label>
                <Input
                  id="max_attempts"
                  type="number"
                  min="1"
                  value={test.max_attempts}
                  onChange={(e) => setTest({ ...test, max_attempts: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  <input
                    type="checkbox"
                    checked={test.shuffle_questions}
                    onChange={(e) => setTest({ ...test, shuffle_questions: e.target.checked })}
                    className="mr-2"
                  />
                  Перемешивать вопросы
                </Label>
                <Label>
                  <input
                    type="checkbox"
                    checked={test.shuffle_answers}
                    onChange={(e) => setTest({ ...test, shuffle_answers: e.target.checked })}
                    className="mr-2"
                  />
                  Перемешивать варианты ответов
                </Label>
              </div>
              <div className="space-y-2">
                <Label>
                  <input
                    type="checkbox"
                    checked={test.is_public}
                    onChange={(e) => setTest({ ...test, is_public: e.target.checked })}
                    className="mr-2"
                  />
                  Публичный тест
                </Label>
                <Label>
                  <input
                    type="checkbox"
                    checked={test.requires_auth}
                    onChange={(e) => setTest({ ...test, requires_auth: e.target.checked })}
                    className="mr-2"
                  />
                  Требует авторизации
                </Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={saving || !test.title}>
                {saving ? 'Создание...' : 'Создать тест'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/tests')}>
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
