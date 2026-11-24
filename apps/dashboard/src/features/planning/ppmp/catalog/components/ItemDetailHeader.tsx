/**
 * ItemDetailHeader
 * Top section of the detail panel: item name, category badge, and classification.
 */

import { Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { NONCSEItem } from '@/features/planning/non-cse-item/types/non-cse.type'

interface ItemDetailHeaderProps {
  item: NONCSEItem | null
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

  return (
    <div className="flex flex-col gap-1.5 pb-4 border-b border-border">
      {/* Top row: name + category */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
          <h2 className="text-base font-semibold leading-tight truncate">
            {item.name || 'Unnamed Item'}
          </h2>
        </div>

        <Badge variant="outline" className="shrink-0 text-xs bg-muted">
          {item.procurementCategoryName || 'Goods'}
        </Badge>
      </div>

      {/* Product Code + UoM */}
      <div className="flex items-center gap-3">
        {item.productCode && (
          <span className="font-mono text-xs text-muted-foreground">
            {item.productCode}
          </span>
        )}
        {item.productCode && (
          <span className="text-muted-foreground/40 text-xs">•</span>
        )}
        <span className="text-xs text-muted-foreground capitalize">
          {item.uomName || '—'}
        </span>
      </div>
    </div>
  )
}
