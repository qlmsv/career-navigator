'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Brain,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { careerAssessmentService } from '@/lib/services/career-assessment'
import type { UserSkillAssessment, AssessmentResult, CareerRecommendations } from '@/lib/types/career-navigator'

export default function AssessmentResultsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const assessmentId = params['id'] as string
  
  const [assessment, setAssessment] = useState<UserSkillAssessment | null>(null)
  const [results, setResults] = useState<AssessmentResult | null>(null)
  const [recommendations, setRecommendations] = useState<CareerRecommendations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (!assessmentId) {
      setError('ID диагностики не найден')
      return
    }

    const loadResults = async () => {
      try {
        setLoading(true)
        const assessmentData = await careerAssessmentService.getAssessmentById(assessmentId)
        
        if (!assessmentData) {
          setError('Результаты диагностики не найдены')
          return
        }

        if (!assessmentData.is_completed) {
          setError('Диагностика не завершена')
          return
        }

        setAssessment(assessmentData)

        // Рассчитываем результаты (здесь упрощенная версия)
        const mockResults: AssessmentResult = {
          overall_score: assessmentData.overall_score || 75,
          competitiveness_level: assessmentData.competitiveness_level || 'average',
          skill_results: {},
          strengths: [],
          improvement_areas: [],
          market_comparison: {
            salary_potential_min: 50000,
            salary_potential_max: 120000,
            competition_level: 'medium',
            demand_trend: 'growing'
          }
        }

        setResults(mockResults)

        // Генерируем рекомендации
        const mockRecommendations = await careerAssessmentService.generateRecommendations(assessmentId)
        setRecommendations(mockRecommendations)

      } catch (err) {
        setError('Ошибка загрузки результатов')
        console.error('Failed to load assessment results:', err)
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [user, router, assessmentId])

  const getCompetitivenessColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 dark:text-green-400'
      case 'above_average': return 'text-blue-600 dark:text-blue-400'
      case 'average': return 'text-yellow-600 dark:text-yellow-400'
      case 'below_average': return 'text-orange-600 dark:text-orange-400'
      case 'low': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getCompetitivenessText = (level: string) => {
    switch (level) {
      case 'high': return 'Высокая конкурентоспособность'
      case 'above_average': return 'Выше среднего'
      case 'average': return 'Средняя конкурентоспособность'
      case 'below_average': return 'Ниже среднего'
      case 'low': return 'Низкая конкурентоспособность'
      default: return 'Не определена'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Загрузка результатов...</p>
        </div>
      </div>
    )
  }

  if (error || !assessment || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/assessment-history')}>
              Вернуться к истории
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/assessment-history')}
                className="text-slate-600 dark:text-slate-400"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                История
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Результаты диагностики
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date(assessment.created_at).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/skills-assessment')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Новая диагностика
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Общая оценка конкурентоспособности
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold mb-2 text-slate-900 dark:text-white">
                    {Math.round(results.overall_score)}%
                  </div>
                  <div className={`text-xl font-semibold ${getCompetitivenessColor(results.competitiveness_level)}`}>
                    {getCompetitivenessText(results.competitiveness_level)}
                  </div>
                </div>
                <Progress value={results.overall_score} className="h-3 mb-4" />
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {results.market_comparison.salary_potential_min.toLocaleString()} ₽
                    </div>
                    <div className="text-xs text-slate-500">Мин. зарплата</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {results.market_comparison.salary_potential_max.toLocaleString()} ₽
                    </div>
                    <div className="text-xs text-slate-500">Макс. зарплата</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {results.market_comparison.demand_trend === 'growing' ? 'Растущий' : 'Стабильный'}
                    </div>
                    <div className="text-xs text-slate-500">Тренд спроса</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths and Improvements */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    Сильные стороны
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {results.strengths.length > 0 ? (
                    <div className="space-y-2">
                      {results.strengths.slice(0, 5).map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{skill.name_ru}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Сильные стороны будут определены после анализа
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="w-5 h-5" />
                    Области для развития
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {results.improvement_areas.length > 0 ? (
                    <div className="space-y-2">
                      {results.improvement_areas.slice(0, 5).map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          <span className="text-sm">{skill.name_ru}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Области для развития будут определены после анализа
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Рекомендации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Приоритетные навыки
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Развитие Excel и работы с данными может увеличить зарплату на 15-25%
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      Курсы обучения
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Рекомендуем 3 курса для развития ключевых навыков
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                      План развития
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Персональный план на 6 месяцев для достижения целей
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Следующие шаги
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Просмотреть курсы
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Скачать план развития
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="w-4 h-4 mr-2" />
                    Поделиться результатами
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
