import * as React from 'react'
import { Filter, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface DataTableAdvancedFilterPopoverProps {
  title?: string
  activeCount?: number
  onReset?: () => void
  children: React.ReactNode
  className?: string
  contentClassName?: string
  align?: 'start' | 'center' | 'end'
}

export function DataTableAdvancedFilterPopover({
  title = 'Filters',
  activeCount = 0,
  onReset,
  children,
  className,
  contentClassName,
  align = 'start',
}: DataTableAdvancedFilterPopoverProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 gap-2 border-dashed text-xs font-medium transition-all hover:bg-muted/50',
            activeCount > 0 && 'border-primary/50 bg-primary/5 text-primary ring-1 ring-primary/20',
            className,
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          <span>{title}</span>
          {activeCount > 0 && (
            <Badge
              variant="default"
              className="ml-0.5 h-4 min-w-4 rounded-full px-1 flex items-center justify-center text-[10px] bg-primary text-primary-foreground leading-none"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn('w-[320px] p-0 shadow-lg border-border', contentClassName)}
      >
        <div className="flex items-center justify-between border-b px-3.5 py-2.5 bg-muted/20">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">{title}</span>
            {activeCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {activeCount} active
              </Badge>
            )}
          </div>
          {activeCount > 0 && onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[360px] p-3.5">
          <div className="space-y-4">
            {children}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
