'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'

interface TestViewerProps {
  schema: any
  onSubmit: (values: any) => void | Promise<void>
  submitting?: boolean
}

export default function SimpleTestViewer({ schema, onSubmit, submitting }: TestViewerProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (fieldName: string, value: any) => {
    setAnswers(prev => ({ ...prev, [fieldName]: value }))
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Валидация обязательных полей
    const newErrors: Record<string, string> = {}
    const properties = schema.properties || {}

    Object.entries(properties).forEach(([key, field]: [string, any]) => {
      if (field.required && !answers[key] && field.type !== 'void') {
        newErrors[key] = 'Обязательное поле'
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      alert('Пожалуйста, ответьте на все обязательные вопросы')
      return
    }

    await onSubmit(answers)
  }

  const renderField = (key: string, field: any) => {
    // Пропускаем void поля (информационные блоки)
    if (field.type === 'void') {
      return (
        <Card key={key} className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="whitespace-pre-line text-sm text-blue-900 dark:text-blue-100">
              {field['x-content'] || field.title}
            </div>
          </CardContent>
        </Card>
      )
    }

    const component = field['x-component']
    const componentProps = field['x-component-props'] || {}
    const value = answers[key]
    const hasError = !!errors[key]

    return (
      <div key={key} className="space-y-3">
        <Label className="text-base font-medium">
          {field.title}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {field.description && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}

        {/* Текст */}
        {component === 'Input' && (
          <Input
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={componentProps.placeholder}
            className={hasError ? 'border-red-500' : ''}
          />
        )}

        {/* Многострочный текст */}
        {component === 'Input.TextArea' && (
          <Textarea
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={componentProps.placeholder}
            rows={componentProps.rows || 4}
            className={hasError ? 'border-red-500' : ''}
          />
        )}

        {/* Число */}
        {component === 'InputNumber' && (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(key, Number(e.target.value))}
            min={componentProps.min}
            max={componentProps.max}
            step={componentProps.step}
            className={hasError ? 'border-red-500' : ''}
          />
        )}

        {/* Radio */}
        {component === 'Radio.Group' && (
          <RadioGroup
            value={value || ''}
            onValueChange={(val) => handleChange(key, val)}
          >
            {(field.enum || []).map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${key}-${option.value}`} />
                <Label htmlFor={`${key}-${option.value}`} className="font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {/* Checkbox Group */}
        {component === 'Checkbox.Group' && (
          <div className="space-y-2">
            {(field.enum || []).map((option: any) => {
              const checked = Array.isArray(value) && value.includes(option.value)
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${key}-${option.value}`}
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      const currentValues = Array.isArray(value) ? value : []
                      const newValues = isChecked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: any) => v !== option.value)
                      handleChange(key, newValues)
                    }}
                  />
                  <Label htmlFor={`${key}-${option.value}`} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              )
            })}
          </div>
        )}

        {/* Slider (ШКАЛА) */}
        {component === 'Slider' && (
          <div className="space-y-4">
            <Slider
              value={[value || componentProps.min || 1]}
              onValueChange={(vals) => handleChange(key, vals[0])}
              min={componentProps.min || 1}
              max={componentProps.max || 5}
              step={componentProps.step || 1}
              className="w-full"
            />
            {/* Метки */}
            {componentProps.marks && (
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                {Object.entries(componentProps.marks).map(([markValue, markLabel]: [string, any]) => (
                  <span key={markValue}>{markLabel}</span>
                ))}
              </div>
            )}
            {/* Текущее значение */}
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                {value || componentProps.min || 1}
              </span>
            </div>
          </div>
        )}

        {/* Rate (ЗВЕЗДОЧКИ) */}
        {component === 'Rate' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              {Array.from({ length: componentProps.count || 5 }, (_, i) => i + 1).map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleChange(key, star)}
                  className={`text-3xl transition-all hover:scale-110 ${
                    value >= star ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {value && (
              <p className="text-sm text-muted-foreground">
                Ваша оценка: {value} из {componentProps.count || 5}
              </p>
            )}
          </div>
        )}

        {hasError && (
          <p className="text-sm text-red-500">{errors[key]}</p>
        )}
      </div>
    )
  }

  const properties = schema.properties || {}

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {Object.entries(properties).map(([key, field]) => renderField(key, field))}

      <div className="flex justify-center pt-8">
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full max-w-md"
        >
          {submitting ? 'Отправка...' : 'Отправить ответы'}
        </Button>
      </div>
    </form>
  )
}
