'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, GripVertical, Save, Upload } from 'lucide-react'
import { ISchema } from '@formily/react'
import type { QuestionType } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { TagInput } from './ui/tag-input'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Question {
  id: string
  type: QuestionType
  title: string
  description?: string
  required: boolean
  options?: Array<{ label: string; value: string; points?: number }> | undefined
  rowsOptions?: Array<{ label: string; value: string }>
  columnsOptions?: Array<{ label: string; value: string }>
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
  initialTitle?: string
  initialDescription?: string | undefined
  onSave: (schema: ISchema, metadata: any) => void | Promise<void>
}

function parseSchema(schema: ISchema): { questions: Question[], constructs: string[], subconstructs: string[], skills: string[], scoringMode: 'sum' | 'average' | 'product' } {
    const questions: Question[] = [];
    const properties = schema.properties || {};

    if (typeof properties === 'object') {
        for (const id in properties) {
            const fieldSchema = (properties as any)[id];
            if (!fieldSchema) continue;

            let question: Partial<Question> = {
                id,
                title: fieldSchema.title || '',
                description: fieldSchema.description || '',
                required: !!fieldSchema.required,
            };

            const componentType = fieldSchema['x-component'] || '';
            const typeMapping: { [key: string]: QuestionType } = {
                'Input': 'text',
                'Input.TextArea': 'textarea',
                'InputNumber': 'number',
                'Input.Email': 'email',
                'Input.Phone': 'phone',
                'Input.URL': 'url',
                'Radio.Group': 'radio',
                'Checkbox.Group': 'checkbox',
                'Select': 'select',
                'ImageChoice': 'image_choice',
                'Switch': 'boolean',
                'DatePicker': 'date',
                'TimePicker': 'time',
                'DateTimePicker': 'datetime',
                'Rate': 'rating',
                'Slider': 'slider',
                'NPS': 'nps',
                'Matrix': 'matrix',
                'Ranking': 'ranking',
                'ConstantSum': 'constant_sum',
                'Upload': 'upload',
                'Signature': 'signature',
                'Location': 'location',
                'Divider': 'divider',
                'HTML': 'html'
            };
            
            let qType: QuestionType = 'text';
            if (componentType === 'Radio.Group' && fieldSchema.enum?.length === 2 && fieldSchema.enum[0].value === 'yes') {
                qType = 'yes_no';
            } else if (componentType === 'Slider' && (fieldSchema['x-component-props']?.marks)) {
                 qType = 'scale';
            } else {
                qType = typeMapping[componentType] || 'text';
            }

            question.type = qType;

            if (fieldSchema.enum) {
                const optionPoints = fieldSchema['x-component-props']?.optionPoints || {};
                question.options = fieldSchema.enum.map((opt: { label: string, value: any }) => ({
                    label: opt.label,
                    value: String(opt.value),
                    points: optionPoints[String(opt.value)]
                }));
            }
            
            if (qType === 'matrix') {
                question.rowsOptions = fieldSchema['x-component-props']?.rows || [];
                question.columnsOptions = fieldSchema['x-component-props']?.columns || [];
            }

            const props = fieldSchema['x-component-props'] || {};
            question.min = props.min;
            question.max = props.max;
            question.step = props.step;
            if (qType === 'rating') {
                question.max = props.count;
            }
            if (qType === 'textarea') {
                question.rows = props.rows;
            }

            const meta = fieldSchema['x-meta'] || {};
            question.construct = meta.construct;
            question.subconstruct = meta.subconstruct;
            question.skill = meta.skill;
            question.reverse = meta.reverse;

            questions.push(question as Question);
        }
    }
    
    const meta = schema['x-meta'] || {};

    return {
        questions,
        constructs: meta.constructs || [],
        subconstructs: meta.subconstructs || [],
        skills: meta.skills || [],
        scoringMode: meta.scoringMode || 'sum',
    };
}

