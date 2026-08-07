/**
 * Master KPI Table Column Header Component
 * Sortable column header with direction indicators and visibility toggle
 */

import { ArrowDownUpIcon, ChevronDown, ChevronUp, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Column } from '@tanstack/react-table'

interface MasterKpiTableColumnHeaderProps {
  column: Column<any, any>
  title: string
  className?: string
}

export function MasterKpiTableColumnHeader({
  column,
  title,
  className,
}: MasterKpiTableColumnHeaderProps) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ArrowDownUpIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ChevronUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Sort Ascending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ChevronDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Sort Descending
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => column.clearSorting()}
            className="text-amber-600 dark:text-amber-500"
          >
            <ArrowDownUpIcon className="mr-2 h-3.5 w-3.5" />
            Clear Sort
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
