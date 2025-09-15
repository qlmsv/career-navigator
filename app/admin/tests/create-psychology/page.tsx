'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, Eye, Settings, Brain, Scale } from 'lucide-react'
import PsychologyTestBuilder from '@/components/psychology-test-builder'
import { supabase } from '@/lib/supabase-browser'

interface TestCategory {
  id: string
  name_ru: string
}

interface PersonalityFactor {
  id: string
  name: string
  display_name: string
}

interface RatingScale {
  id: string
  name: string
  min_value: number
  max_value: number
  labels: { [key: string]: string }
}

interface PsychologyQuestion {
  id: string
  question_text_ru: string
  question_type: 'rating_scale' | 'matrix_rating'
  factor_id: string | null
  rating_scale_id: string | null
  scale_min: number
  scale_max: number
  scale_labels: { [key: string]: string }
  points: number
  weight: number
  is_reverse: boolean
  required: boolean
  order_index: number
  explanation_ru: string
  difficulty_level: 'easy' | 'medium' | 'hard'
}

export default function CreatePsychologyTestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<TestCategory[]>([])
  const [factors, setFactors] = useState<PersonalityFactor[]>([])
  const [scales, setScales] = useState<RatingScale[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  // Данные теста
  const [testData, setTestData] = useState({
    title: '',
    title_ru: '',
    description: '',
    description_ru: '',
    category_id: '',
    time_limit_minutes: null as number | null,
    passing_score: 70,
    max_attempts: 3,
    shuffle_questions: false,
    shuffle_answers: false,
    is_public: true,
    requires_auth: true,
    instructions: '',
    instructions_ru: '',
    test_type: 'psychology' as const
  })

  // Вопросы
  const [questions, setQuestions] = useState<PsychologyQuestion[]>([])

  useEffect(() => {
    if (user === null) return
    if (!user) {
      router.push('/auth')
      return
    }
    loadInitialData()
  }, [user])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadCategories(),
        loadFactors(),
        loadScales()
      ])
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('test_categories')
        .select('id, name_ru')
        .eq('is_active', true)
        .order('name_ru')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error)
    }
  }

  const loadFactors = async () => {
    try {
      const response = await fetch('/api/personality-factors')
      const data = await response.json()
      if (data.success) {
        setFactors(data.data)
      }
    } catch (error) {
      console.error('Ошибка загрузки факторов:', error)
    }
  }

  const loadScales = async () => {
    try {
      const response = await fetch('/api/rating-scales')
      const data = await response.json()
      if (data.success) {
        setScales(data.data)
      }
    } catch (error) {
      console.error('Ошибка загрузки шкал:', error)
    }
  }

  const saveTest = async () => {
    if (!testData.title_ru.trim()) {
      alert('Введите название теста')
      return
    }

    if (questions.length === 0) {
      alert('Добавьте хотя бы один вопрос')
      return
    }

    try {
      setSaving(true)

      // Создаем тест
      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
          ...testData,
          total_questions: questions.length,
          status: 'draft'
        })
        .select()
        .single()

      if (testError) throw testError

      // Создаем вопросы
      const questionsToInsert = questions.map((q, index) => ({
        test_id: test.id,
        question_text: q.question_text_ru,
        question_text_ru: q.question_text_ru,
        question_type: q.question_type,
        factor_id: q.factor_id,
        rating_scale_id: q.rating_scale_id,
        scale_min: q.scale_min,
        scale_max: q.scale_max,
        scale_labels: q.scale_labels,
        points: q.points,
        weight: q.weight,
        is_reverse: q.is_reverse,
        required: q.required,
        order_index: index,
        explanation_ru: q.explanation_ru,
        difficulty_level: q.difficulty_level
      }))

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (questionsError) throw questionsError

      alert('Тест успешно создан!')
      router.push('/admin/tests')
    } catch (error) {
      console.error('Ошибка сохранения теста:', error)
      alert('Ошибка при сохранении теста')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Создание психологического теста</h1>
          <p className="text-gray-600">Создайте тест с матричными вопросами и весами</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Основные настройки
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Вопросы ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="scales" className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Шкалы оценок
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Предварительный просмотр
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Основные настройки теста</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title_ru">Название теста *</Label>
                  <Input
                    id="title_ru"
                    value={testData.title_ru}
                    onChange={(e) => setTestData({ ...testData, title_ru: e.target.value })}
                    placeholder="Введите название теста"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id">Категория</Label>
                  <Select
                    value={testData.category_id}
                    onValueChange={(value) => setTestData({ ...testData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name_ru}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time_limit">Время на прохождение (минуты)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    value={testData.time_limit_minutes || ''}
                    onChange={(e) => setTestData({ 
                      ...testData, 
                      time_limit_minutes: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    placeholder="Не ограничено"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passing_score">Проходной балл (%)</Label>
                  <Input
                    id="passing_score"
                    type="number"
                    min="0"
                    max="100"
                    value={testData.passing_score}
                    onChange={(e) => setTestData({ 
                      ...testData, 
                      passing_score: parseInt(e.target.value) || 70 
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_ru">Описание теста</Label>
                <Textarea
                  id="description_ru"
                  value={testData.description_ru}
                  onChange={(e) => setTestData({ ...testData, description_ru: e.target.value })}
                  placeholder="Опишите, что измеряет этот тест"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions_ru">Инструкции для прохождения</Label>
                <Textarea
                  id="instructions_ru"
                  value={testData.instructions_ru}
                  onChange={(e) => setTestData({ ...testData, instructions_ru: e.target.value })}
                  placeholder="Инструкции для пользователей"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_public"
                    checked={testData.is_public}
                    onCheckedChange={(checked) => setTestData({ 
                      ...testData, 
                      is_public: !!checked 
                    })}
                  />
                  <Label htmlFor="is_public">Публичный тест</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_auth"
                    checked={testData.requires_auth}
                    onCheckedChange={(checked) => setTestData({ 
                      ...testData, 
                      requires_auth: !!checked 
                    })}
                  />
                  <Label htmlFor="requires_auth">Требует авторизации</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shuffle_questions"
                    checked={testData.shuffle_questions}
                    onCheckedChange={(checked) => setTestData({ 
                      ...testData, 
                      shuffle_questions: !!checked 
                    })}
                  />
                  <Label htmlFor="shuffle_questions">Перемешивать вопросы</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shuffle_answers"
                    checked={testData.shuffle_answers}
                    onCheckedChange={(checked) => setTestData({ 
                      ...testData, 
                      shuffle_answers: !!checked 
                    })}
                  />
                  <Label htmlFor="shuffle_answers">Перемешивать ответы</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <PsychologyTestBuilder
            onSave={setQuestions}
            initialQuestions={questions}
          />
        </TabsContent>

        <TabsContent value="scales">
          <Card>
            <CardHeader>
              <CardTitle>Управление шкалами оценок</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Здесь вы можете создавать и управлять шкалами оценок для вопросов.
              </p>
              <div className="space-y-4">
                {scales.map(scale => (
                  <div key={scale.id} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{scale.name}</h3>
                    <p className="text-sm text-gray-600">
                      Диапазон: {scale.min_value} - {scale.max_value}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {Object.entries(scale.labels).map(([value, label]) => (
                        <div key={value} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {value}: {label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Предварительный просмотр</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Название: {testData.title_ru || 'Не указано'}</h3>
                  <p className="text-gray-600">{testData.description_ru || 'Описание не указано'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Вопросов: {questions.length}</h4>
                  <h4 className="font-medium">Время: {testData.time_limit_minutes ? `${testData.time_limit_minutes} мин` : 'Не ограничено'}</h4>
                </div>
                {questions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Вопросы:</h4>
                    {questions.map((q, index) => (
                      <div key={q.id} className="p-3 bg-gray-50 rounded">
                        <p className="text-sm">
                          {index + 1}. {q.question_text_ru}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                            {q.scale_min}-{q.scale_max}
                          </span>
                          {q.is_reverse && (
                            <span className="text-xs bg-red-100 px-2 py-1 rounded">
                              Обратный
                            </span>
                          )}
                          <span className="text-xs bg-green-100 px-2 py-1 rounded">
                            Вес: {q.weight}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button 
          onClick={saveTest} 
          disabled={saving || !testData.title_ru.trim() || questions.length === 0}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Сохранение...' : 'Создать тест'}
        </Button>
      </div>
    </div>
  )
}
