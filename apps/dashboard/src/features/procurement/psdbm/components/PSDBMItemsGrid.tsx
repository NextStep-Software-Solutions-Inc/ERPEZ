/**
 * PSDBM Items Grid Component
 * 
 * Displays PSDBM catalog items in a table format
 * Allows selection with checkboxes and quantity adjustment
 * 
 * Reference: Used in AddItemDialog refactored version
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Image as ImageIcon } from 'lucide-react'
import type { PSDBMItem, PSDBMItemWithQuantity } from '../types'

interface PSDBMItemsGridProps {
  items: PSDBMItem[]
  selectedItems: Map<string, PSDBMItemWithQuantity>
  onItemSelect: (item: PSDBMItem, selected: boolean) => void
  onQuantityChange: (itemCode: string, quantity: number) => void
  onSelectAll: (selected: boolean) => void
  isLoading?: boolean
  error?: string | null
}

export function PSDBMItemsGrid({
  items,
  selectedItems,
  onItemSelect,
  onQuantityChange,
  onSelectAll,
  isLoading = false,
  error = null,
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
      <div className="border rounded-lg p-8 bg-red-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
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
      <div className="border rounded-lg p-8">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-gray-200 border-t-blue-500 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected && items.length > 0}
                onCheckedChange={handleSelectAllChange}
                aria-label="Select all items"
              />
            </TableHead>
            <TableHead className="w-24">Image</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="w-20 text-center">Qty</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((item) => {
              const selected = selectedItems.has(item.itemCode)
              const selectedItem = selectedItems.get(item.itemCode)
              const quantity = selectedItem?.quantity ?? 1
              const total = item.unitPrice * quantity

              return (
                <TableRow key={item.itemCode} className={selected ? 'bg-blue-50' : ''}>
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
                          className="h-16 w-16 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-100 rounded border flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Item Code */}
                  <TableCell className="font-mono text-sm font-semibold">
                    {item.itemCode}
                  </TableCell>

                  {/* Description */}
                  <TableCell className="max-w-xs">
                    <p className="text-sm line-clamp-2">{item.description}</p>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-right font-medium">
                    ₱{item.unitPrice.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>

                  {/* Unit */}
                  <TableCell className="text-sm text-gray-600">
                    {item.unit}
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
                        className="w-16 text-center h-8"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>

                  {/* Total Amount */}
                  <TableCell className="text-right font-semibold">
                    {selected ? (
                      <span className="text-blue-600">
                        ₱{total.toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <p className="text-gray-500">No items found</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
