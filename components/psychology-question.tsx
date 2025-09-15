'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Scale, RotateCcw } from 'lucide-react'

interface PsychologyQuestionProps {
  question: {
    id: string
    question_text_ru: string
    question_type: 'rating_scale' | 'matrix_rating'
    scale_min: number
    scale_max: number
    scale_labels: { [key: string]: string }
    is_reverse: boolean
    required: boolean
    explanation_ru?: string
    personality_factors?: {
      name: string
      display_name: string
    }
  }
  value?: number
  onChange: (value: number) => void
  questionNumber: number
  totalQuestions: number
}

export default function PsychologyQuestion({
  question,
  value,
  onChange,
  questionNumber,
  totalQuestions
}: PsychologyQuestionProps) {
  const [selectedValue, setSelectedValue] = useState<number | undefined>(value)

  const handleValueChange = (newValue: number) => {
    setSelectedValue(newValue)
    onChange(newValue)
  }

  const scaleRange = question.scale_max - question.scale_min + 1
  const scaleValues = Array.from({ length: scaleRange }, (_, i) => question.scale_min + i)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline">Вопрос {questionNumber} из {totalQuestions}</Badge>
            {question.is_reverse && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                Обратный
              </Badge>
            )}
            {question.personality_factors && (
              <Badge variant="secondary">
                {question.personality_factors.display_name}
              </Badge>
            )}
          </div>
          {question.required && (
            <Badge variant="destructive">Обязательный</Badge>
          )}
        </div>
        <CardTitle className="text-lg leading-relaxed">
          {question.question_text_ru}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Шкала оценок */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Scale className="w-4 h-4" />
            <span>Выберите наиболее подходящий вариант:</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {scaleValues.map((scaleValue) => {
              const isSelected = selectedValue === scaleValue
              const label = question.scale_labels[scaleValue.toString()] || scaleValue.toString()
              
              return (
                <Button
                  key={scaleValue}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-center gap-2 min-h-[100px] ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleValueChange(scaleValue)}
                >
                  <div className="text-2xl font-bold">
                    {scaleValue}
                  </div>
                  <div className="text-xs text-center leading-tight">
                    {label}
                  </div>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Объяснение */}
        {question.explanation_ru && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Пояснение:</strong> {question.explanation_ru}
            </p>
          </div>
        )}

        {/* Индикатор прогресса */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Прогресс: {questionNumber} из {totalQuestions}</span>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
