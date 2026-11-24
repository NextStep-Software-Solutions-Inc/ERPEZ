import * as React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface DataTableBulkActionItem {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  variant?: React.ComponentProps<typeof Button>['variant']
  color?: React.ComponentProps<typeof Button>['color']
  className?: string
  disabled?: boolean
}

export interface DataTableBulkActionsProps {
  selectedCount: number
  onClearSelection?: () => void
  actions?: DataTableBulkActionItem[]
  children?: React.ReactNode
  className?: string
}

export function DataTableBulkActions({
  selectedCount,
  onClearSelection,
  actions = [],
  children,
  className,
}: DataTableBulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 text-xs animate-in fade-in-50 duration-200',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 font-medium text-foreground">
        <Badge
          variant="default"
          className="h-5 px-1.5 text-[10px] font-bold rounded bg-primary text-primary-foreground"
        >
          {selectedCount}
        </Badge>
        <span>selected</span>
      </div>

      {onClearSelection && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground rounded-full"
          title="Clear selection"
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Clear selection</span>
        </Button>
      )}

      {(actions.length > 0 || children) && (
        <div className="flex items-center gap-1.5 pl-2 border-l border-primary/20">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || 'outline'}
              color={action.color}
              size="sm"
              disabled={action.disabled}
              onClick={action.onClick}
              className={cn(
                'h-7 px-2.5 text-xs font-semibold uppercase tracking-wider',
                action.variant === 'destructive'
                  ? 'bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30'
                  : '',
                action.className,
              )}
            >
              {action.icon && <span className="mr-1.5">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
          {children}
        </div>
      )}
    </div>
  )
}
