'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Users, Clock, CheckCircle, Zap, Shield, BarChart } from 'lucide-react'
import Link from 'next/link'
import { useAdmin } from '@/lib/auth'
import type { Test } from '@/lib/types'

export default function HomePage() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const { isAdmin } = useAdmin()

  useEffect(() => {
    loadTests()
  }, [])

  const loadTests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tests')
      const result = await response.json()
      if (result.success) {
        setTests(result.data || [])
      }
    } catch (error) {
      console.error('Error loading tests:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">К</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Карьерный Навигатор
                </h1>
                <p className="text-xs text-muted-foreground">Оценка карьерного потенциала</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <>
                  <Badge variant="default" className="hidden sm:flex">
                    Администратор
                  </Badge>
                  <Button asChild>
                    <Link href="/admin">Панель управления</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4 px-4 py-1">
              🎯 Оценка карьерного потенциала
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Узнайте свой
            <br />
            карьерный потенциал
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Пройдите тесты для самодиагностики конкурентоспособности на рынке труда. Оцените свои
            навыки и получите персональные рекомендации по развитию карьеры.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {tests.length > 0 && (
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="#tests">
                  <Play className="mr-2 h-5 w-5" />
                  Начать оценку
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 hover:border-blue-500 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Комплексная оценка</CardTitle>
              <CardDescription>
                Оцените свои профессиональные компетенции, личностные качества и навыки через
                психометрические тесты.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-500 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Региональный анализ</CardTitle>
              <CardDescription>
                Сравните ваши навыки с требованиями рынка труда вашего региона России.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-pink-500 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <CardTitle>Персональные рекомендации</CardTitle>
              <CardDescription>
                Получите индивидуальные рекомендации по развитию карьеры на основе ваших
                результатов.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Tests Section */}
      <section id="tests" className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Тесты для самодиагностики</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Выберите тест для оценки ваших компетенций и личностных качеств. Тесты содержат как известные методики, так и материалы, разработанные авторами на основе статистических данных Росстата с применением экономико-статистического моделирования. По результатам вы
            получите подробный анализ и рекомендации для развития карьеры.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка тестов...</p>
          </div>
        ) : tests.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 text-6xl">📝</div>
              <h3 className="text-lg font-semibold mb-2">Тесты не найдены</h3>
              <p className="text-muted-foreground mb-4">В данный момент нет доступных тестов</p>
              {isAdmin && (
                <Button asChild>
                  <Link href="/admin/tests/create">Создать первый тест</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {tests.map((test) => (
              <Card
                key={test.id}
                className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-500"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{test.title}</CardTitle>
                    {test.total_responses > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {test.total_responses}
                      </Badge>
                    )}
                  </div>
                  {test.description && (
                    <CardDescription className="line-clamp-2">{test.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {test.time_limit_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{test.time_limit_minutes} мин</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Мгновенный результат</span>
                    </div>
                  </div>

                  <Button asChild className="w-full" size="lg">
                    <Link href={`/tests/${test.id}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Начать тест
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="container mx-auto px-6 py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 -mx-6">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Как это работает</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Пройдите тест</h3>
              <p className="text-sm text-muted-foreground">
                Выберите тест и ответьте на вопросы. Это займет 15-30 минут.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Получите анализ</h3>
              <p className="text-sm text-muted-foreground">
                Мгновенно получите детальный анализ ваших компетенций и навыков.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-pink-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Развивайте карьеру</h3>
              <p className="text-sm text-muted-foreground">
                Следуйте персональным рекомендациям для улучшения конкурентоспособности.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center gap-6">
            {/* Grant Information */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Проект поддержан грантом Российского научного фонда № 23-78-10165,{' '}
                <a
                  href="https://rscf.ru/project/23-78-10165/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  https://rscf.ru/project/23-78-10165/
                </a>
              </p>
            </div>

            {/* Main Footer Content */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">
                  © 2026 Карьерный Навигатор. Самодиагностика конкурентоспособности на рынке труда
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">Психометрические тесты</Badge>
                <Badge variant="outline">Региональный анализ</Badge>
                <Badge variant="outline">Персональные рекомендации</Badge>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
