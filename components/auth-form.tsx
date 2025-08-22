'use client'

import { useState } from 'react'
import { logger } from '@/lib/logger'
import { useAuth } from './auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { createClient } from '@/lib/supabase/client'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  userType: 'candidate' | 'hr'
  onToggleMode: () => void
  onSuccess?: () => void
}

export function AuthForm({ mode, userType, onToggleMode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn, signUp } = useAuth()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Пароли не совпадают')
        }

        const metadata = {
          name,
          user_type: userType,
          ...(userType === 'hr' && { company }),
        }

        const { error } = await signUp(email, password, metadata)
        if (error) throw error

        alert('Проверьте email для подтверждения регистрации!')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error

        onSuccess?.()
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    try {
      setIsLoading(true)
      setError('')
      const res = await fetch('/api/auth/magic-link/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Не удалось отправить ссылку')
      alert(
        'Магик‑ссылка отправлена на email (в демо — возвращается в ответе):\n' +
          (data.magicLink || ''),
      )
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async () => {
    logger.info('🚀 Starting Google OAuth for user type:', userType)
    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
      logger.info('📝 OAuth response:', { data, error })

      if (error) {
        logger.error('❌ OAuth error:', error)
        throw error
      }

      logger.info('✅ OAuth initiated successfully, waiting for redirect...')
      // OAuth перенаправит на callback, который обработает переход
    } catch (err: any) {
      logger.error('💥 OAuth failed:', err)
      setError(err.message || 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <div className="w-5 h-5 bg-primary-foreground rounded-sm"></div>
            </div>
            <h1 className="text-2xl font-bold">HR AI Platform</h1>
          </div>
          <p className="text-muted-foreground">
            {userType === 'candidate' ? 'Откройте свой потенциал' : 'Управление талантами'}
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {mode === 'signin' ? 'Вход' : 'Регистрация'}
              </CardTitle>
              <ThemeToggle />
            </div>
            <CardDescription>
              {mode === 'signin'
                ? 'Войдите в свой аккаунт'
                : `Создайте аккаунт ${userType === 'candidate' ? 'пользователя' : 'HR'}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Magic link */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={handleMagicLink}
                disabled={isLoading || !email}
              >
                Выслать ссылку для входа
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">или</span>
              </div>
            </div>

            {/* OAuth */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={handleOAuthSignIn}
                disabled={isLoading}
              >
                <Chrome className="w-4 h-4 mr-2" /> Войти через Google
              </Button>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    placeholder="Ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              {mode === 'signup' && userType === 'hr' && (
                <div className="space-y-2">
                  <Label htmlFor="company">Компания</Label>
                  <Input
                    id="company"
                    placeholder="Название компании"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? 'Загрузка...' : mode === 'signin' ? 'Войти' : 'Зарегистрироваться'}
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {mode === 'signin' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
              </span>{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-primary hover:underline font-medium"
              >
                {mode === 'signin' ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </div>

            {/* Demo Account Info */}
            {mode === 'signin' && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-center mb-2">
                  🎭 Демо аккаунт для тестирования:
                </p>
                <div className="bg-background rounded p-2 font-mono text-center text-sm">
                  {userType === 'hr' && (
                    <>
                      <p>Email: hr@demo.com</p>
                      <p>Пароль: demo123</p>
                    </>
                  )}
                  {(userType === 'candidate' || !userType) && (
                    <>
                      <p>Email: user@demo.com</p>
                      <p>Пароль: demo123</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>© 2024 HR AI Platform. Все права защищены.</p>
        </div>
      </div>
    </div>
  )
}
