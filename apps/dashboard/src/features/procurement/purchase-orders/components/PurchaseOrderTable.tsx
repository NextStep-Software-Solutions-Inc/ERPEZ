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
  RotateCcw,
  CheckCircle,
  MoreVertical,
  Search,
  Pencil,
  Trash2,
  FileText,
} from 'lucide-react'
import { PurchaseOrderStatusBadge, normalizePoStatus } from './PurchaseOrderStatusBadge'
import type { PurchaseOrder, PurchaseOrderMode, PurchaseOrderRole } from '../types'

const PAGE_SIZE = 10

type PurchaseOrderTableProps = {
  rows: PurchaseOrder[]
  role: PurchaseOrderRole
  mode?: PurchaseOrderMode
  onPrint: (purchaseOrderId: string) => void
  onSubmit: (purchaseOrderId: string) => void
  onReturn: (purchaseOrderId: string) => void
  onApprove: (purchaseOrderId: string) => void
  onViewDetails?: (purchaseOrderId: string) => void
  onEdit?: (purchaseOrder: PurchaseOrder) => void
  onDelete?: (purchaseOrderId: string) => void
}

export function PurchaseOrderTable({
  rows,
  role,
  mode,
  onPrint,
  onSubmit,
  onReturn,
  onApprove,
  onViewDetails,
  onEdit,
  onDelete,
}: PurchaseOrderTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id))
  const somePageSelected = pageRows.some((r) => selected.has(r.id)) && !allPageSelected

  useEffect(() => {
    setPage(1)
    setSelected((prev) => {
      const validIds = new Set(rows.map((r) => r.id))
      return new Set([...prev].filter((id) => validIds.has(id)))
    })
  }, [rows.length])

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

  const getSourceLabel = (po: PurchaseOrder) => {
    const s = (po.source || po.procurementMode || '').toString().toLowerCase()
    if (s.includes('svp')) return 'SVP'
    if (s.includes('bidding') || s.includes('public')) return 'Public Bidding'
    if (s.includes('direct') || s.includes('acquisition')) return 'Direct Acquisition'
    return po.procurementMode || 'SVP'
  }

  return (
    <>
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
              {pageRows.map((purchaseOrder) => {
                const normStatus = normalizePoStatus(purchaseOrder.status)
                const isDa =
                  purchaseOrder.source === 'direct-acquisition' ||
                  purchaseOrder.procurementMode === 'DIRECT_ACQUISITION'

                return (
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
                      <div className="line-clamp-2">{purchaseOrder.description || '—'}</div>
                      <div className="mt-1 text-xs text-muted-foreground/70">
                        {purchaseOrder.sourceDocumentNumber || 'No source linked yet'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {getSourceLabel(purchaseOrder)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {purchaseOrder.supplierName || 'Unlinked'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="font-medium">
                        ₱{(purchaseOrder.totalAmount || 0).toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <PurchaseOrderStatusBadge status={purchaseOrder.status} />
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isDa && onViewDetails ? (
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
                            <FileText className="h-4 w-4 mr-2 text-primary" />
                            Generate PO (PDF)
                          </DropdownMenuItem>

                          {(normStatus === 'draft' || normStatus === 'returned') &&
                          role === 'procurement-staff' ? (
                            <>
                              <DropdownMenuSeparator />
                              {onEdit && (
                                <DropdownMenuItem onSelect={() => onEdit(purchaseOrder)}>
                                  <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
                                  Edit PO
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onSelect={() => onSubmit(purchaseOrder.id)}>
                                <Send className="h-4 w-4 mr-2" />
                                Submit for approval
                              </DropdownMenuItem>
                              {onDelete && normStatus === 'draft' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onSelect={() => onDelete(purchaseOrder.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                                    Delete PO
                                  </DropdownMenuItem>
                                </>
                              )}
                            </>
                          ) : null}

                          {role === 'hope' && normStatus === 'for-approval' ? (
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
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

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
