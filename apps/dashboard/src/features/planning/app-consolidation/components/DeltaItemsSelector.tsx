import { useMemo, useState, useCallback } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search } from 'lucide-react'
import type { DeltaItem } from '../types'

interface DeltaItemsSelectorProps {
  deltaItems: DeltaItem[]
  selectedItems: DeltaItem[]
  onSelectionChange: (items: DeltaItem[]) => void
  disabled?: boolean
}

/**
 * DeltaItemsSelector Component
 *
 * Displays delta items with comparison of:
 * - Original quantity (from locked APP)
 * - Amended quantity (from new PPMP)
 * - Delta quantity (amendment only, for supplement)
 *
 * Shows breakdown of new items vs modified items
 */
export function DeltaItemsSelector({
  deltaItems,
  selectedItems,
  onSelectionChange,
  disabled = false,
}: DeltaItemsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter items by search query
  const filteredItems = useMemo(() => {
    return deltaItems.filter((item) =>
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [deltaItems, searchQuery])

  // Track selected item codes
  const selectedCodes = useMemo(
    () => new Set(selectedItems.map((item) => item.code)),
    [selectedItems],
  )

  // Handle individual item toggle
  const toggleItem = useCallback(
    (item: DeltaItem) => {
      if (selectedCodes.has(item.code)) {
        onSelectionChange(selectedItems.filter((si) => si.code !== item.code))
      } else {
        onSelectionChange([...selectedItems, item])
      }
    },
    [selectedItems, selectedCodes, onSelectionChange],
  )

  // Handle select all
  const toggleSelectAll = useCallback(() => {
    if (selectedCodes.size === filteredItems.length) {
      // Deselect all visible
      onSelectionChange(selectedItems.filter((si) => !filteredItems.find((fi) => fi.code === si.code)))
    } else {
      // Select all visible
      const newSelected = [...selectedItems]
      filteredItems.forEach((item) => {
        if (!newSelected.find((si) => si.code === item.code)) {
          newSelected.push(item)
        }
      })
      onSelectionChange(newSelected)
    }
  }, [selectedItems, selectedCodes, filteredItems, onSelectionChange])

  const newItemsCount = deltaItems.filter((d) => d.isNewItem).length
  const modifiedItemsCount = deltaItems.filter((d) => !d.isNewItem).length

  return (
    <div className="space-y-4">
      {/* Delta Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-primary">{deltaItems.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">New Items</p>
              <p className="text-2xl font-bold text-green-600">{newItemsCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Modified Items</p>
              <p className="text-2xl font-bold text-blue-600">{modifiedItemsCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by code, description, or unit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          className="pl-10"
        />
      </div>

      {/* Delta Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Delta Items Breakdown</span>
            <span className="text-sm font-normal text-gray-600">
              {selectedItems.length} of {filteredItems.length} selected
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        filteredItems.length > 0 && selectedCodes.size === filteredItems.length
                      }
                      onCheckedChange={() => toggleSelectAll()}
                      disabled={disabled}
                    />
                  </TableHead>
                  <TableHead>Item Type</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Original Qty</TableHead>
                  <TableHead className="text-right">Amended Qty</TableHead>
                  <TableHead className="text-right">Delta</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Delta Amount</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const isSelected = selectedCodes.has(item.code)
                  return (
                    <TableRow
                      key={item.code}
                      className={isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleItem(item)}
                          disabled={disabled}
                        />
                      </TableCell>
                      <TableCell>
                        {item.isNewItem ? (
                          <Badge className="bg-green-100 text-green-800">New</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800">Modified</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.code}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{item.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        {item.isNewItem ? '0' : item.originalQuantity}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.amendedQuantity}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {item.deltaQuantity}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ₱{item.unitCost.toLocaleString('en-PH', { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ₱{item.totalAmount.toLocaleString('en-PH', { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredItems.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              {searchQuery ? 'No items match your search' : 'No delta items available'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Delta Items Selected:</span>
              <span className="font-bold">{selectedItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Total Delta Budget:</span>
              <span className="font-bold text-green-700">
                ₱{selectedItems.reduce((sum, item) => sum + item.totalAmount, 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
