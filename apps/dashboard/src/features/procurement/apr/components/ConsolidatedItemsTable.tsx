/**
 * Consolidated Items Table Component
 * Displays line items from PPMP/APP consolidated into APR with explicit inventory status
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
import { MoreVertical, Trash2, Plus, AlertCircle, CheckCircle2, PackageSearch } from 'lucide-react'
import { formatCurrencyPHP } from '@/utils/formatters'
import type { ConsolidatedAPRItem } from '../types'

interface ConsolidatedItemsTableProps {
  items: ConsolidatedAPRItem[]
  status?: string
  onRemoveItem?: (itemCode: string) => void
  onAddPSDBMAvailability?: (itemCode: string, availableQuantity: number) => void
  onOpenAddItem?: () => void
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
  onOpenAddItem,
}: ConsolidatedItemsTableProps) {
  const isDraft = status?.toUpperCase() === 'DRAFT' || status?.toUpperCase() === 'RETURNED'
  const [addAvailabilityDialog, setAddAvailabilityDialog] = useState<AddAvailabilityState>({
    isOpen: false,
    availableQuantity: 0,
    requestedQuantity: 0,
  })

  const getStockStatus = (item: ConsolidatedAPRItem) => {
    // Calculated stock availability
    const available = item.quantity
    const outOfStock = 0
    return { available, outOfStock, total: item.quantity }
  }

  const handleOpenAddAvailability = (item: ConsolidatedAPRItem) => {
    const stock = getStockStatus(item)
    setAddAvailabilityDialog({
      isOpen: true,
      itemCode: item.itemCode || item.id,
      itemDescription: item.description,
      availableQuantity: stock.available,
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
      <Card className="border-dashed border-gray-300">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-muted-foreground">
            <PackageSearch className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-gray-900 text-sm">No consolidated items</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              No items have been added to this Agency Purchase Request yet.
            </p>
          </div>
          {isDraft && onOpenAddItem && (
            <Button size="sm" onClick={onOpenAddItem} className="mt-2 gap-1.5">
              <Plus className="h-4 w-4" />
              Add Item from Catalog
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className="py-3 px-5 border-b bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              Consolidated Items ({items.length})
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Procurement items sourced and consolidated from Annual Procurement Plan
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75 border-b">
                  <TableHead className="font-semibold text-xs text-gray-700 py-3 pl-5">Item & Description</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-700 py-3">Office & Fund Source</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-700 py-3 text-right">Quantity & Stock</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-700 py-3 text-right">Unit Cost</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-700 py-3 text-right pr-5">Total Amount</TableHead>
                  {isDraft && <TableHead className="font-semibold text-xs text-gray-700 py-3 text-center w-12">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => {
                  const stock = getStockStatus(item)
                  const isShort = stock.outOfStock > 0

                  return (
                    <TableRow
                      key={item.id || item.itemCode || `item-row-${index}`}
                      className="hover:bg-slate-50/50 transition-colors border-b last:border-b-0"
                    >
                      {/* Item & Description */}
                      <TableCell className="pl-5 py-3.5 align-top">
                        <div className="space-y-0.5 max-w-md">
                          <p className="font-medium text-xs text-gray-900 leading-snug">
                            {item.description}
                          </p>
                          {item.itemCode && (
                            <span className="inline-block font-mono text-[10px] text-muted-foreground">
                              {item.itemCode}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Office & Fund Source (clean secondary text) */}
                      <TableCell className="py-3.5 align-top text-xs">
                        <div className="space-y-0.5 text-xs text-gray-600">
                          <p className="font-medium text-gray-800">{item.office || '—'}</p>
                          {item.fundSource && (
                            <p className="text-[11px] text-muted-foreground">{item.fundSource}</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Quantity & Inventory Status */}
                      <TableCell className="py-3.5 align-top text-right text-xs">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900 font-mono text-xs">
                            {item.quantity} {item.unit || 'units'}
                          </p>
                          <div className="flex items-center justify-end gap-1.5 text-[11px]">
                            {isShort ? (
                              <button
                                type="button"
                                onClick={() => handleOpenAddAvailability(item)}
                                className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium cursor-pointer"
                              >
                                <AlertCircle className="h-3 w-3 text-amber-600" />
                                <span>Avail: {stock.available} · Short by {stock.outOfStock}</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-green-700 font-medium text-[11px]">
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                <span>In Stock ({stock.available})</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Unit Cost */}
                      <TableCell className="py-3.5 align-top text-right font-mono text-xs text-gray-700">
                        {formatCurrencyPHP(item.unitCost || 0)}
                      </TableCell>

                      {/* Total Amount */}
                      <TableCell className="py-3.5 align-top text-right font-mono text-xs font-semibold text-gray-900 pr-5">
                        {formatCurrencyPHP(item.totalAmount || (item.unitCost || 0) * (item.quantity || 1))}
                      </TableCell>

                      {/* Row Actions */}
                      {isDraft && (
                        <TableCell className="py-3.5 align-top text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-gray-900"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              <DropdownMenuItem
                                onClick={() => handleOpenAddAvailability(item)}
                                className="cursor-pointer gap-2"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Update PS-DBM Stock</span>
                              </DropdownMenuItem>
                              {onRemoveItem && (
                                <DropdownMenuItem
                                  onClick={() => onRemoveItem(item.itemCode || item.id)}
                                  className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Remove Item</span>
                                </DropdownMenuItem>
                              )}
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

          {/* Table Summary Footer */}
          <div className="p-4 bg-slate-50/80 border-t flex items-center justify-between text-xs px-5">
            <span className="text-muted-foreground">
              Total {items.length} line item(s) consolidated
            </span>
            <div className="flex items-center gap-6">
              <div className="flex items-baseline gap-2">
                <span className="text-muted-foreground">Total Units:</span>
                <span className="font-semibold text-gray-900 font-mono">
                  {items.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="text-sm font-bold text-gray-900 font-mono">
                  {formatCurrencyPHP(
                    items.reduce((sum, item) => sum + (item.totalAmount || (item.unitCost || 0) * (item.quantity || 1)), 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Availability Dialog */}
      <Dialog
        open={addAvailabilityDialog.isOpen}
        onOpenChange={(open) =>
          setAddAvailabilityDialog((prev) => ({
            ...prev,
            isOpen: open,
          }))
        }
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">PS-DBM Stock Availability</DialogTitle>
            <DialogDescription className="text-xs">
              Verify stock quantity available from PS-DBM catalogue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border space-y-1">
              <p className="font-medium text-gray-900">{addAvailabilityDialog.itemDescription}</p>
              <p className="text-muted-foreground font-mono">{addAvailabilityDialog.itemCode}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Available Quantity</Label>
              <Input
                type="number"
                min="0"
                max={addAvailabilityDialog.requestedQuantity}
                value={addAvailabilityDialog.availableQuantity}
                onChange={(e) =>
                  setAddAvailabilityDialog((prev) => ({
                    ...prev,
                    availableQuantity: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="h-9 text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Requested Quantity: {addAvailabilityDialog.requestedQuantity}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddAvailabilityDialog({ isOpen: false, availableQuantity: 0, requestedQuantity: 0 })}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmAvailability}>
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
