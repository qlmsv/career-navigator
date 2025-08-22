'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Briefcase,
  LogIn,
  UserPlus,
  Target,
  TrendingUp,
  Sparkles,
} from 'lucide-react'

export default function UserAuthPage() {
  const router = useRouter()
  const { signIn, signUp, isLoading, user } = useAuth()
  const { toast } = useToast()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  // Redirect if user is already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Проверка авторизации...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, { name, user_type: 'user' })
        if (error) {
          toast({
            title: 'Ошибка регистрации',
            description: (error as any)?.message ?? 'Неизвестная ошибка',
            variant: 'destructive',
          })
          return
        }
        toast({
          title: 'Регистрация успешна!',
          description: 'Проверьте email для подтверждения',
        })
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          toast({
            title: 'Ошибка входа',
            description: (error as any)?.message ?? 'Неизвестная ошибка',
            variant: 'destructive',
          })
          return
        }

        // После успешного входа пользователя направляем в личный кабинет
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast({
        title: 'Произошла ошибка',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      })
    }
  }

  // OAuth removed

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Evolv
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isSignUp ? 'Начните эволюцию' : 'Добро пожаловать в Evolv'}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp
                ? 'Создайте профиль и откройте свой карьерный потенциал'
                : 'Войдите, чтобы продолжить развитие'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ваше имя"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Загрузка...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isSignUp ? (
                      <>
                        <TrendingUp className="h-4 w-4" />
                        Evolv yourself
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Продолжить развитие
                      </>
                    )}
                  </span>
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
              </button>
            </div>

            <Separator />

            {/* OAuth removed */}

            <Separator />

            {/* Info Section */}
            <div className="space-y-3 text-center">
              <div className="text-sm text-muted-foreground">В вашем профиле будет:</div>
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span>Анализ личности</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span>План развития</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo info removed */}

        {/* Links */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            Уже зарегистрированы?{' '}
            <a href="/dashboard" className="text-blue-600 hover:underline">
              Перейти в профиль
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
