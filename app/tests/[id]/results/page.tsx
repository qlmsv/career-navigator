import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowLeft, TrendingUp, Star } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

// Упрощаем определение пропсов для страницы
type TestResultPageProps = {
  params: {
    id: string;
    attemptId: string;
  };
}

async function getResponseDetails(responseId: string, userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('test_responses')
    .select(
      `
      *,
      tests (
        title,
        description
      )
    `
    )
    .eq('id', responseId)
    .eq('user_identifier', userId)
    .single()

  if (error) {
    console.error('Error fetching response details:', error)
    return null
  }
  return data
}

function ConstructScore({ name, value }: { name: string; value: number }) {
  const percentage = (value / 5) * 100 // Предполагаем, что средний балл по шкале от 1 до 5
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground">{value.toFixed(2)} / 5.00</span>
      </div>
      <Progress value={percentage} />
    </div>
  )
}

export default async function TestResultPage({ params }: TestResultPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const response = await getResponseDetails(params.attemptId, user.id)

  if (!response || !response.tests) {
    notFound()
  }

  const test = response.tests
  const results = response.results_data as any || {}
  const constructs = results.constructs || {}

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" asChild>
            <Link href={`/tests/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к тесту
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Тест «{test.title}» завершен!</h1>
          <p className="text-muted-foreground mt-2">Спасибо за участие. Вот ваш результат.</p>
        </div>

        <div className="max-w-2xl mx-auto mt-8 grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Общий результат
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Процент правильных ответов</p>
                <p className="text-6xl font-bold">{results.percentage?.toFixed(1) || '0.0'}%</p>
              </div>
               <div className="text-center text-sm text-muted-foreground">
                (Набрано {results.totalScore?.toFixed(1)} из {results.maxScore?.toFixed(1)} возможных баллов)
              </div>
            </CardContent>
          </Card>

          {Object.keys(constructs).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Результаты по конструктам
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(constructs).map(([name, value]) => (
                  <ConstructScore key={name} name={name} value={value as number} />
                ))}
              </CardContent>
            </Card>
          )}

          <div className="mt-4 text-center">
            <Button asChild size="lg">
              <Link href="/admin">Перейти в панель управления</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
