'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

export default function AdminTestsImportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [metaJson, setMetaJson] = useState<string>(`{\n  "title": "Sample Imported Test"\n}`)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [recentTests, setRecentTests] = useState<Array<{ id: string; title: string; status: string; created_at: string }>>([])
  const [grantEmail, setGrantEmail] = useState<string>('')

  // Load recent tests for any authenticated user
  useState(() => {
    (async () => {
      const supabase = createClient()
      const { data: sessionRes } = await supabase.auth.getSession()
      const userId = sessionRes.session?.user?.id
      if (!userId) {
        setIsAdmin(false)
        router.replace('/admin')
        return
      }
      setIsAdmin(true)
      const { data: tests } = await supabase
        .from('tests')
        .select('id,title,status,created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      setRecentTests(tests || [])
    })()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    setError(null)

    try {
      const file = fileInputRef.current?.files?.[0]
      if (!file) {
        setError('Выберите файл CSV или JSON')
        setIsSubmitting(false)
        return
      }

      let meta: any = undefined
      if (metaJson && metaJson.trim().length) {
        try {
          meta = JSON.parse(metaJson)
        } catch (err) {
          setError('Поле метаданных должно быть валидным JSON')
          setIsSubmitting(false)
          return
        }
      }

      // JSON uploads can be sent directly as JSON body for convenience
      if (file.name.endsWith('.json') || file.type === 'application/json') {
        const text = await file.text()
        const payload = JSON.parse(text)
        if (meta && typeof meta === 'object') {
          payload.test = { ...(payload.test || {}), ...meta }
        }
        const res = await fetch('/api/tests/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Ошибка импорта')
        setMessage(`Импорт успешно выполнен. ID теста: ${data.test_id}`)
        return
      }

      // CSV via multipart/form-data
      const formData = new FormData()
      formData.set('file', file)
      if (meta) formData.set('meta', JSON.stringify(meta))

      const res = await fetch('/api/tests/import', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка импорта')
      setMessage(`Импорт успешно выполнен. ID теста: ${data.test_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Импорт тестов</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>Дашборд</Button>
          </div>
        </div>

        {isAdmin === false && (
          <div className="p-4 mb-6 rounded border border-red-200 bg-red-50 text-red-800">
            Доступ запрещен. Нужна роль администратора.
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Загрузка шаблона (CSV или JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file">Файл шаблона</Label>
                <Input ref={fileInputRef} id="file" type="file" accept=".csv,application/json,.json" />
                <p className="text-xs text-slate-500">Поддерживаются: .csv и .json</p>
                <div className="text-xs text-slate-600 flex gap-4">
                  <a className="underline" href="/templates/tests-sample.csv" target="_blank" rel="noreferrer">Скачать CSV шаблон</a>
                  <a className="underline" href="/templates/tests-sample.json" target="_blank" rel="noreferrer">Скачать JSON шаблон</a>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta">Метаданные теста (опционально, JSON)</Label>
                <Textarea id="meta" rows={6} value={metaJson} onChange={(e) => setMetaJson(e.target.value)} />
                <p className="text-xs text-slate-500">Например: {`{"title":"Мой тест"}`}</p>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Импортирую…' : 'Импортировать'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setMessage(null)
                  setError(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}>Сбросить</Button>
              </div>

              {message && (
                <div className="p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">{message}</div>
              )}
              {error && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
              )}
            </form>
          </CardContent>
        </Card>

        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Выдать роль администратора (dev-only)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="email@domain.com" value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} />
                <Button
                  variant="outline"
                  onClick={async () => {
                    setError(null)
                    setMessage(null)
                    try {
                      const res = await fetch('/api/admin/grant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: grantEmail }) })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data.error || 'Ошибка')
                      setMessage('Роль admin выдана')
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Ошибка')
                    }
                  }}
                >Выдать admin</Button>
              </div>
              
              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  onClick={async () => {
                    setError(null)
                    setMessage(null)
                    try {
                      const res = await fetch('/api/admin/make-all-admin', { method: 'POST' })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data.error || 'Ошибка')
                      setMessage(data.message || 'Все пользователи стали админами')
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Ошибка')
                    }
                  }}
                  className="w-full"
                >Сделать всех пользователей админами</Button>
              </div>
              
              <p className="text-xs text-slate-500">Доступно только в режиме разработки</p>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Последние импортированные / созданные тесты</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTests.length === 0 ? (
                <div className="text-sm text-slate-600">Пока нет тестов</div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {recentTests.map(t => (
                    <li key={t.id} className="py-2 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="text-xs text-slate-500">{new Date(t.created_at).toLocaleString()} · {t.status}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(`/tests/${t.id}`, '_blank')}>Открыть</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


