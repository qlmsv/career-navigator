'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { TestEngine } from '@/lib/test-engine'
import TestInterface from '@/components/test-interface'
import TestResultsEnhanced from '@/components/test-results-enhanced'
import TestLoading from '@/components/test-loading'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Play, RotateCcw, Eye, History, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { testService } from '@/lib/test-service'
import Link from 'next/link'

export default function TestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [testEngine, setTestEngine] = useState<TestEngine | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [report, setReport] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [hasSavedProgress, setHasSavedProgress] = useState(false)
  const [savedQuestionIndex, setSavedQuestionIndex] = useState(0)
  const [savedAnswers, setSavedAnswers] = useState<Record<string, number | string>>({})
  const [isProgressCompleted, setIsProgressCompleted] = useState(false)

  useEffect(() => {
    if (!user) return

    const initializeTest = async () => {
      try {
        console.log('TestPage: Initializing test with user:', {
          userId: user.id,
          userEmail: user.user_metadata?.['name'] || user.email
        })

        const engine = new TestEngine(user.id)
        setTestEngine(engine)

        // Пытаемся загрузить сохраненный прогресс
        const hasProgress = await engine.loadSavedProgress()
        
        // Проверяем есть ли завершенные результаты
        const hasCompletedResults = await testService.hasCompletedResults(user.id)
        setIsProgressCompleted(hasCompletedResults)
        
        // Показываем экран продолжения только если есть прогресс И тест не завершен
        setHasSavedProgress(hasProgress && !hasCompletedResults)

        if (hasProgress && !hasCompletedResults) {
          // Сохраняем состояние для передачи в TestInterface
          setSavedQuestionIndex(engine['currentQuestionIndex'])
          const answersMap: Record<string, number | string> = {}
          engine['answers'].forEach((answer: any) => {
            answersMap[answer.questionId] = answer.value
          })
          setSavedAnswers(answersMap)
          
          console.log('TestPage: Restored state:', {
            questionIndex: engine['currentQuestionIndex'],
            answersCount: engine['answers'].length,
            answersMap,
            hasCompletedResults
          })
        } else {
          // Если нет сохраненного прогресса или тест завершен, сбрасываем состояние
          setSavedQuestionIndex(0)
          setSavedAnswers({})
        }

        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize test:', error)
        setLoadingError('Ошибка инициализации теста')
      }
    }

    initializeTest()
  }, [user])

  const handleRestart = async () => {
    if (!testEngine || !user) return

    try {
      await testEngine.startNewTest()
      setReport(null)
      setProgress(0)
      setHasSavedProgress(false)
      setSavedQuestionIndex(0)
      setSavedAnswers({})
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to restart test:', error)
    }
  }

  const handleTestComplete = async () => {
    if (!testEngine) return

    setIsLoading(true)
    console.log('Starting test completion...')

    try {
      // Принудительно завершаем тест
      testEngine['currentQuestionIndex'] = testEngine['questions'].length
      console.log('Current question index:', testEngine['currentQuestionIndex'])
      console.log('Total questions:', testEngine['questions'].length)
      console.log('Answers count:', testEngine['answers'].length)
      console.log('Is test finished:', testEngine.isTestFinished())

      const results = testEngine.getResults()
      if (!results) {
        throw new Error('Failed to get test results')
      }

      console.log('Getting results with answers:', testEngine['answers'].length)

      const bigFiveAnswers = testEngine['answers'].filter((a: any) => a.type === 'big_five')
      const jungianAnswers = testEngine['answers'].filter((a: any) => a.type === 'jungian_archetype')

      console.log('Big Five answers:', bigFiveAnswers.length)
      console.log('Jungian answers:', jungianAnswers.length)

      // Используем результаты из getResults()
      const bigFiveResult = results.bigFive
      const jungianResult = results.jungian
      const dominantArchetype = results.dominantArchetype

      console.log('Results calculated:', { bigFiveResult, jungianResult, dominantArchetype })

      const testResults = {
        bigFive: bigFiveResult,
        jungian: jungianResult,
        dominantArchetype: dominantArchetype as string,
        answers: testEngine['answers']
      }

      console.log('Test results:', testResults)

      const dataToSend = {
        bigFiveResults: bigFiveResult,
        dominantArchetype: dominantArchetype,
        allAnswers: testEngine['answers']
      }

      console.log('Sending data for AI analysis:', dataToSend)

      const response = await fetch('/api/analyze-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze results')
      }

      const analysisResult = await response.json()
      console.log('Analysis result:', analysisResult)

      if (analysisResult.success) {
        // Сохраняем результаты в базу данных
        if (user) {
          const resultId = await testEngine.saveResults(
            analysisResult.data.big5_scores || bigFiveResult, // Используем данные из AI, если есть
            dominantArchetype as string,
            analysisResult.data,
            analysisResult.analysisTime || 0
          )
          console.log('Results saved with ID:', resultId)
        }

        setReport(JSON.stringify(analysisResult.data))
      } else {
        throw new Error('Analysis failed')
      }
    } catch (error) {
      console.error('Failed to complete test:', error)
      setLoadingError('Ошибка при завершении теста')
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 flex items-center justify-center p-6">
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Ошибка загрузки</h2>
            <p className="text-slate-300 mb-4">{loadingError}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isReady || !testEngine) {
    return <TestLoading />
  }

  if (report) {
    return (
      <TestResultsEnhanced
        report={report}
        onRestart={handleRestart}
      />
    )
  }

  if (isLoading) {
    return <TestLoading />
  }

  // Показываем экран с сохраненным прогрессом только если тест не завершен
  if (hasSavedProgress && !isProgressCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center p-6">
        <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm max-w-md shadow-lg">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Найден сохраненный прогресс
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              У вас есть незавершенный тест. Хотите продолжить с того места, где остановились?
            </p>
            <div className="space-y-3">
              <Button 
                onClick={async () => {
                  setHasSavedProgress(false)
                  // Правильно восстанавливаем прогресс
                  if (testEngine) {
                    try {
                      await testEngine.resumeTest(savedQuestionIndex, savedAnswers)
                      console.log('Test resumed successfully:', { savedQuestionIndex, savedAnswers })
                    } catch (error) {
                      console.error('Failed to resume test:', error)
                      // Если не удалось восстановить, начинаем заново
                      await testEngine.startNewTest()
                    }
                  }
                }} 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
              >
                <Play className="w-4 h-4 mr-2" />
                Продолжить тест
              </Button>

              <Button 
                onClick={async () => {
                  if (testEngine) {
                    await testEngine.startNewTest()
                    setHasSavedProgress(false)
                    setSavedQuestionIndex(0)
                    setSavedAnswers({})
                    setIsProgressCompleted(false)
                  }
                }} 
                variant="outline" 
                className="w-full border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Начать заново
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

    // Если тест завершен, показываем сообщение о необходимости начать заново
    if (isProgressCompleted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center p-6">
          <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm max-w-md shadow-lg">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Тест уже завершен
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-6">
                Вы уже прошли этот тест. Хотите пройти его заново?
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={async () => {
                    if (testEngine) {
                      await testEngine.startNewTest()
                      setHasSavedProgress(false)
                      setSavedQuestionIndex(0)
                      setSavedAnswers({})
                      setIsProgressCompleted(false)
                    }
                  }} 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Пройти заново
                </Button>
                
                <Button 
                  onClick={() => router.push('/dashboard')} 
                  variant="outline" 
                  className="w-full border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Выйти
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
    <TestInterface
      questions={testEngine['questions']}
      onComplete={handleTestComplete}
      initialQuestionIndex={savedQuestionIndex}
      savedAnswers={savedAnswers}
      onAnswer={async (questionId: string, value: number | string) => {
        console.log('Parent: Processing answer:', { questionId, value })
        testEngine.answerQuestion(questionId, value)
        setProgress(testEngine.getProgress())
        console.log('Parent: Progress updated:', testEngine.getProgress())
        
        // Сохраняем прогресс после каждого ответа
        if (user) {
          console.log('Parent: Saving progress for user:', user.id)
          await testEngine.saveProgress()
        } else {
          console.log('Parent: No user available for progress save')
        }
      }}
    />
  )
}
