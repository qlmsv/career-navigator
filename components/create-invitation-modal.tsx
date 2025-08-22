'use client'

import { useState } from 'react'
import { X, Copy, CheckCircle, Send } from 'lucide-react'

interface CreateInvitationModalProps {
  isOpen: boolean
  onClose: () => void
  onInvitationCreated: () => void
}

export function CreateInvitationModal({
  isOpen,
  onClose,
  onInvitationCreated,
}: CreateInvitationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [invitationLink, setInvitationLink] = useState('')
  const [step, setStep] = useState<'create' | 'share'>('create')
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    message: 'Приглашаем вас пройти тесты для лучшего понимания ваших профессиональных качеств.',
  })
  const [isCopied, setIsCopied] = useState(false)

  if (!isOpen) return null

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Проверяем доступность localStorage
      if (typeof window === 'undefined') {
        alert('Ошибка: localStorage недоступен')
        return
      }

      const hrUserId = localStorage.getItem('hrUserId')
      if (!hrUserId) {
        alert('Ошибка авторизации. Войдите заново.')
        return
      }

      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: formData.userName,
          userEmail: formData.userEmail,
          message: formData.message,
          hrId: hrUserId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setInvitationLink(data.invitationLink)
        setStep('share')
        onInvitationCreated()
      } else {
        alert('Ошибка создания приглашения')
      }
    } catch (error) {
      console.error('Error creating invitation:', error)
      alert('Ошибка создания приглашения')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const sendEmail = () => {
    const subject = 'Приглашение на тесты'
    const body = `Здравствуйте, ${formData.userName}!

${formData.message}

Пройдите тестирование по ссылке: ${invitationLink}

С уважением,
Команда HR AI Platform`

    window.location.href = `mailto:${formData.userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const resetAndClose = () => {
    setStep('create')
    setInvitationLink('')
    setFormData({
      userName: '',
      userEmail: '',
      message: 'Приглашаем вас пройти тесты для лучшего понимания ваших профессиональных качеств.',
    })
    setIsCopied(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border/50 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-xl font-bold">
            {step === 'create' ? 'Создать приглашение' : 'Поделиться ссылкой'}
          </h2>
          <button
            onClick={resetAndClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'create' ? (
            <form onSubmit={handleCreateInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Имя пользователя</label>
                <input
                  type="text"
                  required
                  value={formData.userName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, userName: e.target.value }))}
                  className="w-full px-3 py-2 border border-border/50 rounded-lg bg-background"
                  placeholder="Иван Иванов"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email пользователя</label>
                <input
                  type="email"
                  required
                  value={formData.userEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, userEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-border/50 rounded-lg bg-background"
                  placeholder="ivan@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Сообщение (опционально)</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-border/50 rounded-lg bg-background h-20 resize-none"
                  placeholder="Персональное сообщение для пользователя..."
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Создаём...' : 'Создать приглашение'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Приглашение создано!</h3>
                <p className="text-sm text-muted-foreground">
                  Поделитесь ссылкой с пользователем {formData.userName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ссылка для приглашения</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={invitationLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-border/50 rounded-lg bg-muted text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 border border-border/50 rounded-lg hover:bg-accent transition-colors"
                    title="Копировать ссылку"
                  >
                    {isCopied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={sendEmail}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Отправить email
                </button>
                <button
                  onClick={resetAndClose}
                  className="px-6 py-3 border border-border/50 rounded-lg hover:bg-accent transition-colors"
                >
                  Готово
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
