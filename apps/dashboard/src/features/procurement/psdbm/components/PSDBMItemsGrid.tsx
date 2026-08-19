/**
 * PSDBM Items Grid Component
 * 
 * Displays PSDBM catalog items in a structured table format
 * Displays authoritative Available Stock on Hand and Remaining Delivery Qty
 * Allows item selection and quantity adjustment
 */

import { useCallback, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import type { PSDBMItem, PSDBMItemWithQuantity } from '../types'

interface PSDBMItemsGridProps {
  items: PSDBMItem[]
  selectedItems: Map<string, PSDBMItemWithQuantity>
  onItemSelect: (item: PSDBMItem, selected: boolean) => void
  onQuantityChange: (itemCode: string, quantity: number) => void
  onSelectAll: (selected: boolean) => void
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
}

export function PSDBMItemsGrid({
  items,
  selectedItems,
  onItemSelect,
  onQuantityChange,
  onSelectAll,
  isLoading = false,
  error = null,
  emptyMessage = 'No items found matching your filter criteria.',
}: PSDBMItemsGridProps) {
  // Calculate if all items are selected
  const allSelected = useMemo(() => {
    if (items.length === 0) return false
    return items.every((item) => selectedItems.has(item.itemCode))
  }, [items, selectedItems])

  // Handle select all toggle
  const handleSelectAllChange = useCallback(
    (checked: boolean) => {
      onSelectAll(checked)
    },
    [onSelectAll]
  )

  // Handle individual item selection
  const handleItemChange = useCallback(
    (item: PSDBMItem, checked: boolean) => {
      onItemSelect(item, checked)
    },
    [onItemSelect]
  )

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (itemCode: string, value: string) => {
      const quantity = Math.max(1, parseInt(value) || 1)
      onQuantityChange(itemCode, quantity)
    },
    [onQuantityChange]
  )

  if (error) {
    return (
      <div className="border rounded-lg p-6 bg-red-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">Error loading items</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg p-12">
        <div className="flex flex-col justify-center items-center gap-3">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-gray-200 border-t-primary rounded-full" />
          </div>
          <p className="text-sm text-muted-foreground">Loading catalog items and stock availability...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 select-none">
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected && items.length > 0}
                onCheckedChange={handleSelectAllChange}
                aria-label="Select all items"
              />
            </TableHead>
            <TableHead className="w-16">Image</TableHead>
            <TableHead className="w-32">Item Code</TableHead>
            <TableHead>Description & Specifications</TableHead>
            <TableHead className="w-28 text-right">Unit Price</TableHead>
            <TableHead className="w-20">UOM</TableHead>
            <TableHead className="w-36 text-center">Warehouse Stock</TableHead>
            <TableHead className="w-28 text-center">Delivery</TableHead>
            <TableHead className="w-24 text-center">Req. Qty</TableHead>
            <TableHead className="w-28 text-right">Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((item) => {
              const selected = selectedItems.has(item.itemCode)
              const selectedItem = selectedItems.get(item.itemCode)
              const quantity = selectedItem?.quantity ?? 1
              const total = item.unitPrice * quantity
              const stock = item.availableStock ?? 0
              const pendingDelivery = item.remainingQtyForDelivery ?? 0

              return (
                <TableRow
                  key={item.itemCode}
                  className={`transition-colors hover:bg-muted/30 ${selected ? 'bg-primary/5 font-medium' : ''}`}
                >
                  {/* Checkbox */}
                  <TableCell>
                    <Checkbox
                      checked={selected}
                      onCheckedChange={(checked) =>
                        handleItemChange(item, checked as boolean)
                      }
                      aria-label={`Select ${item.description}`}
                    />
                  </TableCell>

                  {/* Image */}
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.description}
                          className="h-12 w-12 object-cover rounded border bg-background"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded border flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Item Code */}
                  <TableCell className="font-mono text-xs font-semibold text-foreground">
                    {item.itemCode}
                  </TableCell>

                  {/* Description & Category & Tech Specs */}
                  <TableCell className="max-w-md">
                    <div className="space-y-1">
                      <p className="text-sm leading-snug line-clamp-2">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {item.category && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {item.category}
                          </Badge>
                        )}
                        {item.technicalSpecificationUrl && (
                          <a
                            href={item.technicalSpecificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="h-3 w-3" />
                            <span>Tech Specs</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Unit Price */}
                  <TableCell className="text-right font-medium text-sm">
                    ₱{item.unitPrice.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>

                  {/* Unit */}
                  <TableCell className="text-xs text-muted-foreground font-medium">
                    {item.unit}
                  </TableCell>

                  {/* Warehouse Stock on Hand */}
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      {item.lastSyncedAt ? (
                        stock > 0 ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold px-2 py-0.5 whitespace-nowrap"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                            {stock.toLocaleString()} {item.unit}
                          </Badge>
                        ) : (
                          <Badge
                            variant="destructive"
                            className="bg-red-50 text-red-700 border-red-200 text-xs font-semibold px-2 py-0.5"
                          >
                            Out of Stock
                          </Badge>
                        )
                      ) : (
                        item.availability?.toLowerCase() === 'out of stock' ? (
                          <Badge
                            variant="destructive"
                            className="bg-red-50 text-red-700 border-red-200 text-xs font-semibold px-2 py-0.5"
                          >
                            Out of Stock
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-blue-50/50 text-blue-700 border-blue-200 text-xs font-medium px-2 py-0.5"
                          >
                            {item.availability || 'Available'}
                          </Badge>
                        )
                      )}
                    </div>
                  </TableCell>

                  {/* Pending Deliveries */}
                  <TableCell className="text-center">
                    {pendingDelivery > 0 ? (
                      <span className="inline-flex items-center text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 whitespace-nowrap">
                        <Clock className="h-3 w-3 mr-1" />
                        {pendingDelivery.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Quantity Input */}
                  <TableCell>
                    {selected ? (
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.itemCode, e.target.value)
                        }
                        className="w-16 text-center h-8 mx-auto"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="text-center text-muted-foreground text-xs">-</div>
                    )}
                  </TableCell>

                  {/* Subtotal */}
                  <TableCell className="text-right font-semibold text-sm">
                    {selected ? (
                      <span className="text-primary font-mono">
                        ₱{totalAmount.toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs font-mono">-</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-12">
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
