/**
 * Consolidated Items Table Component
 * Refined with darker headers, high-contrast typography, and rich borders.
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
import {
  MoreVertical,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  PackageSearch,
  AlertTriangle,
  Package,
  FolderClosed,
  Link2,
} from 'lucide-react'
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
  const [itemToDelete, setItemToDelete] = useState<ConsolidatedAPRItem | null>(null)

  const getStockStatus = (item: ConsolidatedAPRItem) => {
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

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onRemoveItem?.(itemToDelete.itemCode || itemToDelete.id)
      setItemToDelete(null)
    }
  }

  if (items.length === 0) {
    return (
      <Card className="bg-white border border-gray-200/90 rounded-2xl shadow-xs">
        <CardHeader className="py-4 px-6 border-b border-gray-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#f5f3ff] text-[#6366f1] border border-[#ede9fe] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Package className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-bold text-gray-950">
                Consolidated Items (0)
              </CardTitle>
              <p className="text-xs text-gray-500">
                Procurement items sourced and consolidated from Annual Procurement Plan
              </p>
            </div>
          </div>
          {isDraft && onOpenAddItem && (
            <Button
              size="sm"
              onClick={onOpenAddItem}
              className="gap-1.5 text-xs font-semibold bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-xl h-9 px-4 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item from Catalog
            </Button>
          )}
        </CardHeader>
        <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <PackageSearch className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-gray-950 text-sm">No consolidated items</h4>
            <p className="text-xs text-gray-500 max-w-sm">
              No items have been added to this Agency Purchase Request yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Card Header */}
        <CardHeader className="py-4 px-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#f5f3ff] text-[#6366f1] border border-[#ede9fe] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Package className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-bold text-gray-950">
                Consolidated Items ({items.length})
              </CardTitle>
              <p className="text-xs text-gray-500">
                Procurement items sourced and consolidated from Annual Procurement Plan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isDraft && onOpenAddItem && (
              <Button
                size="sm"
                onClick={onOpenAddItem}
                className="gap-1.5 text-xs font-semibold bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-xl h-9 px-4 shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item from Catalog
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-gray-500 border-gray-300 rounded-xl hover:text-gray-900"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                {isDraft && onOpenAddItem && (
                  <DropdownMenuItem onClick={onOpenAddItem} className="cursor-pointer gap-2">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => window.print()}
                  className="cursor-pointer gap-2"
                >
                  <span>Export Item List</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#f8fafc] border-b border-gray-200">
                <TableRow className="hover:bg-transparent border-b border-gray-200">
                  <TableHead className="font-bold text-xs text-gray-800 py-3.5 pl-6">
                    Item & Description
                  </TableHead>
                  <TableHead className="font-bold text-xs text-gray-800 py-3.5">
                    Office & Fund Source
                  </TableHead>
                  <TableHead className="font-bold text-xs text-gray-800 py-3.5">
                    Quantity & Stock
                  </TableHead>
                  <TableHead className="font-bold text-xs text-gray-800 py-3.5 text-right">
                    Unit Cost
                  </TableHead>
                  <TableHead className="font-bold text-xs text-gray-800 py-3.5 text-right">
                    Total Amount
                  </TableHead>
                  <TableHead className="font-bold text-xs text-gray-800 py-3.5 text-center pr-6 w-16">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => {
                  const stock = getStockStatus(item)
                  const isShort = stock.outOfStock > 0

                  return (
                    <TableRow
                      key={item.id || item.itemCode || `item-row-${index}`}
                      className="bg-white hover:bg-[#f8fafc]/70 transition-colors border-b border-gray-200/90 last:border-b-0"
                    >
                      {/* Item & Description with Folder Thumbnail Preview */}
                      <TableCell className="pl-6 py-4.5 align-middle">
                        <div className="flex items-center gap-3.5 max-w-sm">
                          {/* Folder Preview Box */}
                          <div className="h-11 w-11 rounded-xl bg-[#fef3c7] border border-[#f59e0b]/40 flex items-center justify-center text-[#b45309] flex-shrink-0 shadow-2xs">
                            <FolderClosed className="h-5 w-5 fill-[#fde68a] text-[#b45309]" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-bold text-xs text-gray-950 leading-snug truncate">
                              {item.description}
                            </p>
                            {item.itemCode && (
                              <p className="font-mono text-[11px] text-gray-500 font-medium select-all truncate">
                                {item.itemCode}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Office & Fund Source with PS-DBM pill */}
                      <TableCell className="py-4.5 align-middle text-xs">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-800 font-semibold leading-tight">
                            {item.office || 'Innovation and Technology Solutions Division'}
                          </p>
                          <div className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#f5f3ff] text-[#6366f1] border border-[#ede9fe] rounded-full px-2 py-0.5 shadow-2xs">
                            <Link2 className="h-2.5 w-2.5 text-[#6366f1]" />
                            <span>{item.fundSource || 'PS-DBM'}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Quantity & Stock Status */}
                      <TableCell className="py-4.5 align-middle text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-950 text-xs">
                            {item.quantity} {item.unit || 'Box'}
                          </p>
                          {isShort ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAddAvailability(item)}
                              className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-bold text-[11px] cursor-pointer"
                              aria-label={`Update availability for ${item.description}`}
                            >
                              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                              <span>Avail: {stock.available} · Short: {stock.outOfStock}</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>In Stock ({stock.available})</span>
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Unit Cost */}
                      <TableCell className="py-4.5 align-middle text-right font-bold text-xs text-gray-800">
                        {formatCurrencyPHP(item.unitCost || 0)}
                      </TableCell>

                      {/* Total Amount */}
                      <TableCell className="py-4.5 align-middle text-right font-extrabold text-xs text-gray-950">
                        {formatCurrencyPHP(
                          item.totalAmount || (item.unitCost || 0) * (item.quantity || 1)
                        )}
                      </TableCell>

                      {/* Row Actions */}
                      <TableCell className="py-4.5 align-middle text-center pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-500 hover:text-gray-900"
                              aria-label="Open item options"
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
                            {isDraft && onRemoveItem && (
                              <DropdownMenuItem
                                onClick={() => setItemToDelete(item)}
                                className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Remove Item</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer with Darker High Contrast Styling */}
          <div className="py-4 px-6 border-t border-gray-200 bg-[#f8fafc]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-gray-500 font-medium">
              Showing {items.length} of {items.length} item{items.length === 1 ? '' : 's'}
            </span>
            <div className="flex items-center gap-6 self-end sm:self-auto">
              <div className="flex items-baseline gap-1.5">
                <span className="text-gray-600 font-medium">Total Units:</span>
                <span className="font-bold text-gray-950">
                  {items.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-gray-600 font-medium">Total Amount:</span>
                <span className="font-extrabold text-sm text-gray-950">
                  {formatCurrencyPHP(
                    items.reduce(
                      (sum, item) =>
                        sum +
                        (item.totalAmount || (item.unitCost || 0) * (item.quantity || 1)),
                      0
                    )
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
              onClick={() =>
                setAddAvailabilityDialog({ isOpen: false, availableQuantity: 0, requestedQuantity: 0 })
              }
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmAvailability}>
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item Confirmation Dialog */}
      <Dialog
        open={!!itemToDelete}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Remove Consolidated Item
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to remove this item from the Agency Purchase Request?
            </DialogDescription>
          </DialogHeader>
          {itemToDelete && (
            <div className="p-3 bg-slate-50 rounded-lg border text-xs space-y-1 my-2">
              <p className="font-semibold text-gray-900">{itemToDelete.description}</p>
              <p className="text-muted-foreground font-mono">{itemToDelete.itemCode}</p>
              <p className="text-gray-700">
                Quantity: {itemToDelete.quantity} {itemToDelete.unit || 'units'} · Amount:{' '}
                {formatCurrencyPHP(
                  itemToDelete.totalAmount ||
                    (itemToDelete.unitCost || 0) * (itemToDelete.quantity || 1)
                )}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setItemToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
              Remove Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
