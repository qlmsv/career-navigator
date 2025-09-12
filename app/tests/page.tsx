'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, Star, Play } from 'lucide-react'
import { supabase } from '@/lib/supabase-browser'
import Link from 'next/link'

interface Test {
  id: string
  title_ru: string
  description_ru: string
  time_limit_minutes: number | null
  passing_score: number
  total_questions: number
  total_attempts: number
  average_score: number | null
  category: {
    name_ru: string
    color: string
    icon: string
  }
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')


  useEffect(() => {
    loadTests()
    loadCategories()
  }, [selectedCategory])

  const loadTests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tests')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      let filteredTests = (result.data || [])
        .filter(test => test.status === 'published' && test.is_public)
        .map(test => {
          const category = Array.isArray(test.category) ? test.category[0] : test.category
          return {
            ...test,
            category: category || { name_ru: 'Без категории', color: '#6b7280', icon: '📝' }
          }
        })
      
      if (selectedCategory) {
        // Фильтруем по категории (нужно будет добавить category_id в запрос)
      }

      setTests(filteredTests)
    } catch (error) {
      console.error('Ошибка загрузки тестов:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('test_categories')
        .select('id, name_ru, color, icon')
        .eq('is_active', true)
        .order('name_ru')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Загрузка тестов...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Доступные тесты</h1>
          <p className="text-muted-foreground">
            Выберите тест для прохождения и проверьте свои знания
          </p>
        </div>

        {/* Фильтры по категориям */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('')}
              size="sm"
            >
              Все категории
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                size="sm"
                className="flex items-center gap-2"
              >
                <span>{category.icon}</span>
                {category.name_ru}
              </Button>
            ))}
          </div>
        </div>

        {/* Список тестов */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{test.category?.icon}</span>
                    <Badge 
                      variant="secondary" 
                      style={{ backgroundColor: test.category?.color + '20', color: test.category?.color }}
                    >
                      {test.category?.name_ru}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{test.title_ru}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  {test.description_ru}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {test.total_attempts} попыток
                  </div>
                  {test.time_limit_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {test.time_limit_minutes} мин
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {test.total_questions} вопросов
                  </div>
                </div>

                {test.average_score && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Средний балл: </span>
                    <span className="font-medium">{test.average_score.toFixed(1)}%</span>
                  </div>
                )}

                <div className="text-sm">
                  <span className="text-muted-foreground">Проходной балл: </span>
                  <span className="font-medium">{test.passing_score}%</span>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/tests/${test.id}`}>
                    <Play className="h-4 w-4 mr-2" />
                    Начать тест
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {tests.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Тесты не найдены</h3>
            <p className="text-muted-foreground">
              В данный момент нет доступных тестов для прохождения
            </p>
          </div>
        )}
      </div>
    </div>
  )
}