export default function TestBuilder({ initialSchema, initialTitle, initialDescription, onSave }: TestBuilderProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState(initialTitle || '')
  const [description, setDescription] = useState(initialDescription || '')
  const [questions, setQuestions] = useState<Question[]>([])
  const [saving, setSaving] = useState(false)
  const [constructs, setConstructs] = useState<string[]>([])
  const [subconstructs, setSubconstructs] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [scoringMode, setScoringMode] = useState<'sum' | 'average' | 'product'>('sum')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const questionIds = useMemo(() => questions.map(q => q.id), [questions]);

  useEffect(() => {
    if (initialSchema) {
        const parsed = parseSchema(initialSchema);
        setQuestions(parsed.questions);
        setConstructs(parsed.constructs);
        setSubconstructs(parsed.subconstructs);
        setSkills(parsed.skills);
        setScoringMode(parsed.scoringMode);
    }
  }, [initialSchema]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleImportTemplate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data || typeof data !== 'object') {
        throw new Error('Некорректный формат файла')
      }

      if (!data.formily_schema) {
        throw new Error('Отсутствует ключ formily_schema')
      }

      const parsed = parseSchema(data.formily_schema)
      setQuestions(parsed.questions)
      setConstructs(parsed.constructs || [])
      setSubconstructs(parsed.subconstructs || [])
      setSkills(parsed.skills || [])
      setScoringMode(parsed.scoringMode || 'sum')
      setTitle(data.title || '')
      setDescription(data.description || '')

      toast({
        title: 'Шаблон загружен',
        description: file.name,
      })
    } catch (error: any) {
      console.error('Failed to import template:', error)
      toast({
        variant: 'destructive',
        title: 'Ошибка импорта',
        description: error?.message || 'Не удалось прочитать шаблон.',
      })
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const addQuestion = (type: QuestionType) => {
    const hasOptions = type === 'radio' || type === 'checkbox' || type === 'select' || type === 'image_choice'
    
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type,
      title: '',
      required: false,
      options: hasOptions ? [{ label: 'Вариант 1', value: 'opt1' }] : undefined,
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
    setQuestions((prev) => [...prev, newQuestion])
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

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
          if (points === undefined) {
            const { points: _omit, ...rest } = currentOption as any
            newOptions[optionIndex] = rest
          } else {
            newOptions[optionIndex] = {
              ...currentOption,
              points
            }
          }
        }
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

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

  const validateQuestions = () => {
    const ids = new Set<string>()
    for (const question of questions) {
      if (!question.id || !question.id.trim()) {
        toast({
          variant: 'destructive',
          title: 'Ошибка в вопросах',
          description: 'Каждый вопрос должен иметь идентификатор.',
        })
        return false
      }
      if (ids.has(question.id)) {
        toast({
          variant: 'destructive',
          title: 'Дублирующиеся вопросы',
          description: `Идентификатор "${question.id}" используется более одного раза.`,
        })
        return false
      }
      ids.add(question.id)
      if (!question.title || !question.title.trim()) {
        toast({
          variant: 'destructive',
          title: 'Ошибка в вопросах',
          description: 'У каждого вопроса должен быть текст.',
        })
        return false
      }
      if (['radio', 'checkbox', 'select', 'image_choice'].includes(question.type)) {
        if (!question.options || question.options.length === 0) {
          toast({
            variant: 'destructive',
            title: 'Недостаточно вариантов',
            description: 'Вопросы с выбором должны содержать хотя бы один вариант.',
          })
          return false
        }
        const hasEmptyOption = question.options.some(option => !option.label || !option.label.trim())
        if (hasEmptyOption) {
          toast({
            variant: 'destructive',
            title: 'Ошибка в вариантах ответа',
            description: 'Каждый вариант должен содержать текст.',
          })
          return false
        }
      }
    }
    return true
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Не заполнено название',
        description: 'Пожалуйста, введите название теста.',
      })
      return
    }

    if (questions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Нет вопросов',
        description: 'Пожалуйста, добавьте хотя бы один вопрос.',
      })
      return
    }

    if (!validateQuestions()) {
      return
    }

    setSaving(true)
    try {
      const schema = generateSchema()
      await onSave(schema, { title, description })
    } catch (error) {
      console.error('Error saving:', error)
      toast({
        variant: 'destructive',
        title: '❌ Ошибка при сохранении',
        description: 'Произошла непредвиденная ошибка.',
      })
    } finally {
      setSaving(false)
    }
  }

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
      <Card>
        <CardHeader>
          <CardTitle>Информация о тесте</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <Label htmlFor="test-title">Название теста *</Label>
              <Input
                id="test-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Тест по математике"
              />
            </div>
            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportTemplate}
                className="hidden"
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />Загрузить шаблон
              </Button>
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Конструкты</Label>
              <TagInput
                value={constructs}
                onChange={setConstructs}
                placeholder="Добавить конструкт..."
              />
            </div>
            <div>
              <Label>Субконструкты</Label>
              <TagInput
                value={subconstructs}
                onChange={setSubconstructs}
                placeholder="Добавить субконструкт..."
              />
            </div>
            <div>
              <Label>Навыки</Label>
              <TagInput
                value={skills}
                onChange={setSkills}
                placeholder="Добавить навык..."
              />
            </div>
          </div>

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

      <div className="space-y-4">
        <QuickAddButtons questionTypes={questionTypes} onAdd={addQuestion} />
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
            {questions.map((question, index) => (
              <SortableQuestionEditor
                key={question.id}
                id={question.id}
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
            ))}
          </SortableContext>
        </DndContext>

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
  dragHandleProps?: any
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
  onUpdateOptionPoints,
  dragHandleProps
}: QuestionEditorProps) {
  const hasOptions = ['radio', 'checkbox', 'select'].includes(question.type)
  const hasMinMax = ['number', 'scale', 'slider'].includes(question.type)
  const isMatrix = question.type === 'matrix'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div {...dragHandleProps} className="cursor-grab p-2">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
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
        <div>
          <Label>Текст вопроса *</Label>
          <Input
            value={question.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Введите текст вопроса..."
          />
        </div>

        <div>
          <Label>Описание (опционально)</Label>
          <Input
            value={question.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Дополнительное пояснение..."
          />
        </div>

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

        {isMatrix && (
          <div className="grid grid-cols-2 gap-6">
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

function SortableQuestionEditor(props: QuestionEditorProps & { id: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionEditor {...props} dragHandleProps={{...attributes, ...listeners}} />
    </div>
  );
}

interface QuickAddButtonsProps {
  questionTypes: Array<{ value: QuestionType; label: string; icon: string; category: string }>
  onAdd: (type: QuestionType) => void
  compact?: boolean
}


function QuickAddButtons({ questionTypes, onAdd, compact }: QuickAddButtonsProps) {
  const [isOpen, setIsOpen] = useState(false)

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
    return null
  }

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
    text: 'Текст',
    textarea: 'Длинный текст',
    number: 'Число',
    email: 'Email',
    phone: 'Телефон',
    url: 'URL ссылка',
    radio: 'Один выбор',
    checkbox: 'Множественный',
    select: 'Dropdown',
    image_choice: 'Выбор картинки',
    rating: 'Звезды',
    scale: 'Шкала 1-5',
    slider: 'Слайдер',
    nps: 'NPS (0-10)',
    date: 'Дата',
    time: 'Время',
    datetime: 'Дата и время',
    boolean: 'Переключатель',
    yes_no: 'Да/Нет',
    matrix: 'Матрица',
    ranking: 'Ранжирование',
    constant_sum: 'Сумма = N',
    upload: 'Файл',
    signature: 'Подпись',
    location: 'Местоположение',
    divider: 'Разделитель',
    html: 'HTML блок'
  }
  return labels[type] || type
}
