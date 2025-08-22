'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Download, 
  ExternalLink,
  User,
  Settings,
  Share2,
  BookOpen,
  Award
} from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/animated-transitions'

export function QuickActions() {
  const router = useRouter()
  
  const actions = [
    {
      title: 'Пройти тест',
      description: 'Анализ личности Big Five',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      action: () => router.push('/ai-assistant'),
      badge: 'Новый'
    },
    {
      title: 'История тестов',
      description: 'Просмотр результатов',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      action: () => router.push('/test-history')
    },
    {
      title: 'Аналитика',
      description: 'Прогресс развития',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      action: () => router.push('/dashboard')
    },
    {
      title: 'Экспорт данных',
      description: 'Скачать отчет',
      icon: Download,
      color: 'from-orange-500 to-red-500',
      action: () => console.log('Export')
    },
    {
      title: 'Настройки',
      description: 'Управление аккаунтом',
      icon: Settings,
      color: 'from-indigo-500 to-purple-500',
      action: () => console.log('Settings')
    },
    {
      title: 'Поделиться',
      description: 'Экспорт в LinkedIn',
      icon: Share2,
      color: 'from-teal-500 to-cyan-500',
      action: () => console.log('Share')
    }
  ]

  return (
    <StaggerContainer>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <StaggerItem key={action.title}>
              <Card 
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{action.title}</h3>
                        {action.badge && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {action.description}
                      </p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          )
        })}
      </div>
    </StaggerContainer>
  )
}
