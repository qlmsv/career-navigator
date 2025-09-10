'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, UserPlus, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminSetupPage() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('admin123')
  const [fullName, setFullName] = useState('Admin User')
  const [isCreating, setIsCreating] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isGranting, setIsGranting] = useState(false)
  const [created, setCreated] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const createAdmin = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCreated(true)
        toast({
          title: 'Админ создан!',
          description: 'Пользователь успешно создан'
        })
      } else {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать админа',
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const confirmEmail = async () => {
    setIsConfirming(true)
    try {
      const response = await fetch('/api/admin/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Email подтвержден!',
          description: 'Теперь можно войти в систему'
        })
      } else {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подтвердить email',
        variant: 'destructive'
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const grantAdminRole = async () => {
    setIsGranting(true)
    try {
      const response = await fetch('/api/admin/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Права админа выданы!',
          description: 'Теперь можно войти в админ панель'
        })
      } else {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выдать права админа',
        variant: 'destructive'
      })
    } finally {
      setIsGranting(false)
    }
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
              Настройка админа
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <Card className="w-full max-w-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Создание админа
            </CardTitle>
            <CardDescription>
              Создайте администратора для управления системой
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Полное имя</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Admin User"
              />
            </div>

            <div className="space-y-2">
              <Button
                onClick={createAdmin}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Создаем...
                  </div>
                ) : (
                  '1. Создать пользователя'
                )}
              </Button>

              {created && (
                <>
                  <Button
                    onClick={confirmEmail}
                    disabled={isConfirming}
                    variant="outline"
                    className="w-full"
                  >
                    {isConfirming ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                        Подтверждаем...
                      </div>
                    ) : (
                      '2. Подтвердить email'
                    )}
                  </Button>

                  <Button
                    onClick={grantAdminRole}
                    disabled={isGranting}
                    variant="outline"
                    className="w-full"
                  >
                    {isGranting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                        Выдаем права...
                      </div>
                    ) : (
                      '3. Выдать права админа'
                    )}
                  </Button>

                  <Button
                    onClick={() => router.push('/auth')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Войти в систему
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
