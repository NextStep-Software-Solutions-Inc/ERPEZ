import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  message?: string
}

export default function LoadingSpinner({
  size = 'md',
  className,
  message = 'Loading...',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-4',
        className,
      )}
    >
      <Spinner className={cn(sizeClasses[size], 'text-primary')} />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  )
}
