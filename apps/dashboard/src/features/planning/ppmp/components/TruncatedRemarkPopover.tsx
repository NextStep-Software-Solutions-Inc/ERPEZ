import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface TruncatedRemarkPopoverProps {
  value?: string | null
  placeholder?: string
  className?: string
}

export function TruncatedRemarkPopover({
  value,
  placeholder = '—',
  className,
}: TruncatedRemarkPopoverProps) {
  const normalized = value?.trim() ?? ''

  if (!normalized) {
    return (
      <span className={cn('text-xs text-foreground', className)}>
        {placeholder}
      </span>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'h-auto w-full justify-start px-0 py-0 text-left text-xs font-normal text-foreground hover:bg-transparent hover:text-foreground',
            className,
          )}
        >
          <span className="block w-full truncate">{normalized}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80 space-y-2 p-3">
        <p className="text-sm font-medium leading-none">Remarks</p>
        <p className="whitespace-pre-wrap wrap-break-word text-xs text-muted-foreground">
          {normalized}
        </p>
      </PopoverContent>
    </Popover>
  )
}
