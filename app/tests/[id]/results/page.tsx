import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowLeft, TrendingUp, Star } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface TestResultPageProps {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

declare module 'next' {
  interface PageProps extends TestResultPageProps {}
}

async function getResponseDetails(testId: string, responseId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('test_responses')
    .select(
      `
      *,
      tests (
        title,
        description,
        show_results
      )
    `,
    )
    .eq('id', responseId)
    .eq('test_id', testId)
    .single()

  if (error) {
    console.error('Error fetching response details:', error)
    return null
  }
  return data
}

interface ConstructScoreProps {
  name: string
  value: {
    sum: number
    average: number
    items: number
  }
}

function ConstructScore({ name, value }: ConstructScoreProps) {
  const percentage = Math.min(Math.max((value.average / 5) * 100, 0), 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground">
          <span className="font-semibold">Сумма: {value.sum.toFixed(2)}</span>
          <span className="ml-2">Среднее: {value.average.toFixed(2)} / 5.00</span>
        </span>
      </div>
      <Progress value={percentage} />
      <p className="text-xs text-muted-foreground">Количество вопросов: {value.items}</p>
    </div>
  )
}

export default async function TestResultPage({ params, searchParams }: TestResultPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const rawResponseId = resolvedSearchParams['responseId']
  const responseId = Array.isArray(rawResponseId) ? rawResponseId[0] : rawResponseId

  if (!responseId) {
    notFound()
  }

  const response = await getResponseDetails(resolvedParams.id, responseId)

  if (!response || !response.tests) {
    notFound()
  }

  if (response.tests.show_results === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Результаты недоступны</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Для этого теста просмотр результатов отключен. Свяжитесь с организатором для получения
              дополнительной информации.
            </p>
            <Button asChild variant="secondary">
              <Link href={`/tests/${resolvedParams.id}`}>Вернуться к тесту</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const test = response.tests
  const results = (response.results_data as any) || {}
  const constructs = (results.constructs ?? {}) as Record<string, ConstructScoreProps['value']>
  const subconstructs = (results.subconstructs ?? {}) as Record<
    string,
    ConstructScoreProps['value']
  >
  const skills = (results.skills ?? {}) as Record<string, ConstructScoreProps['value']>

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" asChild>
            <Link href={`/tests/${resolvedParams.id}`}>
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
                  <ConstructScore key={name} name={name} value={value} />
                ))}
              </CardContent>
            </Card>
          )}

          {Object.keys(subconstructs).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Подшкалы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(subconstructs).map(([name, value]) => (
                  <ConstructScore key={name} name={name} value={value} />
                ))}
              </CardContent>
            </Card>
          )}

          {Object.keys(skills).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Навыки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(skills).map(([name, value]) => (
                  <ConstructScore key={name} name={name} value={value} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
