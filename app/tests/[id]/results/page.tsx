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
          <span className="ml-2">Среднее: {value.average.toFixed(2)}</span>
        </span>
      </div>
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
  const testType = results.testType
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
          {/* ICT Index Test Results */}
          {testType === 'ict_index' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Ваш ICT Index
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary mb-2">
                      {results.skillIndex?.toFixed(3) || '0.000'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Регион: {results.regionName || 'Не указан'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Среднее по региону</p>
                      <p className="text-2xl font-semibold">
                        {results.regionalAverage?.toFixed(3) || '0.000'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Разница</p>
                      <p
                        className={`text-2xl font-semibold ${results.difference >= 0 ? 'text-green-600' : 'text-orange-600'}`}
                      >
                        {results.difference >= 0 ? '+' : ''}
                        {results.difference?.toFixed(3) || '0.000'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Ваш результат лучше, чем у {results.percentile?.toFixed(1) || '0'}% регионов
                    </p>
                    <Progress value={results.percentile || 0} className="h-2" />
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium">{results.interpretation}</p>
                  </div>
                </CardContent>
              </Card>

              {results.skillsBreakdown && results.skillsBreakdown.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Детализация по навыкам
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {results.skillsBreakdown.map((skill: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{skill.label}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-sm ${skill.hasSkill ? 'text-green-600 font-semibold' : 'text-muted-foreground'}`}
                          >
                            {skill.hasSkill ? '✓ Владею' : '✗ Не владею'}
                          </span>
                          <span className="text-sm text-muted-foreground w-20 text-right">
                            +{skill.contribution.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Employment Scoring Test Results */}
          {testType === 'employment_scoring' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Вероятность трудоустройства
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-2">
                      {results.probabilityPercent?.toFixed(1) || '0'}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Регион: {results.regionName || 'Не указан'}
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <Progress value={results.probabilityPercent || 0} className="h-3" />
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Raw Score (техническая метрика)</p>
                    <p className="text-lg font-semibold">{results.rawScore?.toFixed(3) || '0.000'}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium">{results.interpretation}</p>
                  </div>
                </CardContent>
              </Card>

              {results.factorsBreakdown && results.factorsBreakdown.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Учтенные факторы
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {results.factorsBreakdown.map((factor: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{factor.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {Array.isArray(factor.value)
                              ? factor.value.join(', ')
                              : factor.value || 'Не указано'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold">×{factor.weight?.toFixed(3)}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Standard Test Results */}
          {!testType && (
            <>
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
            </>
          )}
        </div>
      </main>
    </div>
  )
}
