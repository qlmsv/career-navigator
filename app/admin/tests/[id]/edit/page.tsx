'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  Copy, 
  Settings,
  Image,
  Video,
  FileText,
  BarChart3
} from 'lucide-react'

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Один ответ', icon: '🔘' },
  { value: 'multiple_select', label: 'Несколько ответов', icon: '☑️' },
  { value: 'true_false', label: 'Да/Нет', icon: '✅' },
  { value: 'rating_scale', label: 'Шкала оценок', icon: '⭐' },
  { value: 'slider', label: 'Слайдер', icon: '🎚️' },
  { value: 'matrix', label: 'Матрица', icon: '📊' },
  { value: 'ranking', label: 'Ранжирование', icon: '🔢' },
  { value: 'text_input', label: 'Текстовый ответ', icon: '📝' },
  { value: 'number_input', label: 'Числовой ответ', icon: '🔢' },
  { value: 'date_input', label: 'Дата', icon: '📅' },
  { value: 'time_input', label: 'Время', icon: '⏰' },
  { value: 'email_input', label: 'Email', icon: '📧' },
  { value: 'phone_input', label: 'Телефон', icon: '📞' },
  { value: 'file_upload', label: 'Загрузка файла', icon: '📎' }
]

export default function AdminEditTestPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  // Using centralized browser client
  const [test, setTest] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [answerOptions, setAnswerOptions] = useState<Record<string, any[]>>({})
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'design' | 'preview' | 'settings'>('design')
  const [uploadingMedia, setUploadingMedia] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadTestData()
  }, [params.id])

  async function loadTestData() {
    try {
      const { data: sessionRes } = await supabase.auth.getSession()
      const uid = sessionRes.session?.user?.id
      if (!uid) { 
        router.replace('/admin')
        return 
      }

      // Загружаем тест
      const { data: testData } = await supabase
        .from('tests')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (!testData) {
        alert('Тест не найден')
        router.push('/admin/tests')
        return
      }

      setTest(testData)

      // Загружаем вопросы
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', params.id)
        .order('order_index')

      setQuestions(questionsData || [])

      // Загружаем варианты ответов для каждого вопроса
      if (questionsData?.length) {
        const { data: optionsData } = await supabase
          .from('answer_options')
          .select('*')
          .in('question_id', questionsData.map(q => q.id))
          .order('order_index')

        const optionsByQuestion: Record<string, any[]> = {}
        optionsData?.forEach(option => {
          if (!optionsByQuestion[option.question_id]) {
            optionsByQuestion[option.question_id] = []
          }
          optionsByQuestion[option.question_id]!.push(option)
        })
        setAnswerOptions(optionsByQuestion)
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      alert('Ошибка загрузки данных')
    }
  }

  async function saveTest() {
    if (!test) return
    setSaving(true)
    try {
      // Сохраняем тест
      await supabase
        .from('tests')
        .update({
          title: test.title,
          title_ru: test.title_ru,
          description: test.description,
          description_ru: test.description_ru,
          time_limit_minutes: test.time_limit_minutes,
          passing_score: test.passing_score,
          max_attempts: test.max_attempts,
          shuffle_questions: test.shuffle_questions,
          shuffle_answers: test.shuffle_answers,
          is_public: test.is_public,
          requires_auth: test.requires_auth,
          instructions: test.instructions,
          instructions_ru: test.instructions_ru,
          total_questions: questions.length
        })
        .eq('id', test.id)

      alert('Тест сохранен!')
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      alert('Ошибка сохранения теста')
    } finally {
      setSaving(false)
    }
  }

  async function addQuestion() {
    try {
      const newQuestion = {
        test_id: test.id,
        question_text: 'Новый вопрос',
        question_text_ru: 'Новый вопрос',
        question_type: 'multiple_choice',
        points: 1,
        required: true,
        order_index: questions.length,
        difficulty_level: 'medium'
      }

      const { data: newQ, error } = await supabase
        .from('questions')
        .insert(newQuestion)
        .select('id')
        .single()

      if (error) throw error

      // Добавляем базовые варианты ответов
      const baseOptions = [
        { question_id: newQ.id, option_text: 'Вариант 1', option_text_ru: 'Вариант 1', is_correct: true, order_index: 0 },
        { question_id: newQ.id, option_text: 'Вариант 2', option_text_ru: 'Вариант 2', is_correct: false, order_index: 1 }
      ]

      await supabase.from('answer_options').insert(baseOptions)

      // Перезагружаем данные
      await loadTestData()
    } catch (error) {
      console.error('Ошибка добавления вопроса:', error)
      alert('Ошибка добавления вопроса')
    }
  }

  async function updateQuestion(questionId: string, updates: any) {
    try {
      await supabase
        .from('questions')
        .update(updates)
        .eq('id', questionId)

      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      ))
    } catch (error) {
      console.error('Ошибка обновления вопроса:', error)
    }
  }

  async function deleteQuestion(questionId: string) {
    if (!confirm('Удалить вопрос?')) return

    try {
      // Удаляем варианты ответов
      await supabase.from('answer_options').delete().eq('question_id', questionId)
      
      // Удаляем вопрос
      await supabase.from('questions').delete().eq('id', questionId)

      // Перезагружаем данные
      await loadTestData()
    } catch (error) {
      console.error('Ошибка удаления вопроса:', error)
      alert('Ошибка удаления вопроса')
    }
  }

  async function addAnswerOption(questionId: string) {
    try {
      const currentOptions = answerOptions[questionId] || []
      const newOption = {
        question_id: questionId,
        option_text: `Вариант ${currentOptions.length + 1}`,
        option_text_ru: `Вариант ${currentOptions.length + 1}`,
        is_correct: false,
        order_index: currentOptions.length
      }

      await supabase.from('answer_options').insert(newOption)
      await loadTestData()
    } catch (error) {
      console.error('Ошибка добавления варианта:', error)
    }
  }

  async function updateAnswerOption(optionId: string, updates: any) {
    try {
      await supabase
        .from('answer_options')
        .update(updates)
        .eq('id', optionId)

      await loadTestData()
    } catch (error) {
      console.error('Ошибка обновления варианта:', error)
    }
  }

  async function deleteAnswerOption(optionId: string) {
    try {
      await supabase.from('answer_options').delete().eq('id', optionId)
      await loadTestData()
    } catch (error) {
      console.error('Ошибка удаления варианта:', error)
    }
  }

  async function uploadMediaFile(questionId: string, file: File) {
    setUploadingMedia(prev => ({ ...prev, [questionId]: true }))
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${questionId}_${Date.now()}.${fileExt}`
      const filePath = `test-media/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('test-media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('test-media')
        .getPublicUrl(filePath)

      await updateQuestion(questionId, { media_url: data.publicUrl })
    } catch (error) {
      console.error('Ошибка загрузки медиа:', error)
      alert('Ошибка загрузки файла')
    } finally {
      setUploadingMedia(prev => ({ ...prev, [questionId]: false }))
    }
  }

  async function addSkipLogic(questionId: string, logic: any) {
    try {
      await updateQuestion(questionId, { skip_logic: logic })
    } catch (error) {
      console.error('Ошибка добавления логики:', error)
    }
  }

  function renderQuestionPreview(question: any) {
    const options = answerOptions[question.id] || []
    
    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {options.map((option: any) => (
              <label key={option.id} className="flex items-center space-x-2">
                <input type="radio" name={`q_${question.id}`} className="rounded" />
                <span>{option.option_text_ru || option.option_text}</span>
              </label>
            ))}
          </div>
        )
      
      case 'multiple_select':
        return (
          <div className="space-y-2">
            {options.map((option: any) => (
              <label key={option.id} className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>{option.option_text_ru || option.option_text}</span>
              </label>
            ))}
          </div>
        )
      
      case 'true_false':
        return (
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="radio" name={`q_${question.id}`} className="rounded" />
              <span>Да</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name={`q_${question.id}`} className="rounded" />
              <span>Нет</span>
            </label>
          </div>
        )
      
      case 'rating_scale':
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(num => (
              <label key={num} className="flex items-center space-x-1">
                <input type="radio" name={`q_${question.id}`} className="rounded" />
                <span>{num}</span>
              </label>
            ))}
          </div>
        )
      
      case 'text_input':
        return <textarea className="w-full p-2 border rounded" rows={3} placeholder="Введите ответ..." />
      
      case 'number_input':
        return <input type="number" className="w-full p-2 border rounded" placeholder="Введите число..." />
      
      case 'slider':
        return (
          <div className="space-y-2">
            <input type="range" min="0" max="100" className="w-full" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        )
      
      case 'matrix':
        return (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Матричный вопрос</div>
            <div className="border rounded p-2">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div></div>
                <div className="text-center">Да</div>
                <div className="text-center">Нет</div>
                <div>Строка 1</div>
                <div className="text-center"><input type="radio" name="row1" /></div>
                <div className="text-center"><input type="radio" name="row1" /></div>
                <div>Строка 2</div>
                <div className="text-center"><input type="radio" name="row2" /></div>
                <div className="text-center"><input type="radio" name="row2" /></div>
              </div>
            </div>
          </div>
        )
      
      case 'ranking':
        return (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Перетащите для сортировки</div>
            <div className="space-y-1">
              {['Вариант 1', 'Вариант 2', 'Вариант 3'].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'date_input':
        return <input type="date" className="w-full p-2 border rounded" />
      
      case 'time_input':
        return <input type="time" className="w-full p-2 border rounded" />
      
      case 'email_input':
        return <input type="email" className="w-full p-2 border rounded" placeholder="example@email.com" />
      
      case 'phone_input':
        return <input type="tel" className="w-full p-2 border rounded" placeholder="+7 (999) 123-45-67" />
      
      case 'file_upload':
        return <input type="file" className="w-full p-2 border rounded" />
      
      default:
        return <div className="text-gray-500">Неизвестный тип вопроса</div>
    }
  }

  if (!test) return <div className="p-6">Загрузка…</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{test.title_ru || test.title}</h1>
          <p className="text-gray-600">Конструктор тестов</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Редактировать' : 'Предпросмотр'}
          </Button>
          <Button onClick={saveTest} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/tests')}>
            Назад к списку
          </Button>
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex space-x-1 mb-6">
        <Button
          variant={activeTab === 'design' ? 'default' : 'outline'}
          onClick={() => setActiveTab('design')}
        >
          <FileText className="w-4 h-4 mr-2" />
          Дизайн
        </Button>
        <Button
          variant={activeTab === 'preview' ? 'default' : 'outline'}
          onClick={() => setActiveTab('preview')}
        >
          <Eye className="w-4 h-4 mr-2" />
          Предпросмотр
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'default' : 'outline'}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Настройки
        </Button>
      </div>

      {activeTab === 'design' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая панель - Настройки теста */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Настройки теста</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Название (RU)</Label>
                  <Input
                    value={test.title_ru || ''}
                    onChange={(e) => setTest({ ...test, title_ru: e.target.value })}
                    placeholder="Название теста"
                  />
                </div>
                <div>
                  <Label>Описание (RU)</Label>
                  <Textarea
                    value={test.description_ru || ''}
                    onChange={(e) => setTest({ ...test, description_ru: e.target.value })}
                    placeholder="Описание теста"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Инструкции (RU)</Label>
                  <Textarea
                    value={test.instructions_ru || ''}
                    onChange={(e) => setTest({ ...test, instructions_ru: e.target.value })}
                    placeholder="Инструкции для прохождения"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Лимит времени (мин)</Label>
                    <Input
                      type="number"
                      value={test.time_limit_minutes || ''}
                      onChange={(e) => setTest({ ...test, time_limit_minutes: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Без лимита"
                    />
                  </div>
                  <div>
                    <Label>Проходной балл (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={test.passing_score}
                      onChange={(e) => setTest({ ...test, passing_score: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Перемешивать вопросы</Label>
                    <Switch
                      checked={test.shuffle_questions}
                      onCheckedChange={(checked) => setTest({ ...test, shuffle_questions: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Перемешивать ответы</Label>
                    <Switch
                      checked={test.shuffle_answers}
                      onCheckedChange={(checked) => setTest({ ...test, shuffle_answers: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Публичный тест</Label>
                    <Switch
                      checked={test.is_public}
                      onCheckedChange={(checked) => setTest({ ...test, is_public: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Вопросов:</span>
                    <Badge variant="secondary">{questions.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Попыток:</span>
                    <Badge variant="secondary">{test.total_attempts || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Средний балл:</span>
                    <Badge variant="secondary">{test.average_score || 0}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Центральная панель - Вопросы */}
          <div className="lg:col-span-2 space-y-4">
            {questions.map((question, index) => (
              <Card key={question.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <Badge variant="outline">#{index + 1}</Badge>
                      <Badge variant="secondary">
                        {QUESTION_TYPES.find(t => t.value === question.question_type)?.icon} 
                        {QUESTION_TYPES.find(t => t.value === question.question_type)?.label}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Текст вопроса */}
                  <div>
                    <Label>Текст вопроса</Label>
                    <Textarea
                      value={question.question_text_ru || question.question_text || ''}
                      onChange={(e) => updateQuestion(question.id, { question_text_ru: e.target.value })}
                      placeholder="Введите вопрос..."
                      rows={2}
                    />
                  </div>

                  {/* Тип вопроса */}
                  <div>
                    <Label>Тип вопроса</Label>
                    <Select
                      value={question.question_type}
                      onValueChange={(value) => updateQuestion(question.id, { question_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Настройки вопроса */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>Баллы</Label>
                      <Input
                        type="number"
                        min="0"
                        value={question.points || 1}
                        onChange={(e) => updateQuestion(question.id, { points: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Сложность</Label>
                      <Select
                        value={question.difficulty_level || 'medium'}
                        onValueChange={(value) => updateQuestion(question.id, { difficulty_level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Легкий</SelectItem>
                          <SelectItem value="medium">Средний</SelectItem>
                          <SelectItem value="hard">Сложный</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        checked={question.required}
                        onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                      />
                      <Label>Обязательный</Label>
                    </div>
                  </div>

                  {/* Варианты ответов */}
                  {['multiple_choice', 'multiple_select'].includes(question.question_type) && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Варианты ответов</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addAnswerOption(question.id)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Добавить
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(answerOptions[question.id] || []).map((option: any, optIndex: number) => (
                          <div key={option.id} className="flex items-center space-x-2 p-2 border rounded">
                            <input
                              type={question.question_type === 'multiple_choice' ? 'radio' : 'checkbox'}
                              checked={option.is_correct}
                              onChange={(e) => updateAnswerOption(option.id, { is_correct: e.target.checked })}
                              className="rounded"
                            />
                            <Input
                              value={option.option_text_ru || option.option_text || ''}
                              onChange={(e) => updateAnswerOption(option.id, { option_text_ru: e.target.value })}
                              placeholder={`Вариант ${optIndex + 1}`}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              min="0"
                              value={option.points || 0}
                              onChange={(e) => updateAnswerOption(option.id, { points: Number(e.target.value) })}
                              placeholder="Баллы"
                              className="w-20"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteAnswerOption(option.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Медиа файлы */}
                  <div>
                    <Label>Медиа файл (изображение, видео, аудио)</Label>
                    <div className="space-y-2">
                      {question.media_url && (
                        <div className="relative">
                          {question.media_url.includes('.mp4') || question.media_url.includes('.webm') ? (
                            <video src={question.media_url} controls className="w-full max-w-md rounded" />
                          ) : question.media_url.includes('.mp3') || question.media_url.includes('.wav') ? (
                            <audio src={question.media_url} controls className="w-full" />
                          ) : (
                            <img src={question.media_url} alt="Media" className="w-full max-w-md rounded" />
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() => updateQuestion(question.id, { media_url: null })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*,video/*,audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) uploadMediaFile(question.id, file)
                        }}
                        disabled={uploadingMedia[question.id]}
                        className="w-full p-2 border rounded"
                      />
                      {uploadingMedia[question.id] && (
                        <div className="text-sm text-blue-600">Загрузка...</div>
                      )}
                    </div>
                  </div>

                  {/* Логика переходов */}
                  <div>
                    <Label>Логика переходов (Skip Logic)</Label>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        Настройте условия для пропуска следующих вопросов
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Если ответ равен..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(answerOptions[question.id] || []).map((option: any) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.option_text_ru || option.option_text}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="То перейти к..." />
                          </SelectTrigger>
                          <SelectContent>
                            {questions.map((q, idx) => (
                              <SelectItem key={q.id} value={q.id}>
                                Вопрос #{idx + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Объяснение */}
                  <div>
                    <Label>Объяснение (опционально)</Label>
                    <Textarea
                      value={question.explanation_ru || question.explanation || ''}
                      onChange={(e) => updateQuestion(question.id, { explanation_ru: e.target.value })}
                      placeholder="Объяснение правильного ответа..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Кнопка добавления вопроса */}
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center py-8">
                <Button
                  variant="outline"
                  onClick={addQuestion}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить вопрос</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Предпросмотр теста</CardTitle>
              <p className="text-sm text-gray-600">
                Как тест будет выглядеть для пользователей
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Заголовок теста */}
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">{test.title_ru || test.title}</h2>
                {test.description_ru && (
                  <p className="text-gray-600">{test.description_ru}</p>
                )}
                {test.instructions_ru && (
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <strong>Инструкции:</strong> {test.instructions_ru}
                  </div>
                )}
              </div>

              <Separator />

              {/* Вопросы */}
              {questions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {question.question_text_ru || question.question_text}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      <div className="mt-2">
                        {renderQuestionPreview(question)}
                      </div>
                    </div>
                  </div>
                  {index < questions.length - 1 && <Separator />}
                </div>
              ))}

              {/* Кнопка отправки */}
              <div className="text-center pt-4">
                <Button size="lg" className="px-8">
                  Завершить тест
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Дополнительные настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Максимум попыток</Label>
                  <Input
                    type="number"
                    min="1"
                    value={test.max_attempts || 3}
                    onChange={(e) => setTest({ ...test, max_attempts: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={test.requires_auth}
                    onCheckedChange={(checked) => setTest({ ...test, requires_auth: checked })}
                  />
                  <Label>Требует авторизации</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Публикация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Статус</Label>
                <Select
                  value={test.status || 'draft'}
                  onValueChange={(value) => setTest({ ...test, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="published">Опубликован</SelectItem>
                    <SelectItem value="archived">Архив</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={test.is_public}
                  onCheckedChange={(checked) => setTest({ ...test, is_public: checked })}
                />
                <Label>Показывать в каталоге</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}