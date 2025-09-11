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
import { ArrowLeft, Plus, Save } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
)

interface TestCategory {
  id: string
  name_ru: string
}

interface Question {
  id: string
  question_text_ru: string
  question_type: string
  points: number
  required: boolean
  order_index: number
  answer_options: AnswerOption[]
}

interface AnswerOption {
  id: string
  option_text_ru: string
  is_correct: boolean
  points: number
  order_index: number
}

export default function CreateTestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<TestCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
  })

  // Вопросы
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    if (user === null) {
      // Пользователь еще не загружен, ждем
      return
    }
    if (!user) {
      router.push('/auth')
      return
    }
    loadCategories()
  }, [user])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('test_categories')
        .select('id, name_ru')
        .eq('is_active', true)
        .order('name_ru')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error)
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `temp_${Date.now()}`,
      question_text_ru: '',
      question_type: 'multiple_choice',
      points: 1,
      required: true,
      order_index: questions.length,
      answer_options: []
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[index]
    if (question) {
      updatedQuestions[index] = { ...question, [field]: value }
      setQuestions(updatedQuestions)
    }
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const addAnswerOption = (questionIndex: number) => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[questionIndex]
    if (question) {
      const newOption: AnswerOption = {
        id: `temp_${Date.now()}`,
        option_text_ru: '',
        is_correct: false,
        points: 0,
        order_index: question.answer_options.length
      }
      question.answer_options.push(newOption)
      setQuestions(updatedQuestions)
    }
  }

  const updateAnswerOption = (questionIndex: number, optionIndex: number, field: keyof AnswerOption, value: any) => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[questionIndex]
    if (question && question.answer_options[optionIndex]) {
      question.answer_options[optionIndex] = {
        ...question.answer_options[optionIndex],
        [field]: value
      }
      setQuestions(updatedQuestions)
    }
  }

  const removeAnswerOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[questionIndex]
    if (question) {
      question.answer_options = question.answer_options.filter((_, i) => i !== optionIndex)
      setQuestions(updatedQuestions)
    }
  }

  const saveTest = async () => {
    if (!user) return

    try {
      setSaving(true)

      // Создаем тест
      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
          ...testData,
          author_id: user.id,
          total_questions: questions.length,
          status: 'draft'
        })
        .select()
        .single()

      if (testError) throw testError

      // Создаем вопросы
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]
        if (!question) continue
        
        const { data: savedQuestion, error: questionError } = await supabase
          .from('questions')
          .insert({
            test_id: test.id,
            question_text: question.question_text_ru,
            question_text_ru: question.question_text_ru,
            question_type: question.question_type,
            points: question.points,
            required: question.required,
            order_index: i
          })
          .select()
          .single()

        if (questionError) throw questionError

        // Создаем варианты ответов
        for (let j = 0; j < question.answer_options.length; j++) {
          const option = question.answer_options[j]
          if (!option) continue
          
          const { error: optionError } = await supabase
            .from('answer_options')
            .insert({
              question_id: savedQuestion.id,
              option_text: option.option_text_ru,
              option_text_ru: option.option_text_ru,
              is_correct: option.is_correct,
              points: option.points,
              order_index: j
            })

          if (optionError) throw optionError
        }
      }

      router.push('/admin/tests')
    } catch (error) {
      console.error('Ошибка сохранения теста:', error)
      alert('Ошибка сохранения теста')
    } finally {
      setSaving(false)
    }
  }

  if (user === null || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к админ-панели
          </Button>
          <h1 className="text-3xl font-bold">Создание теста</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Название теста</label>
                  <Input
                    value={testData.title_ru}
                    onChange={(e) => setTestData({...testData, title_ru: e.target.value, title: e.target.value})}
                    placeholder="Введите название теста"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Описание</label>
                  <Textarea
                    value={testData.description_ru}
                    onChange={(e) => setTestData({...testData, description_ru: e.target.value, description: e.target.value})}
                    placeholder="Описание теста"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Категория</label>
                  <Select value={testData.category_id} onValueChange={(value) => setTestData({...testData, category_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name_ru}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Инструкции</label>
                  <Textarea
                    value={testData.instructions_ru}
                    onChange={(e) => setTestData({...testData, instructions_ru: e.target.value, instructions: e.target.value})}
                    placeholder="Инструкции для прохождения теста"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Вопросы */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Вопросы ({questions.length})
                  <Button onClick={addQuestion} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить вопрос
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((question, questionIndex) => (
                  <div key={question.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Вопрос {questionIndex + 1}</h4>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        Удалить
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Текст вопроса</label>
                      <Textarea
                        value={question.question_text_ru}
                        onChange={(e) => updateQuestion(questionIndex, 'question_text_ru', e.target.value)}
                        placeholder="Введите текст вопроса"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Тип вопроса</label>
                        <Select 
                          value={question.question_type} 
                          onValueChange={(value) => updateQuestion(questionIndex, 'question_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">Множественный выбор (один ответ)</SelectItem>
                            <SelectItem value="multiple_select">Множественный выбор (несколько ответов)</SelectItem>
                            <SelectItem value="true_false">Правда/Ложь</SelectItem>
                            <SelectItem value="rating_scale">Шкала оценки</SelectItem>
                            <SelectItem value="text_input">Текстовый ввод</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Баллы</label>
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value) || 1)}
                          min="1"
                        />
                      </div>
                    </div>

                    {/* Варианты ответов */}
                    {(question.question_type === 'multiple_choice' || question.question_type === 'multiple_select') && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">Варианты ответов</label>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => addAnswerOption(questionIndex)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Добавить вариант
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {question.answer_options.map((option, optionIndex) => {
                            if (!option) return null
                            return (
                              <div key={option.id} className="flex items-center gap-2 p-2 border rounded">
                                <Checkbox
                                  checked={option.is_correct}
                                  onCheckedChange={(checked) => updateAnswerOption(questionIndex, optionIndex, 'is_correct', checked)}
                                />
                                <Input
                                  value={option.option_text_ru}
                                  onChange={(e) => updateAnswerOption(questionIndex, optionIndex, 'option_text_ru', e.target.value)}
                                  placeholder="Вариант ответа"
                                  className="flex-1"
                                />
                                <Input
                                  type="number"
                                  value={option.points}
                                  onChange={(e) => updateAnswerOption(questionIndex, optionIndex, 'points', parseFloat(e.target.value) || 0)}
                                  placeholder="Баллы"
                                  className="w-20"
                                />
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => removeAnswerOption(questionIndex, optionIndex)}
                                >
                                  ×
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Настройки */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки теста</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Лимит времени (минуты)</label>
                  <Input
                    type="number"
                    value={testData.time_limit_minutes || ''}
                    onChange={(e) => setTestData({...testData, time_limit_minutes: e.target.value ? parseInt(e.target.value) : null})}
                    placeholder="Без лимита"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Проходной балл (%)</label>
                  <Input
                    type="number"
                    value={testData.passing_score}
                    onChange={(e) => setTestData({...testData, passing_score: parseInt(e.target.value) || 70})}
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Максимум попыток</label>
                  <Input
                    type="number"
                    value={testData.max_attempts}
                    onChange={(e) => setTestData({...testData, max_attempts: parseInt(e.target.value) || 3})}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shuffle_questions"
                      checked={testData.shuffle_questions}
                      onCheckedChange={(checked) => setTestData({...testData, shuffle_questions: !!checked})}
                    />
                    <label htmlFor="shuffle_questions" className="text-sm font-medium">
                      Перемешивать вопросы
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shuffle_answers"
                      checked={testData.shuffle_answers}
                      onCheckedChange={(checked) => setTestData({...testData, shuffle_answers: !!checked})}
                    />
                    <label htmlFor="shuffle_answers" className="text-sm font-medium">
                      Перемешивать ответы
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_public"
                      checked={testData.is_public}
                      onCheckedChange={(checked) => setTestData({...testData, is_public: !!checked})}
                    />
                    <label htmlFor="is_public" className="text-sm font-medium">
                      Публичный тест
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requires_auth"
                      checked={testData.requires_auth}
                      onCheckedChange={(checked) => setTestData({...testData, requires_auth: !!checked})}
                    />
                    <label htmlFor="requires_auth" className="text-sm font-medium">
                      Требует авторизации
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={saveTest} 
              disabled={saving || !testData.title_ru || questions.length === 0}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Сохранение...' : 'Сохранить тест'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
