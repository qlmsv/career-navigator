'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ArrowUp, ArrowDown, Settings, Scale } from 'lucide-react'

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

interface PsychologyTestBuilderProps {
  testId?: string
  onSave: (questions: PsychologyQuestion[]) => void
  initialQuestions?: PsychologyQuestion[]
}

export default function PsychologyTestBuilder({ 
  testId, 
  onSave, 
  initialQuestions = [] 
}: PsychologyTestBuilderProps) {
  const [questions, setQuestions] = useState<PsychologyQuestion[]>(initialQuestions)
  const [factors, setFactors] = useState<PersonalityFactor[]>([])
  const [scales, setScales] = useState<RatingScale[]>([])
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)

  // Загружаем факторы и шкалы
  useState(() => {
    loadFactors()
    loadScales()
  })

  const loadFactors = async () => {
    // Загружаем факторы личности из API
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
    // Загружаем шкалы оценок из API
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

  const addQuestion = () => {
    const newQuestion: PsychologyQuestion = {
      id: `temp_${Date.now()}`,
      question_text_ru: '',
      question_type: 'rating_scale',
      factor_id: null,
      rating_scale_id: null,
      scale_min: 1,
      scale_max: 5,
      scale_labels: {
        '1': 'Полностью не согласен',
        '2': 'Не согласен',
        '3': 'Нейтрально',
        '4': 'Согласен',
        '5': 'Полностью согласен'
      },
      points: 1,
      weight: 1.0,
      is_reverse: false,
      required: true,
      order_index: questions.length,
      explanation_ru: '',
      difficulty_level: 'medium'
    }
    setQuestions([...questions, newQuestion])
    setEditingQuestion(newQuestion.id)
  }

  const updateQuestion = (id: string, updates: Partial<PsychologyQuestion>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
    if (editingQuestion === id) {
      setEditingQuestion(null)
    }
  }

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id)
    if (index === -1) return

    const newQuestions = [...questions]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < questions.length) {
      [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]]
      // Обновляем order_index
      newQuestions.forEach((q, i) => {
        q.order_index = i
      })
      setQuestions(newQuestions)
    }
  }

  const getScaleLabels = (scale: RatingScale | null) => {
    if (!scale) return {}
    return scale.labels
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Вопросы психологического теста</h2>
        <Button onClick={addQuestion} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Добавить вопрос
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <CardTitle className="text-lg">
                    {question.question_text_ru || 'Новый вопрос'}
                  </CardTitle>
                  {question.is_reverse && (
                    <Badge variant="destructive">Обратный</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveQuestion(question.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveQuestion(question.id, 'down')}
                    disabled={index === questions.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingQuestion(
                      editingQuestion === question.id ? null : question.id
                    )}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteQuestion(question.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {editingQuestion === question.id && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`question-text-${question.id}`}>
                      Текст вопроса *
                    </Label>
                    <Textarea
                      id={`question-text-${question.id}`}
                      value={question.question_text_ru}
                      onChange={(e) => updateQuestion(question.id, {
                        question_text_ru: e.target.value
                      })}
                      placeholder="Введите текст вопроса..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`factor-${question.id}`}>
                      Фактор личности
                    </Label>
                    <Select
                      value={question.factor_id || ''}
                      onValueChange={(value) => updateQuestion(question.id, {
                        factor_id: value || null
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите фактор" />
                      </SelectTrigger>
                      <SelectContent>
                        {factors.map(factor => (
                          <SelectItem key={factor.id} value={factor.id}>
                            {factor.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`scale-${question.id}`}>
                      Шкала оценок
                    </Label>
                    <Select
                      value={question.rating_scale_id || ''}
                      onValueChange={(value) => {
                        const scale = scales.find(s => s.id === value)
                        updateQuestion(question.id, {
                          rating_scale_id: value || null,
                          scale_min: scale?.min_value || 1,
                          scale_max: scale?.max_value || 5,
                          scale_labels: scale?.labels || {}
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите шкалу" />
                      </SelectTrigger>
                      <SelectContent>
                        {scales.map(scale => (
                          <SelectItem key={scale.id} value={scale.id}>
                            {scale.name} ({scale.min_value}-{scale.max_value})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`difficulty-${question.id}`}>
                      Сложность
                    </Label>
                    <Select
                      value={question.difficulty_level}
                      onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                        updateQuestion(question.id, { difficulty_level: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Легкая</SelectItem>
                        <SelectItem value="medium">Средняя</SelectItem>
                        <SelectItem value="hard">Сложная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`weight-${question.id}`}>
                      Вес вопроса
                    </Label>
                    <Input
                      id={`weight-${question.id}`}
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="5.0"
                      value={question.weight}
                      onChange={(e) => updateQuestion(question.id, {
                        weight: parseFloat(e.target.value) || 1.0
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`points-${question.id}`}>
                      Баллы за ответ
                    </Label>
                    <Input
                      id={`points-${question.id}`}
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) => updateQuestion(question.id, {
                        points: parseInt(e.target.value) || 1
                      })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`reverse-${question.id}`}
                      checked={question.is_reverse}
                      onCheckedChange={(checked) => updateQuestion(question.id, {
                        is_reverse: !!checked
                      })}
                    />
                    <Label htmlFor={`reverse-${question.id}`}>
                      Обратный вопрос (инвертировать оценку)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`required-${question.id}`}
                      checked={question.required}
                      onCheckedChange={(checked) => updateQuestion(question.id, {
                        required: !!checked
                      })}
                    />
                    <Label htmlFor={`required-${question.id}`}>
                      Обязательный вопрос
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`explanation-${question.id}`}>
                    Объяснение (опционально)
                  </Label>
                  <Textarea
                    id={`explanation-${question.id}`}
                    value={question.explanation_ru}
                    onChange={(e) => updateQuestion(question.id, {
                      explanation_ru: e.target.value
                    })}
                    placeholder="Объяснение к вопросу..."
                    rows={2}
                  />
                </div>

                {/* Предварительный просмотр шкалы */}
                <div className="space-y-2">
                  <Label>Предварительный просмотр шкалы:</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Scale className="w-4 h-4 text-gray-500" />
                    <div className="flex gap-2">
                      {Array.from({ length: question.scale_max - question.scale_min + 1 }, (_, i) => {
                        const value = question.scale_min + i
                        const label = question.scale_labels[value.toString()] || value.toString()
                        return (
                          <div key={value} className="text-center">
                            <div className="w-8 h-8 border rounded-full flex items-center justify-center text-sm font-medium">
                              {value}
                            </div>
                            <div className="text-xs text-gray-600 mt-1 max-w-16">
                              {label}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {questions.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => onSave(questions)} size="lg">
            Сохранить вопросы
          </Button>
        </div>
      )}
    </div>
  )
}
