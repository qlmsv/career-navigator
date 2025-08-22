'use client'

import { useState, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  RefreshCw,
  TrendingUp,
  Target,
  Brain,
  Users,
  Heart,
  Compass,
  Award,
  Sparkles,
  BarChart3,
  Home,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { useRouter } from 'next/navigation'

interface TestResultsEnhancedProps {
  report: string
  onRestart: () => void
}

// Parse the AI analysis JSON response
const parseAnalysis = (report: string) => {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(report)
    return parsed
  } catch {
    // If not JSON, try to extract JSON from markdown
    const jsonMatch = report.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch {
        return null
      }
    }
    return null
  }
}

// Get archetype info
const getArchetypeInfo = (archetype: string) => {
  const archetypes: Record<string, { name: string; description: string; icon: any }> = {
    hero: { name: 'Герой', description: 'Стремится к достижениям и преодолению препятствий', icon: Award },
    creator: { name: 'Творец', description: 'Создает новое и выражает себя через творчество', icon: Sparkles },
    sage: { name: 'Мудрец', description: 'Ищет истину и понимание мира', icon: Brain },
    explorer: { name: 'Исследователь', description: 'Открывает новые горизонты и возможности', icon: Compass },
    ruler: { name: 'Правитель', description: 'Берет ответственность и создает порядок', icon: Target },
    caregiver: { name: 'Заботливый', description: 'Помогает другим и проявляет сострадание', icon: Heart },
    jester: { name: 'Шут', description: 'Приносит радость и видит юмор в жизни', icon: TrendingUp },
    lover: { name: 'Любовник', description: 'Стремится к близости и гармонии', icon: Heart },
    innocent: { name: 'Невинный', description: 'Верит в добро и простоту', icon: Sparkles },
    outlaw: { name: 'Бунтарь', description: 'Бросает вызов правилам и статус-кво', icon: TrendingUp },
    magician: { name: 'Маг', description: 'Преобразует реальность и видит возможности', icon: Sparkles },
    everyman: { name: 'Обычный человек', description: 'Стремится к принадлежности и равенству', icon: Users },
  }
  
  return archetypes[archetype.toLowerCase()] || { name: archetype, description: 'Уникальный архетип', icon: Brain }
}

// Get Big Five category info
const getBigFiveInfo = (category: string) => {
  const categories: Record<string, { name: string; description: string; icon: any }> = {
    openness: { name: 'Открытость', description: 'Творчество и готовность к новому', icon: Sparkles },
    conscientiousness: { name: 'Добросовестность', description: 'Организованность и ответственность', icon: Target },
    extraversion: { name: 'Экстраверсия', description: 'Общительность и энергичность', icon: Users },
    agreeableness: { name: 'Доброжелательность', description: 'Сотрудничество и эмпатия', icon: Heart },
    neuroticism: { name: 'Эмоциональная стабильность', description: 'Стрессоустойчивость', icon: Brain },
  }
  
  return categories[category] || { name: category, description: '', icon: Brain }
}

// Get score level
const getScoreLevel = (score: number) => {
  if (score >= 70) return { level: 'Высокий', color: 'bg-green-500', textColor: 'text-green-500' }
  if (score >= 30) return { level: 'Средний', color: 'bg-yellow-500', textColor: 'text-yellow-500' }
  return { level: 'Низкий', color: 'bg-red-500', textColor: 'text-red-500' }
}

