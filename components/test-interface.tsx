'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Brain, Target, Users, Heart, Compass } from 'lucide-react'
import { FadeIn, SlideIn, BounceIn, Pulse } from '@/components/animated-transitions'

interface Question {
  id: string
  text: string
  category: string
  type: 'big_five' | 'jungian_archetype'
  facet?: string
  options: Array<{
    text: string
    score?: number
    archetype?: string
  }>
}

interface TestInterfaceProps {
  questions: Question[]
  onComplete: () => void
  onBack?: () => void
  onAnswer?: (questionId: string, value: number | string) => void
  initialQuestionIndex?: number
  savedAnswers?: Record<string, number | string>
}

const categoryInfo: Record<string, { name: string; icon: any; color: string; description: string }> = {
  openness: {
    name: 'Открытость',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    description: 'Творчество и воображение',
  },
  conscientiousness: {
    name: 'Добросовестность',
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
    description: 'Организованность и дисциплина',
  },
  extraversion: {
    name: 'Экстраверсия',
    icon: Users,
    color: 'from-green-500 to-teal-500',
    description: 'Общительность и энергичность',
  },
  agreeableness: {
    name: 'Доброжелательность',
    icon: Heart,
    color: 'from-orange-500 to-red-500',
    description: 'Сотрудничество и доверие',
  },
  neuroticism: {
    name: 'Невротизм',
    icon: Compass,
    color: 'from-indigo-500 to-purple-500',
    description: 'Эмоциональная стабильность',
  },
  archetype: {
    name: 'Архетип',
    icon: Brain,
    color: 'from-yellow-500 to-orange-500',
    description: 'Личностный архетип',
  },
}

export default function TestInterface({ 
  questions, 
  onComplete, 
  onBack, 
  onAnswer,
  initialQuestionIndex = 0,
  savedAnswers = {}
}: TestInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestionIndex)
  const [answers, setAnswers] = useState<Record<string, number | string>>(savedAnswers)
  const [categoryProgress, setCategoryProgress] = useState<Record<string, number>>({})

  console.log('TestInterface: Received props:', {
    questionsCount: questions?.length,
    initialQuestionIndex,
    savedAnswersCount: Object.keys(savedAnswers).length,
    currentQuestion,
    answersCount: Object.keys(answers).length
  })

  // Восстанавливаем сохраненное состояние при изменении пропсов
  useEffect(() => {
    setCurrentQuestion(initialQuestionIndex)
    setAnswers(savedAnswers)
  }, [initialQuestionIndex, savedAnswers])

  // Подсчет прогресса по категориям
  useEffect(() => {
    const progress: Record<string, number> = {}

    // Используем все возможные категории
    const categoryKeys = [
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism',
      'archetype',
    ]

    categoryKeys.forEach((categoryKey) => {
      const categoryQuestions = questions.filter((q) => q.category === categoryKey)
      const answeredQuestions = categoryQuestions.filter((q) => answers[q.id] !== undefined)
      progress[categoryKey] =
        categoryQuestions.length > 0
          ? (answeredQuestions.length / categoryQuestions.length) * 100
          : 0
    })
    setCategoryProgress(progress)
  }, [answers, questions])

  const handleAnswer = (questionId: string, answerIndex: number) => {
    const question = questions.find(q => q.id === questionId)
    if (!question) return

    console.log('Answer clicked:', { questionId, answerIndex, questionText: question.text })

    let answerValue: number | string

    if (question.type === 'big_five') {
      // Для Big Five берем score из опции
      answerValue = question.options[answerIndex]?.score || 3
      console.log('Big Five answer:', { answerIndex, score: answerValue })
    } else if (question.type === 'jungian_archetype') {
      // Для архетипов берем archetype из опции
      answerValue = question.options[answerIndex]?.archetype || 'sage'
      console.log('Jungian answer:', { answerIndex, archetype: answerValue })
    } else {
      answerValue = answerIndex
      console.log('Other answer:', { answerIndex, value: answerValue })
    }

    // Обновляем локальное состояние немедленно
    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: answerIndex }
      console.log('Updated answers:', newAnswers)
      return newAnswers
    })
    
    // Передаем значение в родительский компонент
    if (onAnswer) {
      onAnswer(questionId, answerValue)
    }

    // Автоматический переход к следующему вопросу с небольшой задержкой
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
      } else {
        // Тест завершен - вызываем onComplete
        onComplete()
      }
    }, 500) // Увеличили задержку для лучшего UX
  }

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const goToNext = () => {
    const q = questions[currentQuestion]
    if (!q) return
    if (currentQuestion < questions.length - 1 && answers[q.id] !== undefined) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  // Прогресс считается по номеру текущего вопроса + 1 (так как мы на текущем вопросе)
  const overallProgress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0
  const question = questions[currentQuestion]
  
  console.log('TestInterface: Current question:', {
    currentQuestion,
    questionExists: !!question,
    questionId: question?.id,
    questionText: question?.text?.substring(0, 50) + '...',
    questionsLength: questions.length
  })
  
  if (!question) return null
  
  const currentCategory = categoryInfo[question.category] || categoryInfo['archetype'] || categoryInfo['openness']
  if (!currentCategory) return null
  
  const Icon = currentCategory.icon

  const isAnswered = question ? answers[question.id] !== undefined : false
  const canGoNext = isAnswered && currentQuestion < questions.length - 1
  const isLastQuestion = currentQuestion === questions.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800">
      {/* Header with Progress */}
      <div className="sticky top-0 z-10 bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-1 sm:p-2"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Назад</span>
                </Button>
              )}
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-white">Тест личности</h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Вопрос {currentQuestion + 1} из {questions.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Прогресс</div>
              <div className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">{Math.round(overallProgress)}%</div>
            </div>
          </div>
          <Progress value={overallProgress} className="h-1 sm:h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">


        {/* Question Card */}
        <FadeIn>
          <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 sm:p-6 lg:p-8">


              {/* Question Text */}
              <SlideIn direction="up" delay={0.2}>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-6 sm:mb-8 leading-relaxed">
                  {question.text}
                </h2>
              </SlideIn>

                          {/* Answer Options */}
              <SlideIn direction="up" delay={0.3}>
                <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {question.options.map((option, index) => (
                    <BounceIn key={index} delay={0.4 + index * 0.1}>
                      <Button
                        variant={answers[question.id] === index ? 'default' : 'outline'}
                        size="lg"
                        className={`w-full justify-start text-left h-auto p-3 sm:p-4 ${
                          answers[question.id] === index
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-purple-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-purple-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-transparent'
                        }`}
                        onClick={() => handleAnswer(question.id, index)}
                      >
                        <span className="text-sm sm:text-base lg:text-lg">{option.text}</span>
                      </Button>
                    </BounceIn>
                  ))}
                </div>
              </SlideIn>

                          {/* Navigation */}
              <SlideIn direction="up" delay={0.5}>
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={goToPrevious}
                    disabled={currentQuestion === 0}
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-purple-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-transparent p-2 sm:p-3"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Предыдущий</span>
                  </Button>

                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {isAnswered ? 'Ответ сохранен' : 'Выберите ответ'}
                    </div>
                    {isAnswered && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-600 dark:text-green-400 text-xs">
                        ✓ Отвечено
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={goToNext}
                    disabled={!canGoNext}
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-purple-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-transparent p-2 sm:p-3"
                  >
                    <span className="hidden sm:inline">Следующий</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                  </Button>
                </div>
              </SlideIn>
          </CardContent>
        </Card>
      </FadeIn>


      </div>
    </div>
  )
}
