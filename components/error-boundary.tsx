'use client'

import React from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="text-center p-8">
      <div className="flex justify-center mb-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Что-то пошло не так</h1>
      <p className="text-muted-foreground mb-6">Произошла ошибка при отображении компонента.</p>
      <pre className="text-sm bg-muted p-2 rounded-md mb-6 text-left whitespace-pre-wrap">
        {error.message}
      </pre>
      <Button onClick={() => window.location.reload()}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Перезагрузить страницу
      </Button>
    </div>
  )
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload()
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

export default ErrorBoundary