export default function TestResultsEnhanced({ report, onRestart }: TestResultsEnhancedProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const analysis = useMemo(() => parseAnalysis(report), [report])

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 flex items-center justify-center">
        <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm max-w-2xl shadow-lg">
          <CardContent className="p-8 text-center">
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Ошибка анализа</h2>
            <p className="text-slate-300 mb-6">Не удалось обработать результаты теста</p>
            <Button onClick={onRestart} className="bg-gradient-to-r from-blue-500 to-purple-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Пройти тест заново
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if this is fallback data
  const isFallbackData = analysis.fallback === true || 
    (analysis.personality_insights?.openness_description?.includes('Базовый анализ'))

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: BarChart3 },
    { id: 'personality', name: 'Личность', icon: Brain },
    { id: 'career', name: 'Карьера', icon: Target },
    { id: 'education', name: 'Развитие', icon: TrendingUp },
    { id: 'action', name: 'План действий', icon: Compass },
    { id: 'swot', name: 'SWOT анализ', icon: Award },
  ]

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-8">
      {/* Archetype Section */}
            <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-slate-900 dark:text-white text-base sm:text-lg">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            Доминирующий архетип
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{analysis.archetype?.primary || 'Не определен'}</h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">{analysis.archetype?.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-400 mb-2">Сильные стороны</h4>
              <ul className="space-y-1">
                {analysis.archetype?.strengths?.map((strength: string, index: number) => (
                  <li key={index} className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-400 mb-2">Области роста</h4>
              <ul className="space-y-1">
                {analysis.archetype?.growth_areas?.map((area: string, index: number) => (
                  <li key={index} className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Big Five Scores */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
            <BarChart3 className="w-6 h-6" />
            Big Five Результаты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {Object.entries(analysis.big5_scores || {}).map(([trait, score]) => {
              const info = getBigFiveInfo(trait)
              const level = getScoreLevel(score as number)
              return (
                <div key={trait} className="text-center p-3 sm:p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400">{score as number}%</div>
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 capitalize mb-2">{info.name}</div>
                  <Badge className={`${level.color} text-xs`}>{level.level}</Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Резюме</CardTitle>
        </CardHeader>
                 <CardContent>
           <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.summary as string}</p>
         </CardContent>
      </Card>
    </div>
  )

  const renderPersonality = () => (
    <div className="space-y-6">
      {Object.entries(analysis.personality_insights || {}).map(([trait, description]) => {
        const info = getBigFiveInfo(trait.replace('_description', ''))
        const score = analysis.big5_scores?.[trait.replace('_description', '')] || 50
        const level = getScoreLevel(score)
        
        return (
          <Card key={trait} className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
                <info.icon className="w-5 h-5" />
                {info.name}
                <Badge className={level.color}>{level.level}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{description as string}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const renderCareer = () => (
    <div className="space-y-6">
      {/* Career Paths */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
            <Target className="w-6 h-6" />
            Карьерные пути
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3">Начальные позиции</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {analysis.career_recommendations?.suitable_roles?.slice(0, 4)?.map((role: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-sm">{role}</Badge>
              )) || (
                <Badge variant="secondary" className="text-sm">Аналитик данных</Badge>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">Средний уровень</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {analysis.career_recommendations?.suitable_roles?.slice(4, 8)?.map((role: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-sm">{role}</Badge>
              )) || (
                <Badge variant="secondary" className="text-sm">Руководитель проекта</Badge>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-3">Старшие позиции</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {analysis.career_recommendations?.suitable_roles?.slice(8, 12)?.map((role: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-sm">{role}</Badge>
              )) || (
                <Badge variant="secondary" className="text-sm">Директор по развитию</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Companies */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Целевые компании</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {analysis.career_recommendations?.target_companies?.map((company: string, index: number) => (
              <Badge key={index} variant="outline" className="text-sm">{company}</Badge>
            )) || (
              <>
                <Badge variant="outline" className="text-sm">Google</Badge>
                <Badge variant="outline" className="text-sm">Microsoft</Badge>
                <Badge variant="outline" className="text-sm">Apple</Badge>
                <Badge variant="outline" className="text-sm">Meta</Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Industries */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Подходящие индустрии</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {analysis.career_recommendations?.industries?.map((industry: string, index: number) => (
              <Badge key={index} variant="outline" className="text-sm">{industry}</Badge>
            )) || (
              <>
                <Badge variant="outline" className="text-sm">IT и технологии</Badge>
                <Badge variant="outline" className="text-sm">Финансы</Badge>
                <Badge variant="outline" className="text-sm">Консалтинг</Badge>
                <Badge variant="outline" className="text-sm">Образование</Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Work Environment */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Идеальная рабочая среда</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 dark:text-slate-300">
            {analysis.career_recommendations?.work_environment || 
             "Динамичная среда с возможностью творчества и инноваций. Команда профессионалов, открытая к новым идеям. Гибкий график и возможности для развития."}
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderEducation = () => (
    <div className="space-y-6">
      {/* Skills to Develop */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Навыки для развития</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {analysis.development_plan?.skills_to_develop?.map((skill: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-sm">{skill}</Badge>
            )) || (
              <>
                <Badge variant="secondary" className="text-sm">Лидерство</Badge>
                <Badge variant="secondary" className="text-sm">Аналитическое мышление</Badge>
                <Badge variant="secondary" className="text-sm">Коммуникация</Badge>
                <Badge variant="secondary" className="text-sm">Стратегическое планирование</Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Areas */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Области знаний</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {analysis.development_plan?.learning_areas?.map((area: string, index: number) => (
              <Badge key={index} variant="outline" className="text-sm">{area}</Badge>
            )) || (
              <>
                <Badge variant="outline" className="text-sm">Бизнес-аналитика</Badge>
                <Badge variant="outline" className="text-sm">Управление проектами</Badge>
                <Badge variant="outline" className="text-sm">Психология</Badge>
                <Badge variant="outline" className="text-sm">Маркетинг</Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Learning Methods */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Методы обучения</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.development_plan?.learning_methods?.map((method: string, index: number) => (
              <li key={index} className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                {method}
              </li>
            )) || (
              <>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Онлайн-курсы и сертификации
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Практические проекты
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Менторство и коучинг
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Ресурсы для самообразования</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.development_plan?.resources?.map((resource: string, index: number) => (
              <li key={index} className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                {resource}
              </li>
            )) || (
              <>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Coursera и Udemy
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  LinkedIn Learning
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Профессиональные сообщества
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Mentorship Areas */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Области для менторства</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.development_plan?.mentorship_areas?.map((area: string, index: number) => (
              <li key={index} className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                {area}
              </li>
            )) || (
              <>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Карьерное планирование
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Лидерские навыки
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Отраслевые знания
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )

  const renderActionPlan = () => (
    <div className="space-y-6">
      {/* Immediate Actions */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
            <Compass className="w-6 h-6" />
            Ближайшие действия (2 недели)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.action_plan?.short_term_goals?.map((action: string, index: number) => (
              <li key={index} className="text-slate-700 dark:text-slate-300 flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                {action}
              </li>
            )) || (
              <>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  Пройти курс по аналитике данных
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  Создать портфолио проектов
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    3
                  </div>
                  Найти ментора в отрасли
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Short Term Goals */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Краткосрочные цели (3 месяца)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.action_plan?.medium_term_goals?.map((goal: string, index: number) => (
              <li key={index} className="text-slate-700 dark:text-slate-300 flex items-center gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                {goal}
              </li>
            )) || (
              <>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  Получить сертификацию в области управления проектами
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  Развить навыки лидерства через практику
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Medium Term Goals */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Среднесрочные цели (6-12 месяцев)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.action_plan?.long_term_vision?.map((goal: string, index: number) => (
              <li key={index} className="text-slate-700 dark:text-slate-300 flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                {goal}
              </li>
            )) || (
              <>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  Стать директором по развитию в крупной компании
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  Создать собственную консалтинговую компанию
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Long Term Vision */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Долгосрочное видение (2-3 года)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.action_plan?.success_metrics?.map((vision: string, index: number) => (
              <li key={index} className="text-slate-700 dark:text-slate-300 flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                {vision}
              </li>
            )) || (
              <>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  Повышение зарплаты на 30% в течение года
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  Получение руководящей позиции
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Показатели успеха</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.action_plan?.success_metrics?.map((metric: string, index: number) => (
              <li key={index} className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                {metric}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )

  const renderSWOT = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Strengths */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-green-600 dark:text-green-400">
            <Award className="w-6 h-6" />
            Сильные стороны
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.swot_analysis?.strengths?.map((strength: string, index: number) => (
              <li key={index} className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                {strength}
              </li>
            )) || (
              <>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Аналитическое мышление
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Креативность и инновационность
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Адаптивность к изменениям
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Weaknesses */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <Award className="w-6 h-6" />
            Слабые стороны
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.swot_analysis?.weaknesses?.map((weakness: string, index: number) => (
              <li key={index} className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                {weakness}
              </li>
            )) || (
              <>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  Недостаток опыта в управлении
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  Склонность к перфекционизму
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Opportunities */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
            <Award className="w-6 h-6" />
            Возможности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.swot_analysis?.opportunities?.map((opportunity: string, index: number) => (
              <li key={index} className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                {opportunity}
              </li>
            )) || (
              <>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Рост спроса на аналитиков данных
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Развитие технологий ИИ
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Threats */}
      <Card className="bg-white/90 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
            <Award className="w-6 h-6" />
            Угрозы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.swot_analysis?.threats?.map((threat: string, index: number) => (
              <li key={index} className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                {threat}
              </li>
            )) || (
              <>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  Автоматизация рабочих мест
                </li>
                <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  Высокая конкуренция в отрасли
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 p-3 sm:p-6">
      <div ref={resultsRef} className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Ваш профиль личности</h1>
                      <p className="text-sm sm:text-base lg:text-xl text-gray-300">Результаты анализа личности и карьерные рекомендации</p>
           
           {isFallbackData && (
             <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-w-2xl mx-auto">
               <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                 ⚠️ Внимание: Показаны базовые результаты. Детальный анализ не удалось выполнить.
               </p>
             </div>
           )}
         </div>

        {/* Tabs */}
        <div className="text-center mb-2">
          <p className="text-xs text-gray-400 mb-3">
            💡 Нажмите на вкладки ниже, чтобы просмотреть разные разделы результатов
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              size="sm"
              className={`
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
                  : 'bg-white/90 dark:bg-white/10 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-white dark:hover:bg-white/20 hover:border-blue-400 dark:hover:border-blue-400'
                }
                text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95
                min-w-[80px] sm:min-w-[100px] h-12 sm:h-11 px-3 sm:px-4
                rounded-lg shadow-md hover:shadow-lg
              `}
            >
              <tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2`} />
              <span className="text-xs sm:text-sm font-medium">{tab.name}</span>
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'personality' && renderPersonality()}
        {activeTab === 'career' && renderCareer()}
        {activeTab === 'education' && renderEducation()}
        {activeTab === 'action' && renderActionPlan()}
        {activeTab === 'swot' && renderSWOT()}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
          <Button
            onClick={onRestart}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Пройти тест заново</span>
          </Button>
          
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            size="sm"
            className="border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">На главную</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
