import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DataTableResetButtonProps {
  onReset: () => void
  isFiltered?: boolean
  label?: string
  className?: string
}

export function DataTableResetButton({
  onReset,
  isFiltered = true,
  label = 'Reset',
  className,
}: DataTableResetButtonProps) {
  if (!isFiltered) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onReset}
      className={cn(
        'h-8 px-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors',
        className,
      )}
    >
      {label}
      <X className="ml-1.5 h-3.5 w-3.5" />
    </Button>
  )
}
