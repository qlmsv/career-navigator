import { Loader2 } from "lucide-react"

interface LoadingProps {
  text?: string
  className?: string
}

export function Loading({ text = "Загрузка...", className = "" }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
