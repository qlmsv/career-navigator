'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminAnalyticsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [stats, setStats] = useState<any>({ tests: 0, attempts: 0, avgPercentage: 0, completionRate: 0 })

  useEffect(() => {
    ;(async () => {
      const { data: sessionRes } = await supabase.auth.getSession()
      const uid = sessionRes.session?.user?.id
      if (!uid) { router.replace('/admin'); return }
      setIsAdmin(true)

      const [{ count: testsCount }, { count: attemptsCount }] = await Promise.all([
        supabase.from('tests').select('*', { count: 'exact', head: true }),
        supabase.from('test_attempts').select('*', { count: 'exact', head: true })
      ])

      // Average percentage and completion rate (simple approx)
      const { data: attempts } = await supabase
        .from('test_attempts')
        .select('percentage,status')
        .limit(1000)

      const percentages = (attempts || []).map(a => a.percentage || 0)
      const avg = percentages.length ? (percentages.reduce((s, x) => s + x, 0) / percentages.length) : 0
      const cr = (attempts || []).length
        ? ((attempts || []).filter(a => a.status === 'completed').length / (attempts || []).length) * 100
        : 0
      setStats({ tests: testsCount || 0, attempts: attemptsCount || 0, avgPercentage: Math.round(avg), completionRate: Math.round(cr) })
    })()
  }, [router, supabase])

  if (isAdmin === false) return <div className="p-6">Доступ запрещен</div>

  return (
    <div className="max-w-4xl mx-auto p-6 grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle>Всего тестов</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">{stats.tests}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Всего попыток</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">{stats.attempts}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Средний процент</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">{stats.avgPercentage}%</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Completion Rate</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">{stats.completionRate}%</CardContent>
      </Card>
    </div>
  )
}


