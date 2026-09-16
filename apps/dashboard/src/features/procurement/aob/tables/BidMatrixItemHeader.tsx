import React from 'react'
import { TableHead } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { LineItem } from '../types/aobTypes'

interface BidMatrixItemHeaderProps {
  item: LineItem
  itemNumber: number
  formatPHP: (amount: number | null | undefined) => string
}

export function BidMatrixItemHeader({
  item,
  itemNumber,
  formatPHP,
}: BidMatrixItemHeaderProps) {
  const abcUnitPrice = item.abcUnitPrice || item.approvedBudgetForContract || 0
  const totalABC = item.totalABC || (abcUnitPrice * (item.quantity || 1))
  const displayName = item.description || item.name || `Item #${itemNumber}`
  const formattedItemNum = item.itemCode || `Item #${itemNumber}`

  return (
    <TableHead
      colSpan={2}
      className="text-center bg-muted/20 border-x py-3 px-3 align-top"
    >
      <div className="flex flex-col items-center gap-1.5 min-w-[220px] max-w-[280px] mx-auto text-center">
        {/* Top row: Item badge and Category */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span className="font-bold text-xs text-foreground">
            {formattedItemNum}
          </span>
          {item.category && (
            <Badge
              variant="outline"
              className="text-[10px] py-0 px-2 font-normal text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/40 rounded-full"
            >
              {item.category}
            </Badge>
          )}
        </div>

        {/* Product Name with Radix Tooltip */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                tabIndex={0}
                className="font-bold text-xs text-foreground line-clamp-2 text-center cursor-default hover:text-primary transition-colors focus:outline-hidden focus:underline"
              >
                {displayName}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs text-left">
              <p className="font-bold mb-0.5">{formattedItemNum}: {displayName}</p>
              {item.category && <p className="text-[11px] text-muted-foreground">Category: {item.category}</p>}
              <p className="text-[11px] text-muted-foreground">Unit ABC: {formatPHP(abcUnitPrice)}</p>
              <p className="text-[11px] text-muted-foreground">Total ABC: {formatPHP(totalABC)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Quantity */}
        <div className="text-[11px] text-muted-foreground font-normal text-center">
          Quantity: <span className="font-semibold text-foreground">{item.quantity}</span> {item.unit || 'Units'}
        </div>

        {/* Green ABC Unit Budget Box */}
        <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-md border border-emerald-200 dark:border-emerald-800 w-full text-center mt-1">
          <span className="font-medium text-[10px] uppercase text-emerald-700 dark:text-emerald-400 block tracking-wider">
            ABC Unit Budget
          </span>
          <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
            {formatPHP(abcUnitPrice)}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
            Total: {formatPHP(totalABC)}
          </span>
        </div>
      </div>
    </TableHead>
  )
}

export function BidMatrixItemSubheaders({ itemId }: { itemId: string }) {
  return (
    <React.Fragment key={`${itemId}-subheaders`}>
      <TableHead className="text-center text-xs font-semibold text-foreground w-[110px] min-w-[110px] border-l py-2 bg-muted/20">
        Unit Bid
      </TableHead>
      <TableHead className="text-center text-xs font-semibold text-foreground w-[120px] min-w-[120px] border-r py-2 bg-muted/20">
        Total Bid
      </TableHead>
    </React.Fragment>
  )
}
