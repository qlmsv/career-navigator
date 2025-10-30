'use client'

import { useState } from 'react'
import SimpleTestViewer from '@/components/simple-test-viewer'
import DigitalSkillsResults from '@/components/digital-skills-results'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { CalculationResult } from '@/lib/digital-skills-calculator'
import templateData from '@/templates/digital-skills-scoring-test.json'

export default function DigitalSkillsTestPage() {
  const { toast } = useToast()
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<CalculationResult | null>(null)
  const [calculating, setCalculating] = useState(false)

  const handleSubmit = async (answers: Record<string, any>) => {
    setCalculating(true)

    try {
      const response = await fetch('/api/tests/calculate-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка при расчете результатов')
      }

      setResults(data.data)
      setShowResults(true)

      toast({
        title: '✅ Результаты готовы!',
        description: 'Ваши результаты успешно рассчитаны',
      })

      // Прокрутка к результатам
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } catch (error: any) {
      console.error('Failed to calculate results:', error)
      toast({
        variant: 'destructive',
        title: '❌ Ошибка',
        description: error.message || 'Не удалось рассчитать результаты. Попробуйте еще раз.',
      })
    } finally {
      setCalculating(false)
    }
  }

  const handleRetakeTest = () => {
    setShowResults(false)
    setResults(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (showResults && results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DigitalSkillsResults results={results} />

        <div className="mt-8 text-center">
          <Button onClick={handleRetakeTest} size="lg" variant="outline">
            🔄 Пройти тест заново
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8 border-2 border-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">{templateData.title}</CardTitle>
          <p className="text-lg text-muted-foreground">{templateData.description}</p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              📊 Этот тест оценит ваши цифровые навыки и рассчитает вероятность трудоустройства
            </p>
          </div>
        </CardContent>
      </Card>

      <SimpleTestViewer
        schema={templateData.formily_schema}
        onSubmit={handleSubmit}
        submitting={calculating}
      />
    </div>
  )
}
