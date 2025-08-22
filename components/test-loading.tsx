'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Brain, Sparkles, BarChart3, Target, TrendingUp } from 'lucide-react'

const loadingSteps = [
  {
    id: 1,
    icon: Brain,
    title: 'Анализируем ваши ответы',
    description: 'Обработка психологических паттернов',
    duration: 2000,
  },
  {
    id: 2,
    icon: BarChart3,
    title: 'Строим профиль личности',
    description: 'Расчет показателей Big Five',
    duration: 1500,
  },
  {
    id: 3,
    icon: Target,
    title: 'Определяем архетип',
    description: 'Анализ по модели Юнга',
    duration: 1500,
  },
  {
    id: 4,
    icon: TrendingUp,
    title: 'Генерируем рекомендации',
    description: 'AI создает персональный план развития',
    duration: 2000,
  },
  {
    id: 5,
    icon: Sparkles,
    title: 'Финализируем отчет',
    description: 'Подготовка к отображению',
    duration: 1000,
  },
]

export default function TestLoading() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let stepTimeout: NodeJS.Timeout
    let progressInterval: NodeJS.Timeout

    const startStep = (stepIndex: number) => {
      if (stepIndex >= loadingSteps.length) return

      const stepObj = loadingSteps[stepIndex]
      if (!stepObj) return
      const stepProgress = (stepIndex / loadingSteps.length) * 100
      const nextStepProgress = ((stepIndex + 1) / loadingSteps.length) * 100

      setCurrentStep(stepIndex)

      // Анимация прогресса для текущего шага
      let currentProgress = stepProgress
      const stepDuration = stepObj.duration
      progressInterval = setInterval(() => {
        currentProgress += (nextStepProgress - stepProgress) / (stepDuration / 50)
        setProgress(Math.min(currentProgress, nextStepProgress))
      }, 50)

      // Переход к следующему шагу
      stepTimeout = setTimeout(() => {
        clearInterval(progressInterval)
        setProgress(nextStepProgress)
        startStep(stepIndex + 1)
      }, stepDuration)
    }

    startStep(0)

    return () => {
      clearTimeout(stepTimeout)
      clearInterval(progressInterval)
    }
  }, [])

  const currentStepData = loadingSteps[currentStep]
  const Icon = currentStepData?.icon || Brain

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 flex items-center justify-center p-6">
      <Card className="max-w-md w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          {/* Animated Icon */}
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
              <Icon className="h-10 w-10 text-white" />
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-blue-500/30 rounded-full animate-spin border-t-blue-500"></div>
          </div>

          {/* Step Info */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {currentStepData?.title}
            </h2>
            <p className="text-sm text-muted-foreground">{currentStepData?.description}</p>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <Progress value={progress} className="h-3" />
            <div className="text-sm text-muted-foreground">{Math.round(progress)}% завершено</div>
          </div>

          {/* Steps Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {loadingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index < currentStep
                    ? 'bg-green-500'
                    : index === currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125'
                      : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Fun Facts */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 Знали ли вы? Модель Big Five используется в 95% научных исследований личности
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
