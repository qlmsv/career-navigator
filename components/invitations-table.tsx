'use client'

import { useState, useEffect } from 'react'
import { Copy, CheckCircle, User, Calendar, Mail } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Invitation {
  id: string
  user_name: string
  user_email: string
  unique_code: string
  used_by: string | null
  used_at: string | null
  created_at: string
  candidates?: {
    name: string
    email: string
  }
}

interface InvitationsTableProps {
  invitations: Invitation[]
}

export function InvitationsTable({ invitations }: InvitationsTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const copyInvitationLink = async (code: string) => {
    const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3001'
    const link = `${baseUrl}/invite/${code}`

    try {
      await navigator.clipboard.writeText(link)
      setCopiedCode(code)
      toast({
        title: 'Ссылка скопирована!',
        description: 'Приглашение скопировано в буфер обмена',
      })
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast({
        title: 'Ошибка копирования',
        description: 'Не удалось скопировать ссылку',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (dateString: string) => {
    if (!isClient) return dateString
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  if (invitations.length === 0) {
    return (
      <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-12 text-center">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Приглашений пока нет</h3>
        <p className="text-muted-foreground">Создайте первое приглашение для пользователя</p>
      </div>
    )
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/20">
              <th className="text-left p-4 font-semibold text-sm">Пользователь</th>
              <th className="text-left p-4 font-semibold text-sm">Email</th>
              <th className="text-left p-4 font-semibold text-sm">Статус</th>
              <th className="text-left p-4 font-semibold text-sm">Создано</th>
              <th className="text-left p-4 font-semibold text-sm">Использовано</th>
              <th className="text-left p-4 font-semibold text-sm">Действия</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invitation) => (
              <tr
                key={invitation.id}
                className="border-b border-border/30 hover:bg-accent/30 transition-colors"
              >
                <td className="p-4 font-medium">{invitation.user_name}</td>
                <td className="p-4 text-muted-foreground">{invitation.user_email}</td>
                <td className="p-4">
                  {invitation.used_by ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs font-medium">
                      Использовано
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg text-xs font-medium">
                      Ожидает
                    </span>
                  )}
                </td>
                <td className="p-4 text-muted-foreground text-sm">
                  {formatDate(invitation.created_at)}
                </td>
                <td className="p-4 text-muted-foreground text-sm">
                  {invitation.used_at ? (
                    <div>
                      <p>{formatDate(invitation.used_at)}</p>
                      {invitation.candidates && (
                        <p className="text-xs text-muted-foreground">
                          {invitation.candidates.name}
                        </p>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyInvitationLink(invitation.unique_code)}
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                      title="Копировать ссылку"
                    >
                      {copiedCode === invitation.unique_code ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        const subject = 'Приглашение на тесты'
                        const baseUrl =
                          process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3001'
                        const link = `${baseUrl}/invite/${invitation.unique_code}`
                        const body = `Здравствуйте, ${invitation.user_name}!

Приглашаем вас пройти тесты.

Пройдите тестирование по ссылке: ${link}

С уважением,
Команда HR AI Platform`

                        window.location.href = `mailto:${invitation.user_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                      }}
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                      title="Отправить email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
