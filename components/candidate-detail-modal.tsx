'use client'

import { X, Download, Mail, Star, Briefcase, GraduationCap, Globe } from 'lucide-react'

interface CandidateDetailModalProps {
  candidate: {
    id: string
    name: string
    email: string
    resume_url: string | null
    created_at: string
    test_results: {
      archetype: string | null
      big5_scores: any
      recommendations: string | null
      test_completed: boolean
      resume_analysis: any
    }[]
  }
  isOpen: boolean
  onClose: () => void
}

export function CandidateDetailModal({ candidate, isOpen, onClose }: CandidateDetailModalProps) {
  if (!isOpen) return null

  const testResult = candidate.test_results?.[0]
  const resumeAnalysis = testResult?.resume_analysis

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-2xl font-bold">{candidate.name}</h2>
            <p className="text-muted-foreground">{candidate.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => (window.location.href = `mailto:${candidate.email}`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Написать email
            </button>
            {candidate.resume_url && !candidate.resume_url.startsWith('local_file_') && (
              <button
                onClick={() => candidate.resume_url && window.open(candidate.resume_url, '_blank')}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <Download className="h-4 w-4" />
                Скачать резюме
              </button>
            )}
            {candidate.resume_url && candidate.resume_url.startsWith('local_file_') && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <Download className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-700 dark:text-yellow-400 text-sm">
                    Резюме обработано системой ({candidate.resume_url.replace('local_file_', '')})
                  </span>
                </div>
                {resumeAnalysis ? (
                  <div className="flex items-center gap-2 px-4 py-2 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-green-700 dark:text-green-400 text-sm">
                      ✅ Данные из резюме обработаны AI - смотрите секцию "Анализ резюме" ниже
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-4 py-2 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <svg
                        className="h-4 w-4 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <span className="text-orange-700 dark:text-orange-400 text-sm">
                        ⚠️ Данные из резюме еще обрабатываются AI или произошла ошибка
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/analyze-resume', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              candidateId: candidate.id,
                              resumeText: `Повторный анализ резюме для ${candidate.name}`,
                            }),
                          })
                          const data = await response.json()
                          if (data.success) {
                            alert(
                              'Анализ резюме запущен заново! Обновите страницу через 30 секунд.',
                            )
                          } else {
                            alert('Ошибка при запуске анализа: ' + data.error)
                          }
                        } catch (error) {
                          alert('Ошибка при запуске анализа: ' + error)
                        }
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                    >
                      🔄 Запустить анализ заново
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Archetype */}
              {testResult.archetype && (
                <div className="bg-accent/20 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Архетип личности
                  </h3>
                  <p className="text-primary font-medium">{testResult.archetype}</p>
                </div>
              )}

              {/* Big5 Scores */}
              {testResult.big5_scores && (
                <div className="bg-accent/20 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">Результаты Big Five</h3>
                  <div className="space-y-3">
                    {Object.entries(testResult.big5_scores).map(([trait, score]) => (
                      <div key={trait}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{trait}</span>
                          <span>{Number(score)}/100</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${Number(score)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resume Analysis */}
          {resumeAnalysis && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Анализ резюме</h3>

              {(() => {
                // Обработка разных форматов данных
                if (typeof resumeAnalysis === 'string') {
                  return (
                    <div className="bg-card/50 p-6 rounded-xl border border-border/50">
                      <p className="text-sm">{resumeAnalysis}</p>
                    </div>
                  )
                }

                if (resumeAnalysis?.rawText) {
                  return (
                    <div className="bg-card/50 p-6 rounded-xl border border-border/50">
                      <p className="text-sm whitespace-pre-wrap">{resumeAnalysis.rawText}</p>
                    </div>
                  )
                }

                // Новый структурированный формат
                return (
                  <div className="space-y-6">
                    {/* Personal Info */}
                    {resumeAnalysis?.personal_info && (
                      <div className="bg-card/50 p-6 rounded-xl border border-border/50">
                        <h4 className="font-semibold mb-3 text-primary">Личная информация</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {resumeAnalysis.personal_info.full_name && (
                            <div>
                              <span className="text-muted-foreground">ФИО:</span>{' '}
                              <span className="font-medium">
                                {resumeAnalysis.personal_info.full_name}
                              </span>
                            </div>
                          )}
                          {resumeAnalysis.personal_info.phone && (
                            <div>
                              <span className="text-muted-foreground">Телефон:</span>{' '}
                              <span className="font-medium">
                                {resumeAnalysis.personal_info.phone}
                              </span>
                            </div>
                          )}
                          {resumeAnalysis.personal_info.email && (
                            <div>
                              <span className="text-muted-foreground">Email:</span>{' '}
                              <span className="font-medium">
                                {resumeAnalysis.personal_info.email}
                              </span>
                            </div>
                          )}
                          {resumeAnalysis.personal_info.location && (
                            <div>
                              <span className="text-muted-foreground">Местоположение:</span>{' '}
                              <span className="font-medium">
                                {resumeAnalysis.personal_info.location}
                              </span>
                            </div>
                          )}
                          {resumeAnalysis.personal_info.birth_year && (
                            <div>
                              <span className="text-muted-foreground">Год рождения:</span>{' '}
                              <span className="font-medium">
                                {resumeAnalysis.personal_info.birth_year}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {resumeAnalysis?.experience && resumeAnalysis.experience.length > 0 && (
                      <div className="bg-card/50 p-6 rounded-xl border border-border/50">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                          <Briefcase className="h-4 w-4" />
                          Опыт работы
                        </h4>
                        <div className="space-y-4">
                          {resumeAnalysis.experience.map((exp: any, index: number) => (
                            <div
                              key={index}
                              className="border-l-3 border-primary/30 pl-4 pb-3 last:pb-0"
                            >
                              <div className="font-medium text-foreground">{exp.position}</div>
                              <div className="text-sm text-primary font-medium">{exp.company}</div>
                              <div className="text-xs text-muted-foreground mb-2">
                                {exp.duration}
                              </div>
                              {exp.description && (
                                <div className="text-sm text-muted-foreground">
                                  {exp.description}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {resumeAnalysis?.education && resumeAnalysis.education.length > 0 && (
                      <div className="bg-card/50 p-6 rounded-xl border border-border/50">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                          <GraduationCap className="h-4 w-4" />
                          Образование
                        </h4>
                        <div className="space-y-3">
                          {resumeAnalysis.education.map((edu: any, index: number) => (
                            <div key={index} className="border-l-3 border-blue-300 pl-4">
                              <div className="font-medium">{edu.degree}</div>
                              <div className="text-sm text-muted-foreground">
                                {edu.institution} • {edu.year}
                              </div>
                              {edu.grade && (
                                <div className="text-xs text-green-600">Оценка: {edu.grade}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {resumeAnalysis?.skills && (
                      <div className="bg-card/50 p-6 rounded-xl border border-border/50">
                        <h4 className="font-semibold mb-3 text-primary">Навыки</h4>
                        <div className="space-y-4">
                          {resumeAnalysis.skills.technical &&
                            resumeAnalysis.skills.technical.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-muted-foreground mb-2 block">
                                  Технические навыки:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {resumeAnalysis.skills.technical.map(
                                    (skill: string, index: number) => (
                                      <span
                                        key={index}
                                        className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                                      >
                                        {skill}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          {resumeAnalysis.skills.languages &&
                            resumeAnalysis.skills.languages.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
                                  <Globe className="h-3 w-3" />
                                  Языки:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {resumeAnalysis.skills.languages.map(
                                    (lang: string, index: number) => (
                                      <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm"
                                      >
                                        {lang}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          {resumeAnalysis.skills.soft_skills &&
                            resumeAnalysis.skills.soft_skills.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-muted-foreground mb-2 block">
                                  Soft skills:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {resumeAnalysis.skills.soft_skills.map(
                                    (skill: string, index: number) => (
                                      <span
                                        key={index}
                                        className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm"
                                      >
                                        {skill}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Summary & Other Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {resumeAnalysis?.summary && (
                        <div className="bg-card/50 p-6 rounded-xl border border-border/50">
                          <h4 className="font-semibold mb-3 text-primary">Резюме кандидата</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {resumeAnalysis.summary}
                          </p>
                        </div>
                      )}

                      {resumeAnalysis?.salary_expectations && (
                        <div className="bg-card/50 p-6 rounded-xl border border-border/50">
                          <h4 className="font-semibold mb-3 text-primary">Зарплатные ожидания</h4>
                          <p className="text-sm font-medium text-green-600">
                            {resumeAnalysis.salary_expectations}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Achievements */}
                    {resumeAnalysis?.achievements && resumeAnalysis.achievements.length > 0 && (
                      <div className="bg-card/50 p-6 rounded-xl border border-border/50">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                          <Star className="h-4 w-4" />
                          Достижения
                        </h4>
                        <ul className="space-y-2">
                          {resumeAnalysis.achievements.map((achievement: string, index: number) => (
                            <li
                              key={index}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-primary mt-1">•</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Recommendations */}
          {testResult?.recommendations && (
            <div className="bg-card/50 p-6 rounded-xl border border-border/50">
              <h3 className="text-lg font-semibold mb-3">Карьерные рекомендации</h3>
              <p className="text-muted-foreground leading-relaxed">{testResult.recommendations}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
