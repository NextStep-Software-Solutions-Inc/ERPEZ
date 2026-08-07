/**
 * Consolidated Items Table Component
 * Displays line items from PPMP/APP consolidated into APR
 */

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoreVertical, Trash2, Plus } from 'lucide-react'
import { formatCurrencyPHP } from '@/utils/formatters'
import type { ConsolidatedAPRItem } from '../types'

interface ConsolidatedItemsTableProps {
  items: ConsolidatedAPRItem[]
  status?: string
  onRemoveItem?: (itemCode: string) => void
  onAddPSDBMAvailability?: (itemCode: string, availableQuantity: number) => void
}

interface AddAvailabilityState {
  isOpen: boolean
  itemCode?: string
  itemDescription?: string
  availableQuantity: number
  requestedQuantity: number
}

export function ConsolidatedItemsTable({
  items,
  status = 'DRAFT',
  onRemoveItem,
  onAddPSDBMAvailability,
}: ConsolidatedItemsTableProps) {
  const isDraft = status === 'DRAFT'
  const [addAvailabilityDialog, setAddAvailabilityDialog] = useState<AddAvailabilityState>({
    isOpen: false,
    availableQuantity: 0,
    requestedQuantity: 0,
  })

  const getStockStatus = (item: ConsolidatedAPRItem) => {
    // TODO: Replace with actual stock status from backend
    // For now, use a mock status: 70% available, 30% out of stock
    const available = Math.floor(item.quantity * 0.7)
    const outOfStock = item.quantity - available
    return { available, outOfStock, total: item.quantity }
  }

  const handleOpenAddAvailability = (item: ConsolidatedAPRItem) => {
    const status = getStockStatus(item)
    setAddAvailabilityDialog({
      isOpen: true,
      itemCode: item.itemCode,
      itemDescription: item.description,
      availableQuantity: status.available,
      requestedQuantity: item.quantity,
    })
  }

  const handleConfirmAvailability = () => {
    if (addAvailabilityDialog.itemCode) {
      onAddPSDBMAvailability?.(
        addAvailabilityDialog.itemCode,
        addAvailabilityDialog.availableQuantity
      )
    }
    setAddAvailabilityDialog({ isOpen: false, availableQuantity: 0, requestedQuantity: 0 })
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consolidated Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-500">
              No items have been consolidated yet
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Consolidated Items ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Item Code</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Office</TableHead>
                  <TableHead className="font-semibold text-right">Qty Status</TableHead>
                  <TableHead className="font-semibold text-right">
                    Unit Cost
                  </TableHead>
                  <TableHead className="font-semibold text-right">Total</TableHead>
                  <TableHead className="font-semibold">Fund Source</TableHead>
                  {isDraft && <TableHead className="font-semibold text-center">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const status = getStockStatus(item)

                  return (
                    <TableRow
                      key={`${item.itemCode}-${item.office}-${item.fundSource}`}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-mono text-xs">
                        {item.itemCode}
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-sm">{item.office}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        <div className="flex flex-col items-end gap-2">
                          {/* Total Quantity */}
                          <span className="text-sm font-medium text-gray-900">
                            {item.quantity} {item.unit}
                          </span>
                          {/* Availability Badges */}
                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                              <div className="w-2 h-2 rounded-full bg-green-600" />
                              <span>Available: {status.available}</span>
                            </div>
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                              <div className="w-2 h-2 rounded-full bg-red-600" />
                              <span>Out: {status.outOfStock}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatCurrencyPHP(item.unitCost)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold">
                        {formatCurrencyPHP(item.totalAmount)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {item.fundSource}
                      </TableCell>
                      {isDraft && (
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleOpenAddAvailability(item)}
                                className="cursor-pointer"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Add PSDBM Availability</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onRemoveItem?.(item.itemCode)}
                                className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Remove</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Summary Row */}
          <div className="mt-4 pt-4 border-t flex justify-end">
            <div className="flex gap-8">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Items</p>
                <p className="text-lg font-bold text-gray-900">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrencyPHP(
                    items.reduce((sum, item) => sum + item.totalAmount, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add PSDBM Availability Dialog */}
      <Dialog
        open={addAvailabilityDialog.isOpen}
        onOpenChange={(open) =>
          setAddAvailabilityDialog((prev) => ({
            ...prev,
            isOpen: open,
          }))
        }
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add PSDBM Availability</DialogTitle>
            <DialogDescription>
              Update PSDBM availability information for this item
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Item Info */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div>
                <p className="text-xs font-medium text-gray-600">Item Code</p>
                <p className="text-sm font-mono text-gray-900">
                  {addAvailabilityDialog.itemCode}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Description</p>
                <p className="text-sm text-gray-900">
                  {addAvailabilityDialog.itemDescription}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Quantity Requested</p>
                <p className="text-sm font-semibold text-gray-900">
                  {addAvailabilityDialog.requestedQuantity} units
                </p>
              </div>
            </div>

            {/* Available Quantity Input */}
            <div>
              <Label htmlFor="available-qty" className="text-sm font-medium">
                Available Quantity from PSDBM
              </Label>
              <Input
                id="available-qty"
                type="number"
                min="0"
                max={addAvailabilityDialog.requestedQuantity}
                value={addAvailabilityDialog.availableQuantity}
                onChange={(e) =>
                  setAddAvailabilityDialog((prev) => ({
                    ...prev,
                    availableQuantity: Math.min(
                      Math.max(0, parseInt(e.target.value) || 0),
                      prev.requestedQuantity
                    ),
                  }))
                }
                className="mt-1"
                placeholder="Enter available quantity"
              />
              <p className="text-xs text-gray-500 mt-1">
                Out of Stock: {addAvailabilityDialog.requestedQuantity - addAvailabilityDialog.availableQuantity} units
              </p>
            </div>

            {/* Availability Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-green-600">Available</p>
                  <p className="text-lg font-bold text-green-700">
                    {addAvailabilityDialog.availableQuantity}/{addAvailabilityDialog.requestedQuantity}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-600">Out of Stock</p>
                  <p className="text-lg font-bold text-red-700">
                    {addAvailabilityDialog.requestedQuantity - addAvailabilityDialog.availableQuantity}/{addAvailabilityDialog.requestedQuantity}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setAddAvailabilityDialog({ isOpen: false, availableQuantity: 0, requestedQuantity: 0 })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmAvailability}>
              Confirm Availability
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
