/**
 * NTP Details Toolbar
 * Read-only toolbar showing line items summary information
 */

import { FileText } from 'lucide-react'

export interface NTPDetailsToolbarProps {
  itemsCount: number
  totalAmount: number
  isLoading?: boolean
}

export function NTPDetailsToolbar({
  itemsCount,
  totalAmount,
  isLoading = false,
}: NTPDetailsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">Line Items Summary</span>
      </div>

      <div className="flex gap-6">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Total Items</span>
          <span className="text-lg font-semibold">{itemsCount}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Total Amount</span>
          <span className="text-lg font-semibold">
            {new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
            }).format(totalAmount)}
          </span>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin" />
            Loading...
          </div>
        )}
      </div>
    </div>
  )
}
