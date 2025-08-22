'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { testService, TestResult } from '@/lib/test-service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import TestResultsEnhanced from '@/components/test-results-enhanced'

export default function TestResultPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const testId = params['id'] as string
  
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !testId) return

    const loadTestResult = async () => {
      try {
        const result = await testService.loadTestResult(testId)
        if (!result) {
          setError('Результат теста не найден')
          return
        }
        setTestResult(result)
      } catch (err) {
        setError('Ошибка загрузки результата теста')
        console.error('Failed to load test result:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTestResult()
  }, [user, testId])

  const handleRestart = () => {
    router.push('/ai-assistant')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-slate-900 dark:text-white">Необходимо войти в систему</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-slate-900 dark:text-white">Загрузка результата теста...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !testResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Результат теста не найден'}</p>
            <div className="space-x-4">
              <Button onClick={() => router.back()} variant="outline" className="border-slate-300 dark:border-white/20 text-slate-700 dark:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              <Button onClick={() => router.push('/test-history')} className="bg-gradient-to-r from-blue-500 to-purple-600">
                К истории тестов
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Логируем что приходит из базы
  console.log('TestResult from DB:', testResult)
  console.log('Big Five scores from DB:', testResult.big_five_scores)
  
  // Используем реальные данные из AI анализа или создаем fallback
  const aiAnalysis = testResult.ai_analysis || {}
  
  const report = JSON.stringify({
    // Используем данные из AI анализа или создаем базовые
    archetype: aiAnalysis.archetype || {
      primary: testResult.dominant_archetype,
      description: `Архетип ${testResult.dominant_archetype}`,
      strengths: ['Сильная сторона 1', 'Сильная сторона 2'],
      growth_areas: ['Область роста 1', 'Область роста 2']
    },
    big5_scores: aiAnalysis.big5_scores || testResult.big_five_scores || {},
    personality_insights: aiAnalysis.personality_insights || {
      openness: `Открытость: ${testResult.big_five_scores?.openness || 0}%`,
      conscientiousness: `Добросовестность: ${testResult.big_five_scores?.conscientiousness || 0}%`,
      extraversion: `Экстраверсия: ${testResult.big_five_scores?.extraversion || 0}%`,
      agreeableness: `Доброжелательность: ${testResult.big_five_scores?.agreeableness || 0}%`,
      neuroticism: `Эмоциональная стабильность: ${testResult.big_five_scores?.neuroticism || 0}%`
    },
    career_paths: aiAnalysis.career_paths || [
      {
        title: 'Рекомендуемая роль',
        description: 'Описание роли на основе вашего профиля',
        companies: ['Компания 1', 'Компания 2', 'Компания 3']
      }
    ],
    educational_recommendations: aiAnalysis.educational_recommendations || [
      {
        area: 'Область развития',
        recommendation: 'Рекомендация по развитию'
      }
    ],
    action_plan: aiAnalysis.action_plan || [
      {
        title: 'Действие 1',
        description: 'Описание действия'
      }
    ],
    swot_analysis: aiAnalysis.swot_analysis || {
      strengths: ['Сила 1', 'Сила 2', 'Сила 3'],
      weaknesses: ['Слабость 1', 'Слабость 2'],
      opportunities: ['Возможность 1', 'Возможность 2', 'Возможность 3'],
      threats: ['Угроза 1', 'Угроза 2']
    },
    summary: aiAnalysis.summary || `Результаты теста от ${new Date(testResult.test_date).toLocaleDateString('ru-RU')}. Доминирующий архетип: ${testResult.dominant_archetype}.`
  })

  return (
    <TestResultsEnhanced
      report={report}
      onRestart={handleRestart}
    />
  )
}
