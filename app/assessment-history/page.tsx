'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Eye, 
  ArrowLeft, 
  Brain,
  Target,
  Plus
} from 'lucide-react'
import { careerAssessmentService } from '@/lib/services/career-assessment'
import type { UserSkillAssessment } from '@/lib/types/career-navigator'

export default function AssessmentHistoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [assessments, setAssessments] = useState<UserSkillAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    const loadHistory = async () => {
      try {
        setLoading(true)
        const history = await careerAssessmentService.getUserAssessments(user.id)
        setAssessments(history)
      } catch (err) {
        setError('Ошибка загрузки истории диагностик')
        console.error('Failed to load assessment history:', err)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCompetitivenessColor = (level?: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'above_average': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'average': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'below_average': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'low': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getCompetitivenessText = (level?: string) => {
    switch (level) {
      case 'high': return 'Высокая'
      case 'above_average': return 'Выше среднего'
      case 'average': return 'Средняя'
      case 'below_average': return 'Ниже среднего'
      case 'low': return 'Низкая'
      default: return 'Не определена'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Загрузка истории...</p>
        </div>
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
                onClick={() => router.push('/dashboard')}
                className="text-slate-600 dark:text-slate-400"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Дашборд
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  История диагностик
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Просмотр всех пройденных самодиагностик навыков
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/skills-assessment')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Новая диагностика
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {assessments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Нет пройденных диагностик
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Пройдите первую самодиагностику цифровых навыков, чтобы узнать свою конкурентоспособность
              </p>
              <Button
                onClick={() => router.push('/skills-assessment')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Brain className="w-4 h-4 mr-2" />
                Начать диагностику
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Диагностика от {formatDate(assessment.created_at)}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(assessment.created_at).toLocaleDateString('ru-RU')}
                          </div>
                          {assessment.assessment_duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {Math.round(assessment.assessment_duration / 60)} мин
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {assessment.overall_score && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {Math.round(assessment.overall_score)}%
                          </div>
                          <div className="text-xs text-slate-500">Общий балл</div>
                        </div>
                      )}
                      <Badge 
                        className={`${getCompetitivenessColor(assessment.competitiveness_level)} border-0`}
                      >
                        {getCompetitivenessText(assessment.competitiveness_level)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-semibold text-slate-900 dark:text-white">
                        {assessment.current_profession?.name_ru || 'Не указано'}
                      </div>
                      <div className="text-xs text-slate-500">Текущая профессия</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-semibold text-slate-900 dark:text-white">
                        {assessment.region?.name_ru || 'Не указано'}
                      </div>
                      <div className="text-xs text-slate-500">Регион</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-semibold text-slate-900 dark:text-white">
                        {assessment.experience_years || 0} лет
                      </div>
                      <div className="text-xs text-slate-500">Опыт работы</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className={`w-3 h-3 rounded-full ${
                        assessment.is_completed ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      {assessment.is_completed ? 'Завершено' : 'В процессе'}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/assessment-results/${assessment.id}`)}
                      disabled={!assessment.is_completed}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Посмотреть результаты
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
