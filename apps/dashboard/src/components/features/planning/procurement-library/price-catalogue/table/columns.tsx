import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { PriceCatalogueActions } from '../dialog/PriceCatalogueActions'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { PriceCatalogueItem } from '../../types'

interface Handlers {
  onView: (item: PriceCatalogueItem) => void
  onEdit: (item: PriceCatalogueItem) => void
  onDelete: (id: string) => void
}

export const getColumns = (handlers: Handlers): ColumnDef<PriceCatalogueItem>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'itemName',
    header: 'Item Name',
    cell: ({ row }) => <span className="font-medium">{row.getValue('itemName')}</span>,
  },
  {
    accessorKey: 'unitPrice',
    header: 'Unit Price',
    cell: ({ row }) => {
      const price = row.getValue('unitPrice') as number
      return <span className="font-mono">₱{price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    },
  },
  {
    accessorKey: 'lastUpdated',
    header: 'Last Updated',
    cell: ({ row }) => {
      const date = new Date(row.getValue('lastUpdated') as string)
      return <span className="text-sm">{date.toLocaleDateString('en-PH')}</span>
    },
  },
  {
    id: 'priceWarning',
    header: 'Alert',
    cell: ({ row }) => {
      const data = row.original
      const priceHistory = data.priceHistory?.[0]
      if (priceHistory && Math.abs(priceHistory.percentageChange) > 20) {
        const isIncrease = priceHistory.percentageChange > 0
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    {Math.round(Math.abs(priceHistory.percentageChange))}% {isIncrease ? '↑' : '↓'}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-white text-black border border-gray-300">
                <div className="text-sm">
                  <div>Price {isIncrease ? 'increased' : 'decreased'} by {Math.round(Math.abs(priceHistory.percentageChange))}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Previous: ₱{priceHistory.previousPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Current: ₱{priceHistory.currentPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }
      return <span className="text-muted-foreground text-sm">-</span>
    },
  },
  {
    id: 'actions',
    header: ({ column }) => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="flex justify-center">
          <PriceCatalogueActions
            row={item}
            onView={() => handlers.onView(item)}
            onEdit={() => handlers.onEdit(item)}
            onDelete={() => handlers.onDelete(item.id)}
          />
        </div>
      )
    },
  },
]
