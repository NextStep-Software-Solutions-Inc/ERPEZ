/**
 * View Source Document Dialog
 * Displays full details of a linked PO or Contract document
 * Allows users and admins to review source document information before NTP issuance
 */

import { useMemo } from 'react'
import { FileText, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { NTP } from '../types/ntpTypes'

export interface ViewSourceDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ntp: NTP | null
}

export function ViewSourceDocumentDialog({
  open,
  onOpenChange,
  ntp,
}: ViewSourceDocumentDialogProps) {
  if (!ntp) {
    return null
  }

  const sourceType = ntp.sourceType
  const totalAmount = useMemo(
    () =>
      ntp.lineItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      ),
    [ntp.lineItems]
  )

  const formattedAmount = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(totalAmount)

  const formattedDate = new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(ntp.date))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-48px)] overflow-y-auto p-0 rounded-lg" size='lg'>
        {/* Fixed Header */}
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    {sourceType === 'PO' ? 'Purchase Order' : 'Contract'} Details
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">{ntp.sourceDocumentId}</p>
                </div>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t px-6 py-4">
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</p>
                <p className="text-sm font-semibold mt-1">{sourceType}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Supplier</p>
                <p className="text-sm font-semibold mt-1">{ntp.supplierName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</p>
                <p className="text-sm font-semibold mt-1">{formattedDate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Amount</p>
                <p className="text-lg font-bold text-blue-700 mt-1">{formattedAmount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 200px)' }}>
          <div className="p-6 space-y-6">

          {/* Line Items Table */}
          <div>
            <h3 className="text-lg font-bold mb-4">Line Items ({ntp.lineItems.length})</h3>

            {ntp.lineItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No line items available for this document.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-slate-100 to-slate-50">
                    <TableRow className="border-b">
                      <TableHead className="font-bold text-xs uppercase tracking-wider px-4 py-4">
                        Item Code
                      </TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider px-4 py-4">
                        Description
                      </TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-right px-4 py-4">
                        Qty
                      </TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider px-4 py-4">
                        Unit
                      </TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-right px-4 py-4">
                        Unit Price
                      </TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-right px-4 py-4">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ntp.lineItems.map((item, idx) => (
                      <TableRow key={item.id} className={`border-b transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50`}>
                        <TableCell className="font-mono font-semibold text-sm px-4 py-4">
                          {item.itemCode}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <div>
                            <p className="font-semibold text-sm">{item.description}</p>
                            {item.specs && (
                              <p className="text-xs text-muted-foreground mt-1.5">
                                {item.specs}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm px-4 py-4">
                          {item.quantity.toLocaleString('en-PH')}
                        </TableCell>
                        <TableCell className="text-sm px-4 py-4">{item.unit}</TableCell>
                        <TableCell className="text-right font-semibold text-sm px-4 py-4">
                          {new Intl.NumberFormat('en-PH', {
                            style: 'currency',
                            currency: 'PHP',
                          }).format(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-sm px-4 py-4 text-blue-700">
                          {new Intl.NumberFormat('en-PH', {
                            style: 'currency',
                            currency: 'PHP',
                          }).format(item.quantity * item.unitPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Summary Footer */}
          {ntp.lineItems.length > 0 && (
            <div className="flex justify-end">
              <div className="w-full md:w-1/2 lg:w-2/5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Subtotal:</span>
                  <span className="text-sm font-semibold">
                    {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(totalAmount)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-700">
                    {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
