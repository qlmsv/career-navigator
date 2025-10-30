'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { CalculationResult } from '@/lib/digital-skills-calculator'

interface DigitalSkillsResultsProps {
  results: CalculationResult
}

export default function DigitalSkillsResults({ results }: DigitalSkillsResultsProps) {
  const { digitalSkills, employmentScoring, regionName } = results

  // Определяем уровень навыков
  const getSkillLevel = (index: number): { label: string; color: string } => {
    if (index >= 0.25) return { label: 'Высокий', color: 'bg-green-500' }
    if (index >= 0.15) return { label: 'Выше среднего', color: 'bg-blue-500' }
    if (index >= 0.1) return { label: 'Средний', color: 'bg-yellow-500' }
    if (index >= 0.05) return { label: 'Ниже среднего', color: 'bg-orange-500' }
    return { label: 'Низкий', color: 'bg-red-500' }
  }

  // Определяем уровень вероятности трудоустройства
  const getEmploymentLevel = (probability: number): { label: string; color: string } => {
    if (probability >= 80) return { label: 'Очень высокая', color: 'bg-green-500' }
    if (probability >= 60) return { label: 'Высокая', color: 'bg-blue-500' }
    if (probability >= 40) return { label: 'Средняя', color: 'bg-yellow-500' }
    if (probability >= 20) return { label: 'Низкая', color: 'bg-orange-500' }
    return { label: 'Очень низкая', color: 'bg-red-500' }
  }

  const skillLevel = getSkillLevel(digitalSkills.skillIndex)
  const employmentLevel = getEmploymentLevel(employmentScoring.probabilityPercent)

  const progressPercentage = (digitalSkills.skillIndex / 0.5) * 100 // Нормализуем к 100%

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Заголовок */}
      <Card className="border-2 border-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Результаты оценки</CardTitle>
          <CardDescription className="text-lg">
            Ваши цифровые навыки и вероятность трудоустройства
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Раздел 1: Индекс цифровых навыков */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Индекс цифровых навыков
          </CardTitle>
          <CardDescription>Оценка ваших навыков работы с цифровыми технологиями</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Основной индекс */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Ваш индекс</p>
                <p className="text-4xl font-bold">{digitalSkills.skillIndex.toFixed(4)}</p>
              </div>
              <Badge className={`${skillLevel.color} text-white px-4 py-2 text-lg`}>
                {skillLevel.label}
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Сравнение с регионом */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Ваш результат</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {digitalSkills.skillIndex.toFixed(4)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Среднее по региону</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {digitalSkills.regionalAverage.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{regionName}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Разница</p>
                <p
                  className={`text-2xl font-bold ${digitalSkills.difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                >
                  {digitalSkills.difference >= 0 ? '+' : ''}
                  {digitalSkills.difference.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {digitalSkills.difference >= 0 ? 'Выше среднего' : 'Ниже среднего'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Детализация по навыкам */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <span>🔍</span>
              Детализация по навыкам
            </h4>
            <div className="space-y-2">
              {digitalSkills.skillsBreakdown.map((skill, index) => (
                <div
                  key={skill.skill}
                  className={`flex items-center justify-between p-3 rounded-lg ${skill.hasSkill ? 'bg-green-50 dark:bg-green-950/20' : 'bg-gray-50 dark:bg-gray-900/20'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{skill.hasSkill ? '✅' : '⬜'}</span>
                    <div>
                      <p className="font-medium">{skill.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Вес: {skill.weight.toFixed(4)} | Вклад:{' '}
                        {skill.contribution > 0 ? skill.contribution.toFixed(4) : '0'}
                      </p>
                    </div>
                  </div>
                  {skill.hasSkill && (
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900">
                      Владею
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Раздел 2: Скоринг трудоустройства */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💼</span>
            Вероятность трудоустройства
          </CardTitle>
          <CardDescription>
            Оценка на основе ваших персональных характеристик и навыков
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Основная вероятность */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Вероятность трудоустройства</p>
                <p className="text-5xl font-bold">
                  {employmentScoring.probabilityPercent.toFixed(2)}%
                </p>
              </div>
              <Badge className={`${employmentLevel.color} text-white px-4 py-2 text-lg`}>
                {employmentLevel.label}
              </Badge>
            </div>
            <Progress value={employmentScoring.probabilityPercent} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              Raw Score: {employmentScoring.rawScore.toFixed(4)}
            </p>
          </div>

          {/* Факторы */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <span>📋</span>
              Факторы, влияющие на результат
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employmentScoring.factorsBreakdown.map((factor) => (
                <Card key={factor.factor}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{factor.label}</p>
                        <p className="text-lg font-semibold mt-1">
                          {Array.isArray(factor.value) ? factor.value.join(', ') : factor.value}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Вес</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {factor.weight.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Интерпретация */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span>💡</span>
              Что это означает?
            </h4>
            <p className="text-sm text-muted-foreground">
              {employmentScoring.probabilityPercent >= 80 && (
                <>
                  Отличный результат! Ваши характеристики и навыки делают вас очень
                  конкурентоспособным кандидатом на рынке труда. Продолжайте развивать свои навыки и
                  расширять профессиональный опыт.
                </>
              )}
              {employmentScoring.probabilityPercent >= 60 &&
                employmentScoring.probabilityPercent < 80 && (
                  <>
                    Хороший результат! У вас есть хорошие шансы на трудоустройство. Рекомендуем
                    усилить профессиональные навыки и обратить внимание на цифровую грамотность.
                  </>
                )}
              {employmentScoring.probabilityPercent >= 40 &&
                employmentScoring.probabilityPercent < 60 && (
                  <>
                    Средний результат. Вы находитесь в середине рынка труда. Рекомендуем повысить
                    квалификацию, освоить дополнительные цифровые навыки и получить больше опыта в
                    профессиональной сфере.
                  </>
                )}
              {employmentScoring.probabilityPercent < 40 && (
                <>
                  Есть возможности для роста! Рекомендуем обратить особое внимание на развитие
                  цифровых навыков, повышение образования и приобретение востребованных
                  профессиональных компетенций.
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Рекомендации */}
      <Card className="border-2 border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Рекомендации по развитию
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Топ-3 навыка для развития */}
            <div>
              <h4 className="font-semibold mb-3">Приоритетные навыки для развития:</h4>
              <div className="space-y-2">
                {digitalSkills.skillsBreakdown
                  .filter((s) => !s.hasSkill)
                  .sort((a, b) => b.weight - a.weight)
                  .slice(0, 3)
                  .map((skill, index) => (
                    <div
                      key={skill.skill}
                      className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg"
                    >
                      <Badge className="bg-yellow-500 text-white">{index + 1}</Badge>
                      <div className="flex-1">
                        <p className="font-medium">{skill.label}</p>
                        <p className="text-xs text-muted-foreground">
                          Потенциальный вклад: +{skill.weight.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Общие рекомендации */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Общие рекомендации:</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>✓ Пройдите онлайн-курсы по цифровым навыкам на платформах типа Coursera</li>
                <li>✓ Практикуйте новые навыки в реальных проектах или на волонтерских началах</li>
                <li>✓ Получите сертификаты, подтверждающие ваши компетенции</li>
                <li>✓ Обновите резюме с учетом новых навыков</li>
                <li>✓ Расширяйте профессиональную сеть контактов</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
