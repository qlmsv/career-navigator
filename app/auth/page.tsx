'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  LogIn,
  UserPlus,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react'

export default function AuthPage() {
  const { user, signIn, signUp, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Редирект если пользователь уже авторизован
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (isLogin) {
        // Авторизация
        const { error } = await signIn(email, password)
        if (error) {
          toast({
            title: 'Ошибка входа',
            description: typeof error === 'string' ? error : 'Произошла ошибка при входе',
            variant: 'destructive'
          })
          return
        }
        
        toast({
          title: 'Добро пожаловать!',
          description: 'Вы успешно вошли в систему'
        })
        router.push('/dashboard')
      } else {
        // Регистрация
        if (password !== confirmPassword) {
          toast({
            title: 'Ошибка',
            description: 'Пароли не совпадают',
            variant: 'destructive'
          })
          return
        }

        const { error } = await signUp(email, password, {
          full_name: fullName
        })
        
        if (error) {
          toast({
            title: 'Ошибка регистрации',
            description: typeof error === 'string' ? error : 'Произошла ошибка при регистрации',
            variant: 'destructive'
          })
          return
        }

        toast({
          title: 'Регистрация успешна!',
          description: 'Проверьте почту для подтверждения аккаунта'
        })
      }
    } catch (error) {
      toast({
        title: 'Произошла ошибка',
        description: 'Попробуйте еще раз',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFullName('')
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    resetForm()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-slate-600 dark:text-slate-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              На главную
            </Button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Карьерный навигатор
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <Card className="w-full max-w-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              {isLogin ? (
                <LogIn className="w-6 h-6 text-white" />
              ) : (
                <UserPlus className="w-6 h-6 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'Вход в систему' : 'Регистрация'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Войдите в свой аккаунт для доступа к диагностике навыков' 
                : 'Создайте аккаунт для начала самодиагностики'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Полное имя</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="fullName"
                      placeholder="Иван Иванов"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
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
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 h-6 w-6 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    {isLogin ? 'Входим...' : 'Регистрируем...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isLogin ? 'Войти' : 'Зарегистрироваться'}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
              </p>
              <Button
                variant="link"
                className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                onClick={switchMode}
              >
                {isLogin ? 'Зарегистрироваться' : 'Войти'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
