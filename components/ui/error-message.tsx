import { AlertTriangle } from "lucide-react"

export interface ErrorMessageProps {
  message: string
  className?: string
  onRetry?: () => void
}

export function ErrorMessage({ 
  message, 
  className = "",
  onRetry 
}: ErrorMessageProps) {
  return (
    <div 
      className={`bg-destructive/10 border border-destructive/30 text-destructive dark:text-destructive-foreground p-4 rounded-md flex items-start gap-3 ${className}`}
    >
      <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="mt-2 text-sm font-medium underline hover:opacity-80 transition-opacity"
          >
            Повторить
          </button>
        )}
      </div>
    </div>
  )
}
