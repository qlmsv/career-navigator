'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, GripVertical, Save } from 'lucide-react'
import { ISchema } from '@formily/react'
import type { QuestionType } from '@/lib/types'

interface Question {
  id: string
  type: QuestionType
  title: string
  description?: string
  required: boolean
  options?: Array<{ label: string; value: string }> | undefined
  correctAnswer?: any
  points?: number
  min?: number
  max?: number
  step?: number
  rows?: number
}

interface TestBuilderProps {
  initialSchema?: ISchema
  onSave: (schema: ISchema, metadata: any) => void | Promise<void>
}

export default function TestBuilder({ initialSchema, onSave }: TestBuilderProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [saving, setSaving] = useState(false)

  // Добавить новый вопрос
  const addQuestion = (type: QuestionType) => {
    const hasOptions = type === 'radio' || type === 'checkbox' || type === 'select' || type === 'image_choice'
    
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type,
      title: '',
      required: false,
      options: hasOptions ? [{ label: 'Вариант 1', value: 'opt1' }] : undefined
    }
    setQuestions([...questions, newQuestion])
  }

  // Обновить вопрос
  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  // Удалить вопрос
  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  // Добавить опцию к вопросу
  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: [
            ...q.options,
            { label: `Вариант ${q.options.length + 1}`, value: `opt${q.options.length + 1}` }
          ]
        }
      }
      return q
    }))
  }

  // Обновить опцию
  const updateOption = (questionId: string, optionIndex: number, label: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options]
        const currentOption = newOptions[optionIndex]
        if (currentOption) {
          newOptions[optionIndex] = { 
            ...currentOption, 
            label,
            value: currentOption.value || `opt${optionIndex + 1}`
          }
        }
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  // Удалить опцию
  const deleteOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: q.options.filter((_, i) => i !== optionIndex)
        }
      }
      return q
    }))
  }

  // Генерация Formily schema
  const generateSchema = (): ISchema => {
    const properties: Record<string, any> = {}

    questions.forEach((question) => {
      const fieldSchema: any = {
        title: question.title,
        'x-decorator': 'FormItem',
        required: question.required
      }

      if (question.description) {
        fieldSchema.description = question.description
      }

      // Настройка компонента в зависимости от типа
      switch (question.type) {
        case 'text':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'Input'
          fieldSchema['x-component-props'] = {
            placeholder: 'Введите ответ...'
          }
          break

        case 'textarea':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'Input.TextArea'
          fieldSchema['x-component-props'] = {
            rows: question.rows || 4,
            placeholder: 'Введите ответ...'
          }
          break

        case 'number':
          fieldSchema.type = 'number'
          fieldSchema['x-component'] = 'InputNumber'
          fieldSchema['x-component-props'] = {
            min: question.min,
            max: question.max,
            step: question.step || 1
          }
          break

        case 'radio':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'Radio.Group'
          fieldSchema.enum = question.options?.map(opt => ({ label: opt.label, value: opt.value }))
          break

        case 'checkbox':
          fieldSchema.type = 'array'
          fieldSchema['x-component'] = 'Checkbox.Group'
          fieldSchema.enum = question.options?.map(opt => ({ label: opt.label, value: opt.value }))
          break

        case 'select':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'Select'
          fieldSchema.enum = question.options?.map(opt => ({ label: opt.label, value: opt.value }))
          break

        case 'boolean':
          fieldSchema.type = 'boolean'
          fieldSchema['x-component'] = 'Switch'
          break

        case 'date':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'DatePicker'
          break

        case 'rating':
          fieldSchema.type = 'number'
          fieldSchema['x-component'] = 'Rate'
          fieldSchema['x-component-props'] = {
            count: question.max || 5
          }
          break

        case 'scale':
          fieldSchema.type = 'number'
          fieldSchema['x-component'] = 'Slider'
          fieldSchema['x-component-props'] = {
            min: question.min || 1,
            max: question.max || 10,
            step: question.step || 1,
            marks: true
          }
          break

        case 'slider':
          fieldSchema.type = 'number'
          fieldSchema['x-component'] = 'Slider'
          fieldSchema['x-component-props'] = {
            min: question.min || 0,
            max: question.max || 100
          }
          break
      }

      // Добавляем правильный ответ и баллы если указаны
      if (question.correctAnswer !== undefined || question.points !== undefined) {
        fieldSchema['x-component-props'] = {
          ...fieldSchema['x-component-props'],
          correctAnswer: question.correctAnswer,
          points: question.points
        }
      }

      properties[question.id] = fieldSchema
    })

    return {
      type: 'object',
      properties
    }
  }

  // Сохранение
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Введите название теста')
      return
    }

    if (questions.length === 0) {
      alert('Добавьте хотя бы один вопрос')
      return
    }

    setSaving(true)
    try {
      const schema = generateSchema()
      await onSave(schema, { title, description })
    } catch (error) {
      console.error('Error saving:', error)
      alert('Ошибка при сохранении')
    } finally {
      setSaving(false)
    }
  }

  // Типы вопросов (расширенный список как в Qualtrics - 25 типов!)
  const questionTypes: Array<{ value: QuestionType; label: string; icon: string; category: string }> = [
    // Базовые (6)
    { value: 'text', label: 'Текст', icon: '📝', category: 'basic' },
    { value: 'textarea', label: 'Длинный текст', icon: '📄', category: 'basic' },
    { value: 'number', label: 'Число', icon: '🔢', category: 'basic' },
    { value: 'email', label: 'Email', icon: '📧', category: 'basic' },
    { value: 'phone', label: 'Телефон', icon: '📱', category: 'basic' },
    { value: 'url', label: 'URL ссылка', icon: '🔗', category: 'basic' },
    
    // Выбор (4)
    { value: 'radio', label: 'Один выбор', icon: '⭕', category: 'choice' },
    { value: 'checkbox', label: 'Множественный', icon: '☑️', category: 'choice' },
    { value: 'select', label: 'Dropdown', icon: '📋', category: 'choice' },
    { value: 'image_choice', label: 'Выбор картинки', icon: '🖼️', category: 'choice' },
    
    // Шкалы (4)
    { value: 'rating', label: 'Звезды', icon: '⭐', category: 'scale' },
    { value: 'scale', label: 'Шкала 1-5', icon: '📊', category: 'scale' },
    { value: 'slider', label: 'Слайдер', icon: '🎚️', category: 'scale' },
    { value: 'nps', label: 'NPS (0-10)', icon: '💯', category: 'scale' },
    
    // Даты (3)
    { value: 'date', label: 'Дата', icon: '📅', category: 'datetime' },
    { value: 'time', label: 'Время', icon: '⏰', category: 'datetime' },
    { value: 'datetime', label: 'Дата и время', icon: '📆', category: 'datetime' },
    
    // Булевы (2)
    { value: 'boolean', label: 'Переключатель', icon: '🔘', category: 'boolean' },
    { value: 'yes_no', label: 'Да/Нет', icon: '✓✗', category: 'boolean' },
    
    // Сложные (5)
    { value: 'matrix', label: 'Матрица', icon: '⚡', category: 'advanced' },
    { value: 'ranking', label: 'Ранжирование', icon: '🔢', category: 'advanced' },
    { value: 'constant_sum', label: 'Сумма = N', icon: '➕', category: 'advanced' },
    { value: 'upload', label: 'Файл', icon: '📎', category: 'advanced' },
    { value: 'signature', label: 'Подпись', icon: '✍️', category: 'advanced' },
    
    // Специальные (2)
    { value: 'divider', label: 'Разделитель', icon: '━', category: 'special' },
    { value: 'html', label: 'HTML блок', icon: '💻', category: 'special' },
  ]

  return (
    <div className="space-y-6">
      {/* Test Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Информация о тесте</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-title">Название теста *</Label>
            <Input
              id="test-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Тест по математике"
            />
          </div>
          <div>
            <Label htmlFor="test-description">Описание</Label>
            <Textarea
              id="test-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание теста..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions List with inline add buttons */}
      <div className="space-y-4">
        {/* Quick add at the top */}
        <QuickAddButtons questionTypes={questionTypes} onAdd={addQuestion} />

        {questions.map((question, index) => (
          <div key={question.id}>
            <QuestionEditor
              question={question}
              index={index}
              onUpdate={(updates) => updateQuestion(question.id, updates)}
              onDelete={() => deleteQuestion(question.id)}
              onAddOption={() => addOption(question.id)}
              onUpdateOption={(optionIndex, label) => updateOption(question.id, optionIndex, label)}
              onDeleteOption={(optionIndex) => deleteOption(question.id, optionIndex)}
            />
            {/* Add button after each question */}
            <div className="my-4">
              <QuickAddButtons questionTypes={questionTypes} onAdd={addQuestion} compact />
            </div>
          </div>
        ))}

        {/* Add at the bottom if no questions */}
        {questions.length === 0 && (
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="text-center">Добавьте первый вопрос</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {questionTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant="outline"
                    className="h-auto py-3 px-4 flex flex-col items-center gap-2"
                    onClick={() => addQuestion(type.value)}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-xs text-center">{type.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Save Button */}
      {questions.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" disabled={saving}>
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Сохранение...' : 'Сохранить тест'}
          </Button>
        </div>
      )}
    </div>
  )
}

// Question Editor Component
interface QuestionEditorProps {
  question: Question
  index: number
  onUpdate: (updates: Partial<Question>) => void
  onDelete: () => void
  onAddOption: () => void
  onUpdateOption: (index: number, label: string) => void
  onDeleteOption: (index: number) => void
}

function QuestionEditor({ 
  question, 
  index, 
  onUpdate, 
  onDelete,
  onAddOption,
  onUpdateOption,
  onDeleteOption
}: QuestionEditorProps) {
  const hasOptions = ['radio', 'checkbox', 'select'].includes(question.type)
  const hasMinMax = ['number', 'scale', 'slider'].includes(question.type)
  const canHaveCorrectAnswer = ['radio', 'checkbox', 'text', 'number'].includes(question.type)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">Вопрос {index + 1}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Тип: {getQuestionTypeLabel(question.type)}
              </p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Title */}
        <div>
          <Label>Текст вопроса *</Label>
          <Input
            value={question.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Введите текст вопроса..."
          />
        </div>

        {/* Description */}
        <div>
          <Label>Описание (опционально)</Label>
          <Input
            value={question.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Дополнительное пояснение..."
          />
        </div>

        {/* Options (for radio/checkbox/select) */}
        {hasOptions && question.options && (
          <div>
            <Label>Варианты ответов</Label>
            <div className="space-y-2 mt-2">
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <Input
                    value={option.label}
                    onChange={(e) => onUpdateOption(optIndex, e.target.value)}
                    placeholder={`Вариант ${optIndex + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteOption(optIndex)}
                    disabled={question.options!.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={onAddOption}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить вариант
              </Button>
            </div>
          </div>
        )}

        {/* Min/Max (for number/scale/slider) */}
        {hasMinMax && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Минимум</Label>
              <Input
                type="number"
                value={question.min || ''}
                onChange={(e) => onUpdate({ min: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Максимум</Label>
              <Input
                type="number"
                value={question.max || ''}
                onChange={(e) => onUpdate({ max: Number(e.target.value) })}
              />
            </div>
            {question.type !== 'scale' && (
              <div>
                <Label>Шаг</Label>
                <Input
                  type="number"
                  value={question.step || ''}
                  onChange={(e) => onUpdate({ step: Number(e.target.value) })}
                />
              </div>
            )}
          </div>
        )}

        {/* Correct Answer & Points */}
        {canHaveCorrectAnswer && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Правильный ответ (для подсчета баллов)</Label>
              {question.type === 'radio' && question.options ? (
                <Select
                  value={question.correctAnswer}
                  onValueChange={(value) => onUpdate({ correctAnswer: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите правильный ответ" />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={question.correctAnswer || ''}
                  onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
                  placeholder="Введите правильный ответ"
                />
              )}
            </div>
            <div>
              <Label>Баллы за правильный ответ</Label>
              <Input
                type="number"
                value={question.points || ''}
                onChange={(e) => onUpdate({ points: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>
        )}

        {/* Required checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`required-${question.id}`}
            checked={question.required}
            onCheckedChange={(checked) => onUpdate({ required: !!checked })}
          />
          <Label htmlFor={`required-${question.id}`} className="cursor-pointer">
            Обязательный вопрос
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}

// Quick Add Buttons Component
interface QuickAddButtonsProps {
  questionTypes: Array<{ value: QuestionType; label: string; icon: string; category: string }>
  onAdd: (type: QuestionType) => void
  compact?: boolean
}

function QuickAddButtons({ questionTypes, onAdd, compact }: QuickAddButtonsProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Группировка по категориям
  const categories = {
    basic: questionTypes.filter(t => t.category === 'basic'),
    choice: questionTypes.filter(t => t.category === 'choice'),
    scale: questionTypes.filter(t => t.category === 'scale'),
    datetime: questionTypes.filter(t => t.category === 'datetime'),
    boolean: questionTypes.filter(t => t.category === 'boolean'),
    advanced: questionTypes.filter(t => t.category === 'advanced'),
    special: questionTypes.filter(t => t.category === 'special'),
  }

  if (compact) {
    return (
      <div className="flex justify-center relative">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isOpen ? 'Закрыть' : 'Добавить вопрос здесь'}
        </Button>
        
        {isOpen && (
          <div className="absolute z-50 mt-12 bg-background border rounded-lg shadow-2xl p-4 w-[600px]">
            <div className="max-h-96 overflow-y-auto space-y-4">
              {/* Популярные */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Популярные</h4>
                <div className="grid grid-cols-4 gap-2">
                  {[...categories.basic.slice(0, 2), ...categories.choice.slice(0, 2)].map((type) => (
                    <Button
                      key={type.value}
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 px-2 flex flex-col items-center gap-1 hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        onAdd(type.value)
                        setIsOpen(false)
                      }}
                    >
                      <span className="text-xl">{type.icon}</span>
                      <span className="text-xs text-center leading-tight">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Шкалы */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Шкалы и рейтинги</h4>
                <div className="grid grid-cols-4 gap-2">
                  {categories.scale.map((type) => (
                    <Button
                      key={type.value}
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 px-2 flex flex-col items-center gap-1"
                      onClick={() => {
                        onAdd(type.value)
                        setIsOpen(false)
                      }}
                    >
                      <span className="text-xl">{type.icon}</span>
                      <span className="text-xs text-center leading-tight">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Остальные */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Все типы</h4>
                <div className="grid grid-cols-5 gap-2">
                  {questionTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant="ghost"
                      size="sm"
                      className="h-auto py-1 px-1 flex flex-col items-center gap-1 text-xs"
                      onClick={() => {
                        onAdd(type.value)
                        setIsOpen(false)
                      }}
                    >
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-[10px] text-center leading-tight">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Популярные типы для sticky панели
  const popularTypes = [
    ...categories.basic.slice(0, 2),
    ...categories.choice.slice(0, 2),
    ...categories.scale.slice(0, 2),
  ]

  return (
    <Card className="sticky top-4 z-20 shadow-lg bg-background/95 backdrop-blur border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Быстрое добавление
          </CardTitle>
          <span className="text-xs text-muted-foreground">26 типов доступно</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Популярные типы */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {popularTypes.map((type) => (
            <Button
              key={type.value}
              variant="outline"
              className="h-auto py-3 px-2 flex flex-col items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105"
              onClick={() => onAdd(type.value)}
            >
              <span className="text-2xl">{type.icon}</span>
              <span className="text-xs text-center leading-tight font-medium">{type.label}</span>
            </Button>
          ))}
        </div>
        
        {/* Все типы (компактно) */}
        <details className="group">
          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex items-center gap-2">
            <span>Показать все {questionTypes.length} типов</span>
            <span className="group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-3 space-y-3">
            {Object.entries(categories).map(([catKey, catTypes]) => {
              if (catTypes.length === 0) return null
              const categoryNames = {
                basic: 'Базовые',
                choice: 'Выбор из вариантов',
                scale: 'Шкалы',
                datetime: 'Дата и время',
                boolean: 'Да/Нет',
                advanced: 'Сложные',
                special: 'Специальные'
              }
              return (
                <div key={catKey}>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                    {categoryNames[catKey as keyof typeof categoryNames]}
                  </h4>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                    {catTypes.map((type) => (
                      <Button
                        key={type.value}
                        variant="ghost"
                        size="sm"
                        className="h-auto py-2 px-1 flex flex-col items-center gap-1 hover:bg-accent"
                        onClick={() => onAdd(type.value)}
                      >
                        <span className="text-lg">{type.icon}</span>
                        <span className="text-[10px] text-center leading-tight">{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </details>
      </CardContent>
    </Card>
  )
}

function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    // Базовые
    text: 'Текст',
    textarea: 'Длинный текст',
    number: 'Число',
    email: 'Email',
    phone: 'Телефон',
    url: 'URL ссылка',
    // Выбор
    radio: 'Один выбор',
    checkbox: 'Множественный',
    select: 'Dropdown',
    image_choice: 'Выбор картинки',
    // Шкалы
    rating: 'Звезды',
    scale: 'Шкала 1-5',
    slider: 'Слайдер',
    nps: 'NPS (0-10)',
    // Даты
    date: 'Дата',
    time: 'Время',
    datetime: 'Дата и время',
    // Булевы
    boolean: 'Переключатель',
    yes_no: 'Да/Нет',
    // Сложные
    matrix: 'Матрица',
    ranking: 'Ранжирование',
    constant_sum: 'Сумма = N',
    upload: 'Файл',
    signature: 'Подпись',
    location: 'Местоположение',
    // Специальные
    divider: 'Разделитель',
    html: 'HTML блок'
  }
  return labels[type] || type
}
