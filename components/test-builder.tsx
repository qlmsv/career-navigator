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
  options?: Array<{ label: string; value: string; points?: number }> | undefined
  rowsOptions?: Array<{ label: string; value: string }>
  columnsOptions?: Array<{ label: string; value: string }>
  // correct answer and question-level points removed from UI and schema
  correctAnswer?: any
  points?: number
  min?: number
  max?: number
  step?: number
  rows?: number
  construct?: string
  subconstruct?: string
  skill?: string
  reverse?: boolean
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
  const [constructs, setConstructs] = useState<string[]>([])
  const [subconstructs, setSubconstructs] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [scoringMode, setScoringMode] = useState<'sum' | 'average' | 'product'>('sum')
  // raw inputs to allow typing commas without immediate parsing side effects
  const [constructsInput, setConstructsInput] = useState<string>('')
  const [subconstructsInput, setSubconstructsInput] = useState<string>('')
  const [skillsInput, setSkillsInput] = useState<string>('')

  // Добавить новый вопрос
  const addQuestion = (type: QuestionType) => {
    const hasOptions = type === 'radio' || type === 'checkbox' || type === 'select' || type === 'image_choice'
    
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type,
      title: '',
      required: false,
      options: hasOptions ? [{ label: 'Вариант 1', value: 'opt1', points: undefined }] : undefined,
      ...(type === 'matrix'
        ? {
            rowsOptions: [
              { label: 'Строка 1', value: 'row1' },
              { label: 'Строка 2', value: 'row2' }
            ],
            columnsOptions: [
              { label: 'Колонка 1', value: 'col1' },
              { label: 'Колонка 2', value: 'col2' }
            ]
          }
        : {})
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
            { label: `Вариант ${q.options.length + 1}`, value: `opt${q.options.length + 1}`, points: 0 }
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
  
  const updateOptionPoints = (questionId: string, optionIndex: number, points: number | undefined) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options]
        const currentOption = newOptions[optionIndex]
        if (currentOption) {
          newOptions[optionIndex] = {
            ...currentOption,
            points
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

        case 'email':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'Input.Email'
          fieldSchema['x-component-props'] = {
            placeholder: 'name@example.com'
          }
          break

        case 'phone':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'Input.Phone'
          fieldSchema['x-component-props'] = {
            placeholder: '+7 900 000-00-00'
          }
          break

        case 'url':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'Input.URL'
          fieldSchema['x-component-props'] = {
            placeholder: 'https://...'
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

        case 'image_choice':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'ImageChoice'
          fieldSchema.enum = question.options?.map(opt => ({ label: opt.label, value: opt.value, image: (opt as any).image }))
          break

        case 'boolean':
          fieldSchema.type = 'boolean'
          fieldSchema['x-component'] = 'Switch'
          break

        case 'yes_no':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'Radio.Group'
          fieldSchema.enum = [
            { label: 'Да', value: 'yes' },
            { label: 'Нет', value: 'no' }
          ]
          break

        case 'date':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'DatePicker'
          break

        case 'time':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'TimePicker'
          break

        case 'datetime':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'DateTimePicker'
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

        case 'nps':
          fieldSchema.type = 'number'
          fieldSchema['x-component'] = 'NPS'
          fieldSchema['x-component-props'] = {
            min: 0,
            max: 10
          }
          break

        case 'matrix':
          fieldSchema.type = 'array'
          fieldSchema['x-component'] = 'Matrix'
          // ожидаем, что options содержит строки и колонки
          fieldSchema['x-component-props'] = {
            rows: question.rowsOptions || [],
            columns: question.columnsOptions || []
          }
          break

        case 'ranking':
          fieldSchema.type = 'array'
          fieldSchema['x-component'] = 'Ranking'
          fieldSchema.enum = question.options?.map(opt => ({ label: opt.label, value: opt.value }))
          break

        case 'constant_sum':
          fieldSchema.type = 'array'
          fieldSchema['x-component'] = 'ConstantSum'
          fieldSchema['x-component-props'] = {
            total: (question as any).max || 100,
            items: question.options?.map(opt => ({ label: opt.label, value: opt.value })) || []
          }
          break

        case 'upload':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'Upload'
          break

        case 'signature':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'Signature'
          break

        case 'location':
          fieldSchema.type = 'string'
          fieldSchema['x-component'] = 'Location'
          break

        case 'divider':
          fieldSchema.type = 'void'
          fieldSchema['x-content'] = question.title || '—'
          break

        case 'html':
          fieldSchema.type = 'void'
          fieldSchema['x-content'] = question.description || ''
          break
      }

      // Правильный ответ и баллы за весь вопрос больше не используются

      // Добавляем баллы на уровне вариантов, если есть
      if (question.options && question.options.some(o => typeof o.points === 'number')) {
        const optionPoints: Record<string, number> = {}
        question.options.forEach(opt => {
          if (opt.value !== undefined && typeof opt.points === 'number') {
            optionPoints[String(opt.value)] = Number(opt.points)
          }
        })
        fieldSchema['x-component-props'] = {
          ...fieldSchema['x-component-props'],
          optionPoints
        }
      }

      // Добавляем метаданные конструкта/субконструкта/скилла/реверса
      if (question.construct || question.subconstruct || question.skill || typeof question.reverse === 'boolean') {
        fieldSchema['x-meta'] = {
          ...(fieldSchema['x-meta'] || {}),
          ...(question.construct ? { construct: question.construct } : {}),
          ...(question.subconstruct ? { subconstruct: question.subconstruct } : {}),
          ...(question.skill ? { skill: question.skill } : {}),
          ...(typeof question.reverse === 'boolean' ? { reverse: !!question.reverse } : {})
        }
      }

      properties[question.id] = fieldSchema
    })

    return {
      type: 'object',
      properties,
      'x-meta': {
        constructs,
        subconstructs,
        skills,
        scoringMode
      }
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

  // Типы вопросов (оставлены только простые)
  const questionTypes: Array<{ value: QuestionType; label: string; icon: string; category: string }> = [
    { value: 'text', label: 'Текст', icon: '📝', category: 'basic' },
    { value: 'textarea', label: 'Длинный текст', icon: '📄', category: 'basic' },
    { value: 'number', label: 'Число', icon: '🔢', category: 'basic' },
    { value: 'radio', label: 'Один выбор', icon: '⭕', category: 'choice' },
    { value: 'checkbox', label: 'Множественный', icon: '☑️', category: 'choice' },
    { value: 'select', label: 'Dropdown', icon: '📋', category: 'choice' },
    { value: 'rating', label: 'Звезды', icon: '⭐', category: 'scale' },
    { value: 'scale', label: 'Шкала 1-5', icon: '📊', category: 'scale' },
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

          {/* Списки конструктов/субконструктов/навыков */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Конструкты (через запятую)</Label>
              <Input
                value={constructsInput !== '' ? constructsInput : constructs.join(', ')}
                onChange={(e) => setConstructsInput(e.target.value)}
                onBlur={() => {
                  const list = (constructsInput !== '' ? constructsInput : constructs.join(', '))
                    .split(',')
                    .map(s => s.trim())
                  setConstructs(list.filter(s => s !== ''))
                }}
                placeholder="Extraversion, Agreeableness"
              />
            </div>
            <div>
              <Label>Субконструкты (через запятую)</Label>
              <Input
                value={subconstructsInput !== '' ? subconstructsInput : subconstructs.join(', ')}
                onChange={(e) => setSubconstructsInput(e.target.value)}
                onBlur={() => {
                  const list = (subconstructsInput !== '' ? subconstructsInput : subconstructs.join(', '))
                    .split(',')
                    .map(s => s.trim())
                  setSubconstructs(list.filter(s => s !== ''))
                }}
                placeholder="Facet 1, Facet 2"
              />
            </div>
            <div>
              <Label>Навыки (через запятую)</Label>
              <Input
                value={skillsInput !== '' ? skillsInput : skills.join(', ')}
                onChange={(e) => setSkillsInput(e.target.value)}
                onBlur={() => {
                  const list = (skillsInput !== '' ? skillsInput : skills.join(', '))
                    .split(',')
                    .map(s => s.trim())
                  setSkills(list.filter(s => s !== ''))
                }}
                placeholder="Skill A, Skill B"
              />
            </div>
          </div>

          {/* Режим подсчета */}
          <div>
            <Label>Система подсчета</Label>
            <Select value={scoringMode} onValueChange={(v) => setScoringMode(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите систему подсчета" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="sum">Суммирование</SelectItem>
                <SelectItem value="average">Средний балл</SelectItem>
                <SelectItem value="product">Перемножение</SelectItem>
              </SelectContent>
            </Select>
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
              constructsList={constructs}
              subconstructsList={subconstructs}
              skillsList={skills}
              onUpdateOptionPoints={(optionIndex, pts) => updateOptionPoints(question.id, optionIndex, pts)}
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
  constructsList: string[]
  subconstructsList: string[]
  skillsList: string[]
  onUpdateOptionPoints: (index: number, points: number | undefined) => void
}

function QuestionEditor({ 
  question, 
  index, 
  onUpdate, 
  onDelete,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  constructsList,
  subconstructsList,
  skillsList,
  onUpdateOptionPoints
}: QuestionEditorProps) {
  const hasOptions = ['radio', 'checkbox', 'select'].includes(question.type)
  const hasMinMax = ['number', 'scale', 'slider'].includes(question.type)
  const canHaveCorrectAnswer = false
  const isMatrix = question.type === 'matrix'

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
                <div key={optIndex} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-7">
                    <Input
                      value={option.label}
                      onChange={(e) => onUpdateOption(optIndex, e.target.value)}
                      placeholder={`Вариант ${optIndex + 1}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      value={option.points !== undefined ? String(option.points) : ''}
                      onChange={(e) => {
                        const val = e.target.value
                        const num = val === '' ? undefined : Number.parseFloat(val)
                        onUpdateOptionPoints(optIndex, Number.isNaN(num as any) ? undefined : (num as number | undefined))
                      }}
                      placeholder="Баллы"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteOption(optIndex)}
                      disabled={question.options!.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={onAddOption}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить вариант
              </Button>
            </div>
          </div>
        )}

        {/* Meta fields: construct/subconstruct/skill/reverse */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Конструкт</Label>
            <Select value={question.construct || ''} onValueChange={(v) => onUpdate({ construct: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите конструкт" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {constructsList.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Субконструкт</Label>
            <Select value={question.subconstruct || ''} onValueChange={(v) => onUpdate({ subconstruct: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите субконструкт" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {subconstructsList.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Навык</Label>
            <Select value={question.skill || ''} onValueChange={(v) => onUpdate({ skill: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите навык" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {skillsList.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`reverse-${question.id}`}
                checked={!!question.reverse}
                onCheckedChange={(checked) => onUpdate({ reverse: !!checked })}
              />
              <Label htmlFor={`reverse-${question.id}`} className="cursor-pointer">Реверс</Label>
            </div>
          </div>
        </div>

        {/* Matrix configuration */}
        {isMatrix && (
          <div className="grid grid-cols-2 gap-6">
            {/* Rows */}
            <div>
              <Label>Строки</Label>
              <div className="space-y-2 mt-2">
                {(question.rowsOptions || []).map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-2">
                    <Input
                      value={row.label}
                      onChange={(e) => {
                        const next = [...(question.rowsOptions || [])]
                        const prev = next[rowIndex] || { label: '', value: `row${rowIndex + 1}` }
                        next[rowIndex] = { ...prev, label: e.target.value, value: prev.value || `row${rowIndex + 1}` }
                        onUpdate({ rowsOptions: next })
                      }}
                      placeholder={`Строка ${rowIndex + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const next = (question.rowsOptions || []).filter((_, i) => i !== rowIndex)
                        onUpdate({ rowsOptions: next })
                      }}
                      disabled={(question.rowsOptions || []).length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = [
                      ...(question.rowsOptions || []),
                      { label: `Строка ${(question.rowsOptions || []).length + 1}`, value: `row${(question.rowsOptions || []).length + 1}` }
                    ]
                    onUpdate({ rowsOptions: next })
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить строку
                </Button>
              </div>
            </div>

            {/* Columns */}
            <div>
              <Label>Колонки</Label>
              <div className="space-y-2 mt-2">
                {(question.columnsOptions || []).map((col, colIndex) => (
                  <div key={colIndex} className="flex items-center gap-2">
                    <Input
                      value={col.label}
                      onChange={(e) => {
                        const next = [...(question.columnsOptions || [])]
                        const prev = next[colIndex] || { label: '', value: `col${colIndex + 1}` }
                        next[colIndex] = { ...prev, label: e.target.value, value: prev.value || `col${colIndex + 1}` }
                        onUpdate({ columnsOptions: next })
                      }}
                      placeholder={`Колонка ${colIndex + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const next = (question.columnsOptions || []).filter((_, i) => i !== colIndex)
                        onUpdate({ columnsOptions: next })
                      }}
                      disabled={(question.columnsOptions || []).length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = [
                      ...(question.columnsOptions || []),
                      { label: `Колонка ${(question.columnsOptions || []).length + 1}`, value: `col${(question.columnsOptions || []).length + 1}` }
                    ]
                    onUpdate({ columnsOptions: next })
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить колонку
                </Button>
              </div>
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

        {/* Correct Answer & Points removed */}

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

  // Убираем выпадающее меню в компактном режиме
  if (compact) {
    return null
  }

  // Популярные типы для sticky панели
  // Показываем только 6 простых типов
  const allowed = ['text', 'textarea', 'radio', 'checkbox', 'rating', 'scale']
  const popularTypes = questionTypes.filter(t => allowed.includes(t.value as any))

  return (
    <Card className="sticky top-4 z-20 shadow-lg bg-background/95 backdrop-blur border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Быстрое добавление
          </CardTitle>
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
