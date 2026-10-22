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
import {
  MoreVertical,
  Trash2,
  Plus,
  PackageSearch,
  AlertTriangle,
  Package,
  FolderClosed,
  ZoomIn,
  CheckCircle2,
} from 'lucide-react'
import { formatCurrencyPHP } from '@/utils/formatters'
import type { ConsolidatedAPRItem } from '../types'
import { APRImageViewerModal } from './APRImageViewerModal'

interface ConsolidatedItemsTableProps {
  items: ConsolidatedAPRItem[]
  status?: string
  linkedPRNumber?: string | null
  linkedPRNumbers?: string[] | null
  onRemoveItem?: (itemCode: string) => void
  onOpenAddItem?: () => void
}

export function ConsolidatedItemsTable({
  items,
  status = 'DRAFT',
  linkedPRNumber,
  linkedPRNumbers,
  onRemoveItem,
  onOpenAddItem,
}: ConsolidatedItemsTableProps) {
  const isDraft = status?.toUpperCase() === 'DRAFT' || status?.toUpperCase() === 'RETURNED'
  const [itemToDelete, setItemToDelete] = useState<ConsolidatedAPRItem | null>(null)
  const [previewItem, setPreviewItem] = useState<ConsolidatedAPRItem | null>(null)
  const linkedPRDisplay =
    linkedPRNumbers && linkedPRNumbers.length > 0
      ? linkedPRNumbers.join(', ')
      : linkedPRNumber || ''

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onRemoveItem?.(itemToDelete.id || itemToDelete.itemCode)
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
                    Quantity & PS-DBM Deficit
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
                  const itemFulfilled = item.servedQuantity ?? 0
                  const hasRemainingDeficit =
                    item.deficit !== undefined
                      ? item.deficit > 0
                      : (item.outOfStockQuantity !== undefined && item.outOfStockQuantity > 0)
                  const isFullyCoveredByPR =
                    itemFulfilled > 0 && (item.deficit === 0 || itemFulfilled >= item.quantity)
                  const isPartiallyCovered = itemFulfilled > 0 && hasRemainingDeficit
                  const isDeficit = item.isOutOfStock || hasRemainingDeficit
                  const deficitQty = item.deficit ?? item.outOfStockQuantity ?? (hasRemainingDeficit ? item.quantity : 0)

                  return (
                    <TableRow
                      key={item.id || item.itemCode || `item-row-${index}`}
                      className="bg-white hover:bg-[#f8fafc]/70 transition-colors border-b border-gray-200/90 last:border-b-0"
                    >
                      {/* Item & Description with Image / Folder Thumbnail Preview */}
                      <TableCell className="pl-6 py-4.5 align-middle">
                        <div className="flex items-center gap-3.5 max-w-sm">
                          {item.imageUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="relative group h-11 w-11 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center flex-shrink-0 shadow-2xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary"
                              title="Click to view full image"
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.description}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ZoomIn className="w-3.5 h-3.5" />
                              </div>
                            </button>
                          ) : (
                            <div className="h-11 w-11 rounded-xl bg-[#fef3c7] border border-[#f59e0b]/40 flex items-center justify-center text-[#b45309] flex-shrink-0 shadow-2xs">
                              <FolderClosed className="h-5 w-5 fill-[#fde68a] text-[#b45309]" />
                            </div>
                          )}
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-bold text-xs text-gray-950 leading-snug truncate">
                              {item.description}
                            </p>
                            {item.itemCode && (
                              <p className="text-[11px] text-gray-400 font-mono tracking-tight">
                                {item.itemCode}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Office & Fund Source */}
                      <TableCell className="py-4.5 align-middle">
                        <div className="space-y-1">
                          <p className="font-bold text-xs text-gray-900 leading-tight">
                            {item.office || 'Innovation and Technology Solutions Division'}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eff6ff] text-[#3b82f6] border border-[#dbeafe]">
                              {item.fundSource || 'PS-DBM'}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Quantity & Stock Status */}
                      <TableCell className="py-4.5 align-middle">
                        <div className="space-y-1.5 min-w-[170px]">
                          {/* Requested Quantity */}
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-extrabold text-xs text-gray-950">
                              {item.quantity}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {item.unit || 'Box'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              (Requested)
                            </span>
                          </div>

                          {isFullyCoveredByPR ? (
                            <div className="flex flex-col gap-1">
                              {/* Stock status indicator */}
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                                <span>Requisitioned via Out-of-Stock PR</span>
                              </div>

                              {/* PR linkage badge */}
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100/90 text-emerald-900 border border-emerald-300">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  <span>{linkedPRDisplay ? `PR Created (${linkedPRDisplay})` : 'Transferred to PR'}</span>
                                </span>
                              </div>

                              {/* Deficit resolved breakdown */}
                              <span className="text-[10px] text-gray-500 font-medium">
                                0 {item.unit || 'unit'} remaining deficit • All {item.quantity} {item.unit || 'unit'} covered
                              </span>
                            </div>
                          ) : isPartiallyCovered ? (
                            <div className="flex flex-col gap-1">
                              {/* Stock status indicator */}
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                                <span>Partially Covered by PR</span>
                              </div>

                              {/* Deficit quantity breakdown badge */}
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100/90 text-amber-900 border border-amber-300">
                                  <span>Remaining Deficit:</span>
                                  <span>{deficitQty} {item.unit || 'Box'}</span>
                                </span>
                              </div>

                              {/* Action tag */}
                              <div className="flex items-center gap-1 flex-wrap">
                                {linkedPRDisplay && (
                                  <span className="inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                    {itemFulfilled} in {linkedPRDisplay}
                                  </span>
                                )}
                                <span className="inline-flex items-center w-fit px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  Eligible for PR ({deficitQty} left)
                                </span>
                              </div>
                            </div>
                          ) : isDeficit ? (
                            <div className="flex flex-col gap-1">
                              {/* Stock status indicator */}
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                                <span>Out of Stock at PS-DBM</span>
                              </div>

                              {/* Deficit quantity breakdown badge */}
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100/90 text-amber-900 border border-amber-300">
                                  <span>Deficit:</span>
                                  <span>{deficitQty} {item.unit || 'Box'}</span>
                                </span>
                              </div>

                              {/* Action tag */}
                              {linkedPRDisplay ? (
                                <span className="inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  PR Created ({linkedPRDisplay})
                                </span>
                              ) : (
                                <span className="inline-flex items-center w-fit px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  Eligible for PR
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                <span>In Stock at PS-DBM</span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-medium">
                                Deficit: 0 {item.unit || 'Box'}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Unit Cost */}
                      <TableCell className="py-4.5 align-middle text-right font-bold text-xs text-gray-900">
                        {formatCurrencyPHP(item.unitCost || 0)}
                      </TableCell>

                      {/* Total Amount */}
                      <TableCell className="py-4.5 align-middle text-right font-extrabold text-xs text-gray-950">
                        {formatCurrencyPHP(
                          item.totalAmount ||
                            (item.unitCost || 0) * (item.quantity || 1)
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-4.5 align-middle text-center pr-6">
                        {isDraft && onRemoveItem ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-500 hover:text-gray-900 cursor-pointer"
                                aria-label="Open item options"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              <DropdownMenuItem
                                onClick={() => setItemToDelete(item)}
                                className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Remove Item</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
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
            <div className="flex items-center gap-6 self-end sm:self-auto flex-wrap">
              <div className="flex items-baseline gap-1.5">
                <span className="text-gray-600 font-medium">Total Units:</span>
                <span className="font-bold text-gray-950">
                  {items.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                </span>
              </div>
              {(() => {
                const totalDeficit = items.reduce((sum, item) => {
                  const isDef =
                    item.isOutOfStock ||
                    (item.outOfStockQuantity !== undefined && item.outOfStockQuantity > 0) ||
                    (item.deficit !== undefined && item.deficit > 0)
                  return sum + (item.outOfStockQuantity ?? item.deficit ?? (isDef ? item.quantity : 0))
                }, 0)

                return totalDeficit > 0 ? (
                  <div className="flex items-baseline gap-1.5 bg-amber-100/70 border border-amber-300 px-2.5 py-0.5 rounded-md">
                    <span className="text-amber-900 font-medium">Total Deficit:</span>
                    <span className="font-extrabold text-amber-950">
                      {totalDeficit} units
                    </span>
                  </div>
                ) : null
              })()}
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

      {/* Image Preview Modal */}
      {previewItem && (
        <APRImageViewerModal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          imageUrl={previewItem.imageUrl}
          itemTitle={previewItem.description}
          itemCode={previewItem.itemCode}
          unitPrice={previewItem.unitCost}
        />
      )}
    </>
  )
}
