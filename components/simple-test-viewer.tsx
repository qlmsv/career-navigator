'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Progress } from './ui/progress'

interface TestViewerProps {
  schema: any
  onSubmit: (values: any) => void | Promise<void>
  submitting?: boolean
}

const simpleHash = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

export default function SimpleTestViewer({ schema, onSubmit, submitting }: TestViewerProps) {
  const { toast } = useToast()
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const storageKey = useMemo(() => {
    try {
      const schemaString = JSON.stringify(schema)
      const hash = simpleHash(schemaString)
      return `test-answers-${hash}`
    } catch (e) {
      return `test-answers-fallback`
    }
  }, [schema])

  // Загрузка ответов из localStorage при монтировании
  useEffect(() => {
    try {
      const savedAnswers = localStorage.getItem(storageKey)
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers))
        toast({
          title: 'Прогресс восстановлен',
          description: 'Ваши предыдущие ответы были загружены.',
        })
      }
    } catch (error) {
      console.error('Failed to load answers from localStorage', error)
    }
  }, [storageKey, toast])

  // Сохранение ответов в localStorage при изменении
  useEffect(() => {
    try {
      if (Object.keys(answers).length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(answers))
      }
    } catch (error) {
      console.error('Failed to save answers to localStorage', error)
    }
  }, [answers, storageKey])

  const handleChange = (fieldName: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldName]: value }))
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    const properties = schema.properties || {}

    Object.entries(properties).forEach(([key, field]: [string, any]) => {
      if (field.required && field.type !== 'void') {
        const value = answers[key]
        if (
          value === undefined ||
          value === null ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'string' && value.trim() === '')
        ) {
          newErrors[key] = 'Это обязательный вопрос'
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        variant: 'destructive',
        title: 'Не все поля заполнены',
        description: 'Пожалуйста, ответьте на все обязательные вопросы.',
      })
      return
    }

    await onSubmit(answers)
  }

  const memoizedProperties = useMemo(() => schema.properties || {}, [schema])

  const { totalQuestions, answeredQuestions } = useMemo(() => {
    const questionKeys = Object.keys(memoizedProperties).filter(
      (key) => memoizedProperties[key].type !== 'void',
    )
    const answeredCount = questionKeys.filter((key) => {
      const answer = answers[key]
      return (
        answer !== undefined &&
        answer !== null &&
        answer !== '' &&
        (!Array.isArray(answer) || answer.length > 0)
      )
    }).length
    return { totalQuestions: questionKeys.length, answeredQuestions: answeredCount }
  }, [answers, memoizedProperties])

  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  const renderField = (key: string, field: any) => {
    // Пропускаем void поля (информационные блоки)
    if (field.type === 'void') {
      return (
        <Card
          key={key}
          className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
        >
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
        {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}

        {/* Текст */}
        {component === 'Input' && (
          <Input
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={componentProps.placeholder}
            className={hasError ? 'border-red-500' : ''}
          />
        )}

        {/* Email */}
        {component === 'Input.Email' && (
          <Input
            type="email"
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={componentProps.placeholder || 'name@example.com'}
            className={hasError ? 'border-red-500' : ''}
          />
        )}

        {/* Phone */}
        {component === 'Input.Phone' && (
          <Input
            type="tel"
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={componentProps.placeholder || '+7 900 000-00-00'}
            className={hasError ? 'border-red-500' : ''}
          />
        )}

        {/* URL */}
        {component === 'Input.URL' && (
          <Input
            type="url"
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={componentProps.placeholder || 'https://...'}
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
          <RadioGroup value={value || ''} onValueChange={(val) => handleChange(key, val)}>
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

        {/* Select */}
        {component === 'Select' && (
          <Select value={value || ''} onValueChange={(val) => handleChange(key, val)}>
            <SelectTrigger className={hasError ? 'border-red-500' : ''}>
              <SelectValue placeholder={componentProps.placeholder || 'Выберите...'} />
            </SelectTrigger>
            <SelectContent>
              {(field.enum || []).map((option: any) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Switch */}
        {component === 'Switch' && (
          <div className="flex items-center gap-2">
            <Switch checked={!!value} onCheckedChange={(v) => handleChange(key, v)} />
            <span className="text-sm text-muted-foreground">{componentProps.helpText}</span>
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
                {Object.entries(componentProps.marks).map(
                  ([markValue, markLabel]: [string, any]) => (
                    <span key={markValue}>{markLabel}</span>
                  ),
                )}
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

        {/* DatePicker */}
        {component === 'DatePicker' && (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        )}

        {/* TimePicker */}
        {component === 'TimePicker' && (
          <Input
            type="time"
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        )}

        {/* DateTimePicker */}
        {component === 'DateTimePicker' && (
          <Input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        )}

        {/* Image Choice */}
        {component === 'ImageChoice' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(field.enum || []).map((option: any) => {
              const selected = value === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange(key, option.value)}
                  className={`border rounded-lg overflow-hidden text-left ${selected ? 'border-primary ring-2 ring-primary/30' : 'border-muted'}`}
                >
                  {option.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={option.image}
                      alt={option.label}
                      className="w-full h-28 object-cover"
                    />
                  )}
                  <div className="p-2 text-sm">{option.label}</div>
                </button>
              )
            })}
          </div>
        )}

        {/* NPS 0-10 */}
        {component === 'NPS' && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`px-3 py-2 rounded border ${value === n ? 'bg-primary text-primary-foreground border-primary' : 'border-muted'}`}
                  onClick={() => handleChange(key, n)}
                >
                  {n}
                </button>
              ))}
            </div>
            {typeof value === 'number' && (
              <p className="text-xs text-muted-foreground">Вероятность рекомендации: {value}</p>
            )}
          </div>
        )}

        {/* Upload */}
        {component === 'Upload' && (
          <Input type="file" onChange={(e) => handleChange(key, e.target.files?.[0] || null)} />
        )}

        {/* Signature (простая текстовая) */}
        {component === 'Signature' && (
          <Input
            placeholder={componentProps.placeholder || 'Введите ФИО'}
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        )}

        {/* Location (строкой) */}
        {component === 'Location' && (
          <Input
            placeholder={componentProps.placeholder || 'Город, адрес или координаты'}
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        )}

        {/* Matrix (упрощенная) */}
        {component === 'Matrix' && (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2"></th>
                  {(componentProps.columns || []).map((col: any) => (
                    <th key={col.value} className="text-center px-2 py-2">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(componentProps.rows || []).map((row: any) => (
                  <tr key={row.value} className="border-t">
                    <td className="py-2 pr-2">{row.label}</td>
                    {(componentProps.columns || []).map((col: any) => {
                      const selected = Array.isArray(value)
                        ? value.find((v: any) => v?.row === row.value)?.col === col.value
                        : false
                      return (
                        <td key={col.value} className="text-center py-2">
                          <input
                            type="radio"
                            name={`${key}-${row.value}`}
                            checked={selected}
                            onChange={() => {
                              const current = Array.isArray(value) ? value : []
                              const filtered = current.filter((v: any) => v?.row !== row.value)
                              handleChange(key, [...filtered, { row: row.value, col: col.value }])
                            }}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Ranking (упрощенная без DnD) */}
        {component === 'Ranking' && (
          <div className="space-y-2">
            {((field.enum as any[]) || []).map((opt) => (
              <div
                key={opt.value}
                className="flex items-center justify-between border rounded px-3 py-2"
              >
                <span>{opt.label}</span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const current = Array.isArray(value) ? value : []
                      const idx = current.indexOf(opt.value)
                      if (idx > 0) {
                        const cp = [...current]
                        ;[cp[idx - 1], cp[idx]] = [cp[idx], cp[idx - 1]]
                        handleChange(key, cp)
                      }
                    }}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const current = Array.isArray(value) ? value : []
                      const idx = current.indexOf(opt.value)
                      if (idx >= 0 && idx < current.length - 1) {
                        const cp = [...current]
                        ;[cp[idx + 1], cp[idx]] = [cp[idx], cp[idx + 1]]
                        handleChange(key, cp)
                      }
                    }}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const current = Array.isArray(value) ? value : []
                      if (!current.includes(opt.value)) handleChange(key, [...current, opt.value])
                    }}
                  >
                    Добавить
                  </Button>
                </div>
              </div>
            ))}
            {Array.isArray(value) && value.length > 0 && (
              <p className="text-xs text-muted-foreground">Текущий порядок: {value.join(', ')}</p>
            )}
          </div>
        )}

        {/* Constant Sum */}
        {component === 'ConstantSum' && (
          <div className="space-y-2">
            {(componentProps.items || []).map((item: any, idx: number) => (
              <div key={item.value} className="flex items-center gap-2">
                <span className="w-40 text-sm">{item.label}</span>
                <Input
                  type="number"
                  value={(value?.[item.value] ?? 0).toString()}
                  onChange={(e) => {
                    const num = Number(e.target.value || 0)
                    const current = value || {}
                    handleChange(key, { ...current, [item.value]: num })
                  }}
                />
              </div>
            ))}
            {value && (
              <p className="text-xs text-muted-foreground">
                Сумма: {Object.values(value).reduce((a: any, b: any) => Number(a) + Number(b), 0)} /{' '}
                {componentProps.total || 100}
              </p>
            )}
          </div>
        )}

        {hasError && <p className="text-sm text-red-500">{errors[key]}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="sticky top-4 z-20 shadow-lg bg-background/95 backdrop-blur-sm p-4 border-2">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Прогресс</p>
            <Progress value={progressPercentage} className="mt-1 h-2" />
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">
              {answeredQuestions}/{totalQuestions}
            </p>
            <p className="text-xs text-muted-foreground">вопросов</p>
          </div>
        </div>
      </Card>

      {Object.entries(memoizedProperties).map(([key, field]) => renderField(key, field))}

      <div className="flex justify-center pt-8">
        <Button type="submit" size="lg" disabled={submitting} className="w-full max-w-md">
          {submitting ? 'Отправка...' : 'Отправить ответы'}
        </Button>
      </div>
    </form>
  )
}
