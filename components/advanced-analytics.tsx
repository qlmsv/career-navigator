'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  BarChart3, 
  Calendar,
  Award,
  AlertTriangle,
  Lightbulb,
  Download,
  Share2
} from 'lucide-react'
import { 
  FadeIn, 
  SlideIn, 
  StaggerContainer, 
  StaggerItem,
  ProgressBar 
} from '@/components/animated-transitions'
import { analyticsService, UserInsights, TestComparison } from '@/lib/analytics-service'
import { useAuth } from '@/components/auth-provider'

export function AdvancedAnalytics() {
  const [insights, setInsights] = useState<UserInsights | null>(null)
  const [comparison, setComparison] = useState<TestComparison | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user])

  const loadAnalytics = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [userInsights, testComparison] = await Promise.all([
        analyticsService.generateUserInsights(user.id),
        analyticsService.compareTestResults(user.id)
      ])

      setInsights(userInsights)
      setComparison(testComparison)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    // TODO: Implement PDF export
    console.log('Exporting report...')
  }

  const shareResults = () => {
    // TODO: Implement sharing
    console.log('Sharing results...')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Загружаем аналитику...</p>
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет данных для анализа</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Пройдите тест, чтобы увидеть подробную аналитику
            </p>
            <Button onClick={() => window.location.href = '/ai-assistant'}>
              Пройти тест
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <StaggerContainer>
      <StaggerItem>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Аналитика развития</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Подробный анализ вашего прогресса и рекомендации
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            <Button variant="outline" size="sm" onClick={shareResults}>
              <Share2 className="h-4 w-4 mr-2" />
              Поделиться
            </Button>
          </div>
        </div>
      </StaggerItem>

      <Tabs defaultValue="overview" className="space-y-6">
        <StaggerItem>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="progress">Прогресс</TabsTrigger>
            <TabsTrigger value="insights">Инсайты</TabsTrigger>
            <TabsTrigger value="recommendations">Рекомендации</TabsTrigger>
          </TabsList>
        </StaggerItem>

        <TabsContent value="overview" className="space-y-6">
          <StaggerItem>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Всего тестов</p>
                      <p className="text-2xl font-bold">{insights.totalTests}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Средний балл</p>
                      <p className="text-2xl font-bold">{insights.averageScore}%</p>
                    </div>
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Рост</p>
                      <p className={`text-2xl font-bold ${insights.improvementRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {insights.improvementRate >= 0 ? '+' : ''}{insights.improvementRate}%
                      </p>
                    </div>
                    {insights.improvementRate >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Частота тестов</p>
                      <p className="text-2xl font-bold">{insights.testFrequency}/мес</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </StaggerItem>

          <StaggerItem>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Доминирующий архетип
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {insights.favoriteArchetype}
                  </Badge>
                  <p className="text-slate-600 dark:text-slate-400">
                    Ваш основной архетип на основе всех пройденных тестов
                  </p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {comparison ? (
            <StaggerContainer>
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>Сравнение с предыдущим тестом</CardTitle>
                    <CardDescription>
                      Изменения в ваших показателях
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(comparison.improvements).map(([trait, change]) => (
                      <div key={trait} className="flex items-center justify-between">
                        <span className="capitalize">{trait}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? '+' : ''}{change}%
                          </span>
                          {change >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </StaggerItem>

              {Object.keys(comparison.changes).length > 0 && (
                <StaggerItem>
                  <Card>
                    <CardHeader>
                      <CardTitle>Значимые изменения</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Object.entries(comparison.changes).map(([key, change]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          <span>{change}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </StaggerItem>
              )}
            </StaggerContainer>
          ) : (
            <StaggerItem>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Нет данных для сравнения</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Пройдите еще один тест, чтобы увидеть прогресс
                    </p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <StaggerContainer>
            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Ваши сильные стороны
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {insights.strengths.map((strength, index) => (
                      <Badge key={index} variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Области для развития
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {insights.weaknesses.map((weakness, index) => (
                      <Badge key={index} variant="outline" className="border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <StaggerItem>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Персональные рекомендации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </TabsContent>
      </Tabs>
    </StaggerContainer>
  )
}
