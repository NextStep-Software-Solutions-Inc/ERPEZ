import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Eye,
  Printer,
  Send,
  Link2,
  RotateCcw,
  CheckCircle,
  MoreVertical,
  Search,
} from 'lucide-react'
import { PurchaseOrderStatusBadge } from './PurchaseOrderStatusBadge'
import type { PurchaseOrder, PurchaseOrderRole } from '../types'

const PAGE_SIZE = 10

type PurchaseOrderTableProps = {
  rows: PurchaseOrder[]
  role: PurchaseOrderRole
  onPrint: (purchaseOrderId: string) => void
  onSubmit: (purchaseOrderId: string) => void
  onLinkAob: (purchaseOrderId: string) => void
  onLinkNoa: (purchaseOrderId: string) => void
  onReturn: (purchaseOrderId: string) => void
  onApprove: (purchaseOrderId: string) => void
  onViewDetails?: (purchaseOrderId: string) => void
}

export function PurchaseOrderTable({
  rows,
  role,
  onPrint,
  onSubmit,
  onLinkAob,
  onLinkNoa,
  onReturn,
  onApprove,
  onViewDetails,
}: PurchaseOrderTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id))
  const somePageSelected = pageRows.some((r) => selected.has(r.id)) && !allPageSelected

  // Reset to page 1 when the number of rows changes (e.g. after filtering/search)
  // Also prune selections that no longer exist in the new rows.
  // Use rows.length so changes that replace contents but keep the same array reference
  // are still caught when the list actually grows/shrinks.
  useEffect(() => {
    setPage(1)
    setSelected((prev) => {
      const validIds = new Set(rows.map((r) => r.id))
      return new Set([...prev].filter((id) => validIds.has(id)))
    })
  }, [rows.length])

  // Clamp page if totalPages decreases (safety for other updates)
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  const toggleAll = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      pageRows.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)))
      return next
    })
  }

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  return (
    <>
      {/* Table — same wrapper as PR Management */}
      <div className="border rounded-lg overflow-hidden">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No purchase orders found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or create a new PO.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allPageSelected ? true : somePageSelected ? 'indeterminate' : false}
                    onCheckedChange={(v) => toggleAll(!!v)}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>PO No.</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((purchaseOrder) => (
                <TableRow
                  key={purchaseOrder.id}
                  data-state={selected.has(purchaseOrder.id) ? 'selected' : undefined}
                >
                  <TableCell className="w-12">
                    <Checkbox
                      checked={selected.has(purchaseOrder.id)}
                      onCheckedChange={(v) => toggleOne(purchaseOrder.id, !!v)}
                      aria-label={`Select ${purchaseOrder.poNumber}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{purchaseOrder.poNumber}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="line-clamp-2">{purchaseOrder.description}</div>
                    <div className="mt-1 text-xs text-muted-foreground/70">
                      {purchaseOrder.sourceDocumentNumber ?? 'No source linked yet'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {purchaseOrder.source === 'svp'
                        ? 'SVP'
                        : purchaseOrder.source === 'public-bidding'
                          ? 'Public Bidding'
                          : 'Direct Acquisition'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {purchaseOrder.supplierName ?? 'Unlinked'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="font-medium">
                      ₱{purchaseOrder.totalAmount.toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <PurchaseOrderStatusBadge status={purchaseOrder.status} />
                  </TableCell>

                  {/* Actions — same as PR Management */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {purchaseOrder.source === 'direct-acquisition' && onViewDetails ? (
                          <DropdownMenuItem onSelect={() => onViewDetails(purchaseOrder.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem asChild>
                            <Link
                              to="/v2/po/$purchaseOrderId"
                              params={{ purchaseOrderId: purchaseOrder.id }}
                              className="flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => onPrint(purchaseOrder.id)}>
                          <Printer className="h-4 w-4 mr-2" />
                          Print PO
                        </DropdownMenuItem>
                        {(purchaseOrder.status === 'draft' || purchaseOrder.status === 'returned') &&
                        role === 'procurement-staff' ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => onSubmit(purchaseOrder.id)}>
                              <Send className="h-4 w-4 mr-2" />
                              Submit for approval
                            </DropdownMenuItem>
                          </>
                        ) : null}
                        {role === 'procurement-staff' &&
                        purchaseOrder.source === 'svp' &&
                        purchaseOrder.status !== 'approved' ? (
                          <DropdownMenuItem onSelect={() => onLinkAob(purchaseOrder.id)}>
                            <Link2 className="h-4 w-4 mr-2" />
                            Add AOB
                          </DropdownMenuItem>
                        ) : null}
                        {role === 'procurement-staff' &&
                        purchaseOrder.source === 'public-bidding' &&
                        purchaseOrder.status !== 'approved' ? (
                          <DropdownMenuItem onSelect={() => onLinkNoa(purchaseOrder.id)}>
                            <Link2 className="h-4 w-4 mr-2" />
                            Select NOA
                          </DropdownMenuItem>
                        ) : null}
                        {role === 'hope' && purchaseOrder.status === 'for-approval' ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => onReturn(purchaseOrder.id)}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Return
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onApprove(purchaseOrder.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination — outside the table, same layout as PR Management */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="text-sm text-muted-foreground">
          {selected.size} of {rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
