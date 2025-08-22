'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Star,
  TrendingUp 
} from 'lucide-react'
import { careerAssessmentService } from '@/lib/services/career-assessment'
import type { 
  DigitalSkillCategory, 
  DigitalSkill, 
  Region, 
  Profession
} from '@/lib/types/career-navigator'

interface AssessmentStep {
  step: number
  title: string
  description: string
  isCompleted: boolean
}

function SkillsAssessmentPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  // Состояние загрузки
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Справочные данные
  const [skillCategories, setSkillCategories] = useState<DigitalSkillCategory[]>([])
  const [allSkills, setAllSkills] = useState<DigitalSkill[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [professions, setProfessions] = useState<Profession[]>([])
  
  // Состояние формы
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    current_profession_id: '',
    target_profession_id: '',
    region_id: '',
    experience_years: 0,
    current_salary: 0,
    target_salary: 0,
    skill_assessments: {} as Record<string, { self_assessment_level: number; confidence_level: number }>
  })

  const steps: AssessmentStep[] = [
    {
      step: 0,
      title: 'Профессиональная информация',
      description: 'Расскажите о своей текущей работе и целях',
      isCompleted: false
    },
    {
      step: 1,
      title: 'Оценка навыков',
      description: 'Оцените свой уровень владения цифровыми навыками',
      isCompleted: false
    },
    {
      step: 2,
      title: 'Результаты',
      description: 'Получите персональные рекомендации',
      isCompleted: false
    }
  ]

  // Загрузка справочных данных
  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    const loadData = async () => {
      try {
        setIsLoading(true)
        const [categoriesData, skillsData, regionsData, professionsData] = await Promise.all([
          careerAssessmentService.getSkillCategories(),
          careerAssessmentService.getAllSkills(),
          careerAssessmentService.getRegions(),
          careerAssessmentService.getProfessions()
        ])
        
        setSkillCategories(categoriesData)
        setAllSkills(skillsData)
        setRegions(regionsData)
        setProfessions(professionsData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
        setError(errorMessage)
        console.error('Error loading assessment data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, router])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkillAssessment = (skillId: string, level: number, confidence: number) => {
    setFormData(prev => ({
      ...prev,
      skill_assessments: {
        ...prev.skill_assessments,
        [skillId]: {
          self_assessment_level: level,
          confidence_level: confidence
        }
      }
    }))
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      const assessmentId = await careerAssessmentService.createAssessment(user!.id, formData)
      await careerAssessmentService.saveSkillScores(assessmentId, formData.skill_assessments)
      const results = await careerAssessmentService.completeAssessment(assessmentId)
      
      // Переход к результатам
      router.push(`/assessment-results/${assessmentId}`)
    } catch (err) {
      setError('Ошибка сохранения оценки')
      console.error('Error submitting assessment:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const isDatabaseError = error.includes('База данных не настроена')
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {isDatabaseError ? 'База данных не настроена' : 'Ошибка загрузки'}
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
            </div>
            
            {isDatabaseError && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Необходимо настроить базу данных:
                </h3>
                
                {error.includes('правами доступа') || error.includes('permission') || error.includes('policy') ? (
                  <div className="space-y-2">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                      ⚠️ Таблицы созданы, но RLS политики блокируют доступ. Выполните:
                    </p>
                    <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside">
                      <li>Откройте Supabase Dashboard → SQL Editor</li>
                      <li>Скопируйте код из файла <strong>disable_rls.sql</strong></li>
                      <li>Выполните SQL для отключения RLS</li>
                      <li>Обновите эту страницу</li>
                    </ol>
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        💡 Быстрое решение: Выполните этот SQL в Supabase:
                      </p>
                      <code className="text-xs bg-white dark:bg-slate-800 p-2 rounded block mt-2">
                        ALTER TABLE digital_skill_categories DISABLE ROW LEVEL SECURITY;
                        <br />
                        ALTER TABLE digital_skills DISABLE ROW LEVEL SECURITY;
                        <br />
                        ALTER TABLE regions DISABLE ROW LEVEL SECURITY;
                        <br />
                        ALTER TABLE professions DISABLE ROW LEVEL SECURITY;
                      </code>
                    </div>
                  </div>
                ) : (
                  <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside">
                    <li>Откройте Supabase Dashboard → SQL Editor</li>
                    <li>Скопируйте ВЕСЬ код из файла <strong>setup_database_basic.sql</strong></li>
                    <li>Вставьте в SQL Editor и нажмите "Run"</li>
                    <li>Увидите "Успешно настроено!" с количеством записей</li>
                    <li>Обновите эту страницу - ошибка исчезнет</li>
                  </ol>
                )}
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push('/dashboard')}>
                Вернуться к дашборду
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Попробовать снова
              </Button>
              {isDatabaseError && (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('/api/database-status', '_blank')}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    Проверить статус БД
                  </Button>
                  {(error.includes('правами доступа') || error.includes('permission') || error.includes('policy')) && (
                    <Button 
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/disable-rls', { method: 'POST' })
                          const result = await response.json()
                          if (result.success) {
                            alert('RLS отключен! Обновите страницу.')
                            window.location.reload()
                          } else {
                            alert('Ошибка отключения RLS: ' + result.error)
                          }
                        } catch (err) {
                          alert('Ошибка: ' + err)
                        }
                      }}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      🔧 Отключить RLS
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Дашборд
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Самодиагностика цифровых навыков
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Шаг {currentStep + 1} из {steps.length}: {steps[currentStep]?.title}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {Math.round(progress)}%
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 0: Professional Information */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                Профессиональная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Текущая профессия *
                  </label>
                  <select
                    value={formData.current_profession_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_profession_id: e.target.value }))}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Выберите профессию</option>
                    {professions.map(profession => (
                      <option key={profession.id} value={profession.id}>
                        {profession.name_ru}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Регион работы *
                  </label>
                  <select
                    value={formData.region_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, region_id: e.target.value }))}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Выберите регион</option>
                    {regions.map(region => (
                      <option key={region.id} value={region.id}>
                        {region.name_ru}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Опыт работы (лет)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Текущая зарплата (руб./мес.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.current_salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_salary: parseInt(e.target.value) || 0 }))}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Например: 50000"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleNext}
                  disabled={!formData.current_profession_id || !formData.region_id}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Далее
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Skills Assessment */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {skillCategories.map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-blue-600" />
                    </div>
                    {category.name_ru}
                  </CardTitle>
                  <p className="text-sm text-slate-600">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allSkills
                      .filter(skill => skill.category_id === category.id)
                      .map(skill => (
                        <div key={skill.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-slate-900">{skill.name_ru}</h4>
                              <p className="text-sm text-slate-600">{skill.description}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Ваш уровень владения:
                              </label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(level => (
                                  <Button
                                    key={level}
                                    variant={
                                      formData.skill_assessments[skill.id]?.self_assessment_level === level 
                                        ? "default" 
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() => handleSkillAssessment(
                                      skill.id, 
                                      level, 
                                      formData.skill_assessments[skill.id]?.confidence_level || 3
                                    )}
                                    className="flex-1"
                                  >
                                    {level}
                                  </Button>
                                ))}
                              </div>
                              <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>Начинающий</span>
                                <span>Экспертный</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Уверенность в оценке:
                              </label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(confidence => (
                                  <Button
                                    key={confidence}
                                    variant={
                                      formData.skill_assessments[skill.id]?.confidence_level === confidence 
                                        ? "default" 
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() => handleSkillAssessment(
                                      skill.id,
                                      formData.skill_assessments[skill.id]?.self_assessment_level || 1,
                                      confidence
                                    )}
                                  >
                                    <Star className="w-3 h-3" />
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              <Button
                onClick={handleNext}
                disabled={Object.keys(formData.skill_assessments).length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Получить результаты
                <TrendingUp className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Submit */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Завершение диагностики
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div>
                <p className="text-lg mb-4">
                  Готово! Теперь мы проанализируем ваши навыки и сравним их с требованиями рынка труда.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Что вы получите:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Оценку конкурентоспособности</li>
                    <li>• Сравнение с рынком труда</li>
                    <li>• Персональные рекомендации</li>
                    <li>• План развития навыков</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Анализируем...' : 'Завершить диагностику'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default SkillsAssessmentPage
