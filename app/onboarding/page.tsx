'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, ArrowLeft, CheckCircle, User, Brain, BarChart3, Share2 } from 'lucide-react'

type OnboardingStep = {
  id: string
  title: string
  description: string
  icon: any
  content: JSX.Element
}

const DEFAULT_STEP: OnboardingStep = {
  id: 'default',
  title: '',
  description: '',
  icon: User,
  content: <div />,
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в Evolv! 🚀',
    description: 'Откройте свой потенциал с помощью AI-анализа личности',
    icon: User,
    content: (
      <div className="text-center space-y-4">
        <div className="text-6xl">🎯</div>
        <p className="text-lg text-muted-foreground">
          Evolv поможет вам понять себя лучше и найти путь к карьерному росту
        </p>
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg">
          <p className="text-sm">
            ✨ Научный подход на основе Big Five и архетипов Юнга
            <br />
            🎨 Персональные отчеты с визуализацией
            <br />
            📊 Рекомендации для развития
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'profile',
    title: 'Создайте свой профиль',
    description: 'Расскажите о себе, чтобы получить персональные рекомендации',
    icon: User,
    content: (
      <div className="space-y-4">
        <div className="text-center text-4xl">👤</div>
        <p className="text-center text-muted-foreground">
          Ваш профиль поможет нам дать более точные рекомендации
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Базовая информация</h4>
            <p className="text-sm text-muted-foreground">Имя, возраст, текущая позиция</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Карьерные цели</h4>
            <p className="text-sm text-muted-foreground">Куда вы хотите развиваться</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'test',
            title: 'Пройдите тест личности',
    description: '100 научных вопросов для глубокого анализа личности',
    icon: Brain,
    content: (
      <div className="space-y-4">
        <div className="text-center text-4xl">🧠</div>
        <p className="text-center text-muted-foreground">
          Наш тест основан на проверенных психологических методиках
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            <span>Big Five: основные черты личности</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg">
            <CheckCircle className="h-5 w-5 text-purple-500" />
            <span>Архетипы Юнга: глубинная мотивация</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-500/10 to-pink-600/10 rounded-lg">
            <CheckCircle className="h-5 w-5 text-pink-500" />
            <span>Карьерные предпочтения</span>
          </div>
        </div>
        <p className="text-sm text-center text-muted-foreground">⏱️ Тест займет 15-20 минут</p>
      </div>
    ),
  },
  {
    id: 'results',
    title: 'Получите детальный анализ',
    description: 'AI создаст персональный отчет с рекомендациями',
    icon: BarChart3,
    content: (
      <div className="space-y-4">
        <div className="text-center text-4xl">📊</div>
        <p className="text-center text-muted-foreground">Ваш персональный отчет будет включать:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-3 rounded-lg">
              <h4 className="font-semibold text-sm">Профиль личности</h4>
              <p className="text-xs text-muted-foreground">Ваши сильные стороны</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-3 rounded-lg">
              <h4 className="font-semibold text-sm">Карьерные роли</h4>
              <p className="text-xs text-muted-foreground">Подходящие позиции</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 p-3 rounded-lg">
              <h4 className="font-semibold text-sm">Зоны роста</h4>
              <p className="text-xs text-muted-foreground">Что развивать</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 p-3 rounded-lg">
              <h4 className="font-semibold text-sm">Рекомендации</h4>
              <p className="text-xs text-muted-foreground">Конкретные шаги</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'share',
    title: 'Поделитесь результатами',
    description: 'Экспортируйте отчет или поделитесь в социальных сетях',
    icon: Share2,
    content: (
      <div className="space-y-4">
        <div className="text-center text-4xl">🚀</div>
        <p className="text-center text-muted-foreground">
          Используйте результаты для карьерного роста
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-3 rounded-lg text-center">
            <div className="text-2xl mb-2">📄</div>
            <h4 className="font-semibold text-sm">PDF отчет</h4>
            <p className="text-xs text-muted-foreground">Для собеседований</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-3 rounded-lg text-center">
            <div className="text-2xl mb-2">💼</div>
            <h4 className="font-semibold text-sm">LinkedIn</h4>
            <p className="text-xs text-muted-foreground">Профессиональная сеть</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 p-3 rounded-lg text-center">
            <div className="text-2xl mb-2">👥</div>
            <h4 className="font-semibold text-sm">Команда</h4>
            <p className="text-xs text-muted-foreground">Поделиться с коллегами</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 p-4 rounded-lg text-center">
          <p className="text-sm font-medium">🎯 Готовы начать свое развитие?</p>
        </div>
      </div>
    ),
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const { user } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/user')
    }
  }, [user, router])

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_completed', 'true')
    }
    router.push('/dashboard')
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  if (!user) {
    return null
  }

  const step: OnboardingStep = onboardingSteps[currentStep] ?? DEFAULT_STEP
  const Icon = step?.icon as any

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Evolv
            </div>
            <div className="text-sm text-muted-foreground">
              Шаг {currentStep + 1} из {onboardingSteps.length}
            </div>
          </div>
          <Button variant="ghost" onClick={handleSkip}>
            Пропустить
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8">
              {/* Step Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-2">{step.title}</h1>
                <p className="text-muted-foreground">{step.description}</p>
              </div>

              {/* Step Content */}
              <div className="mb-8">{step.content}</div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Назад
                </Button>

                <div className="flex gap-2">
                  {onboardingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index <= currentStep
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {currentStep === onboardingSteps.length - 1 ? 'Начать!' : 'Далее'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions for specific steps */}
          {currentStep === 1 && (
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={() => router.push('/profile')} className="mx-2">
                Заполнить профиль сейчас
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => router.push('/ai-assistant')}
                className="mx-2"
              >
                Начать тест сейчас
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
