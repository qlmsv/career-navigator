import { ThemeToggle } from '@/components/theme-toggle'
import { Brain, Users, Sparkles, ArrowRight, TrendingUp, Target, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Evolv
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/auth"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent/50"
            >
              Вход / Регистрация
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20 max-w-7xl">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-full text-sm text-blue-600 dark:text-blue-400 mb-6">
            <Sparkles className="h-4 w-4" />
            Evolv your career
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Узнайте свой карьерный потенциал за 5 минут
          </h2>
          <p className="max-w-xl mx-auto text-lg text-slate-700 dark:text-slate-200">
            Раскройте свой потенциал с помощью AI-анализа личности. Определите свои сильные стороны.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-10 mb-20">
          <div className="group p-8 rounded-2xl border border-border/50 bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-500/20 group-hover:to-purple-600/20 transition-colors">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Научный подход</h3>
            <p className="text-muted-foreground leading-relaxed">
              Тестирование основано на модели Big Five и современных психометрических методиках.
              Точность анализа — 94%
            </p>
          </div>
          <div className="group p-8 rounded-2xl border border-border/50 bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-500/20 group-hover:to-purple-600/20 transition-colors">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Мгновенный результат</h3>
            <p className="text-muted-foreground leading-relaxed">
              Персональный отчет с рекомендациями по карьере, развитию навыков и совместимости с
              командой — сразу после теста
            </p>
          </div>
          <div className="group p-8 rounded-2xl border border-border/50 bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-500/20 group-hover:to-purple-600/20 transition-colors">
              <Target className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Конкретные действия</h3>
            <p className="text-muted-foreground leading-relaxed">
              Не просто описание личности, а четкий план развития с рекомендациями курсов, профессий
              и компаний
            </p>
          </div>
        </div>

        {/* Start CTA */}
        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-blue-500/5 to-purple-600/5 backdrop-blur-sm p-8 rounded-2xl border border-blue-500/20 shadow-xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Начать карьерный анализ
              </h3>
              <p className="text-muted-foreground">Узнайте, какая профессия подходит именно вам</p>
            </div>
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <a
                    href="/auth"
                    className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-8 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Evolv yourself
                    <TrendingUp className="h-4 w-4" />
                  </a>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Бесплатно всегда
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>5 минут
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    94% точность
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
