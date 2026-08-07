/**
 * ItemDetailHeader
 * Top section of the detail panel: item name, code, status badge, lock indicator.
 */

import { Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { NonCSEItem } from '../types/catalog.types'

interface ItemDetailHeaderProps {
  item: NonCSEItem | null
  isLoading?: boolean
}

export function ItemDetailHeader({ item, isLoading }: ItemDetailHeaderProps) {
  if (isLoading || !item) {
    return (
      <div className="flex flex-col gap-2 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-36" />
      </div>
    )
  }

  const isActive = item.status === 'Active'

  return (
    <div className="flex flex-col gap-1.5 pb-4 border-b border-border">
      {/* Top row: name + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
          <h2 className="text-base font-semibold leading-tight truncate">
            {item.name}
          </h2>
        </div>

        <Badge
          variant="outline"
          className={cn(
            'shrink-0 text-xs capitalize',
            isActive
              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400'
              : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900',
          )}
        >
          {item.status}
        </Badge>
      </div>

      {/* UACS Code + UoM */}
      <div className="flex items-center gap-3">
        {item.uacsCode && (
          <span className="font-mono text-xs text-muted-foreground">
            {item.uacsCode}
          </span>
        )}
        {item.uacsCode && (
          <span className="text-muted-foreground/40 text-xs">•</span>
        )}
        <span className="text-xs text-muted-foreground capitalize">
          {item.unitOfMeasure}
        </span>
      </div>

      {/* Category / subcategory */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{item.category}</span>
        {item.subcategory && (
          <>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <span className="text-xs text-muted-foreground">
              {item.subcategory}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
