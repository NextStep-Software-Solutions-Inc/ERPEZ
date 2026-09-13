import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PurchaseOrderSupportingDocumentCard } from './PurchaseOrderSupportingDocumentCard'
import { PurchaseOrderDocumentPreviewCard } from './PurchaseOrderDocumentPreviewCard'
import { PurchaseOrderStatusBadge } from './PurchaseOrderStatusBadge'
import { Calendar, Truck, Clock, CreditCard, Hash, DollarSign, FileText, MapPin, Building2, CalendarCheck } from 'lucide-react'
import type { PurchaseOrder } from '../types'

type PurchaseOrderDetailsShellProps = {
  purchaseOrder: PurchaseOrder
}

export function PurchaseOrderDetailsShell({
  purchaseOrder,
}: PurchaseOrderDetailsShellProps) {
  const src = (purchaseOrder.source || purchaseOrder.procurementMode || '').toString().toLowerCase()
  const sourceLabel =
    src.includes('svp')
      ? 'SVP'
      : src.includes('public')
        ? 'Public Bidding'
        : 'Direct Acquisition'

  const lineItems = purchaseOrder.lineItems ?? purchaseOrder.items ?? []
  const supportingDoc = purchaseOrder.supportingDocumentUrl ?? (purchaseOrder as any).bidSupportingDocument
  const statusLower = (purchaseOrder.status || '').toLowerCase().replace(/[-_]/g, '')

  return (
    <div className="space-y-6 pb-10">
      {/* Header Card — matches PR Details gradient header */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {purchaseOrder.poNumber}
                </CardTitle>
                <PurchaseOrderStatusBadge status={purchaseOrder.status} />
                <span className="inline-flex items-center rounded-md border border-slate-300 dark:border-slate-600 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {sourceLabel}
                </span>
              </div>
              {purchaseOrder.description && (
                <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                  {purchaseOrder.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Detail tiles — same colored tile grid as PR Details */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/20 border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">

            {/* PO Date */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800/50 hover:shadow-sm transition-shadow lg:col-span-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-white/70 border border-blue-100 dark:bg-transparent dark:border-blue-800">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">PO Date</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                    {purchaseOrder.date ? new Date(purchaseOrder.date).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Supplier */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800/50 hover:shadow-sm transition-shadow lg:col-span-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-white/70 border border-purple-100 dark:bg-transparent dark:border-purple-800">
                  <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Supplier</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                    {purchaseOrder.supplierName ?? 'Unlinked'}
                  </p>
                </div>
              </div>
            </div>

            {/* Source Document Number */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800/50 hover:shadow-sm transition-shadow lg:col-span-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-white/70 border border-amber-100 dark:bg-transparent dark:border-amber-800">
                  <Hash className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Source Document</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                    {purchaseOrder.sourceDocumentNumber ?? 'None yet'}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 hover:shadow-sm transition-shadow lg:col-span-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-white/70 border border-emerald-100 dark:bg-transparent dark:border-emerald-800">
                  <DollarSign className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Total Amount</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                    ₱{purchaseOrder.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Source Document Description — full width if present */}
            {purchaseOrder.sourceDocumentDescription && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-slate-800/30 dark:to-slate-700/20 border border-slate-300 dark:border-slate-600/50 hover:shadow-sm transition-shadow lg:col-span-12">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-white/70 border border-slate-200 dark:bg-transparent dark:border-slate-600 mt-0.5">
                    <FileText className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Source Document Description</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-0.5">{purchaseOrder.sourceDocumentDescription}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Place of Delivery */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20 border border-rose-200 dark:border-rose-800/50 hover:shadow-sm transition-shadow lg:col-span-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-white/70 border border-rose-100 dark:bg-transparent dark:border-rose-800">
                  <MapPin className="h-5 w-5 text-rose-600 dark:text-rose-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Place of Delivery</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{purchaseOrder.placeOfDelivery || '—'}</p>
                </div>
              </div>
            </div>

            {/* Date of Delivery */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/30 dark:to-cyan-900/20 border border-cyan-200 dark:border-cyan-800/50 hover:shadow-sm transition-shadow lg:col-span-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-white/70 border border-cyan-100 dark:bg-transparent dark:border-cyan-800">
                  <Truck className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">Date of Delivery</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                    {purchaseOrder.dateOfDelivery ? new Date(purchaseOrder.dateOfDelivery).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Term */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 hover:shadow-sm transition-shadow lg:col-span-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-white/70 border border-indigo-100 dark:bg-transparent dark:border-indigo-800">
                  <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Delivery Term</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{purchaseOrder.deliveryTerm || '—'}</p>
                </div>
              </div>
            </div>

            {/* Payment Term */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950/30 dark:to-teal-900/20 border border-teal-200 dark:border-teal-800/50 hover:shadow-sm transition-shadow lg:col-span-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-white/70 border border-teal-100 dark:bg-transparent dark:border-teal-800">
                  <CreditCard className="h-5 w-5 text-teal-600 dark:text-teal-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">Payment Term</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{purchaseOrder.paymentTerm || '—'}</p>
                </div>
              </div>
            </div>

            {/* Created / Updated timestamps */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/20 dark:to-slate-700/10 border border-slate-200 dark:border-slate-700/50 hover:shadow-sm transition-shadow lg:col-span-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-white/70 border border-slate-200 dark:bg-transparent dark:border-slate-600">
                  <CalendarCheck className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                    {purchaseOrder.createdAt ? new Date(purchaseOrder.createdAt).toLocaleDateString() : '—'}
                  </p>
                  {purchaseOrder.updatedAt && purchaseOrder.updatedAt !== purchaseOrder.createdAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Updated: {new Date(purchaseOrder.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Line Items Table — same card style as PR Details items card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/20 border-b border-slate-200 dark:border-slate-700">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">Line Items</CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
              {lineItems.length} item{lineItems.length !== 1 ? 's' : ''} in this purchase order
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {lineItems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No line items yet. Link a source document to populate items.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((lineItem) => (
                    <TableRow key={lineItem.id}>
                      <TableCell className="font-medium">{lineItem.description}</TableCell>
                      <TableCell>{lineItem.quantity}</TableCell>
                      <TableCell>{lineItem.unit}</TableCell>
                      <TableCell>
                        ₱{lineItem.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₱{lineItem.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Total row */}
          {lineItems.length > 0 && (
            <div className="flex justify-end mt-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  ₱{purchaseOrder.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supporting Documents */}
      <PurchaseOrderSupportingDocumentCard
        supportingDocument={supportingDoc}
        fileName={purchaseOrder.poNumber ? `${purchaseOrder.poNumber}-BID-supporting.pdf` : undefined}
      />

      {/* Signed PO preview (approved only) */}
      {statusLower === 'approved' ? (
        <PurchaseOrderDocumentPreviewCard
          file={purchaseOrder.signedDocument ?? (purchaseOrder as any).signedDocumentUrl ?? null}
          fileName={purchaseOrder.signedDocumentFileName ?? (purchaseOrder.poNumber ? `${purchaseOrder.poNumber}-signed.pdf` : undefined)}
          title="Signed Purchase Order"
          description="Preview and download the physically signed PO document submitted for approval."
          emptyDescription="The signed PO document has not been attached yet."
          previewTitle="Signed purchase order preview"
          downloadLabel="Download Signed PO"
        />
      ) : null}

      {/* Return reason (if returned) */}
      {statusLower === 'returned' && purchaseOrder.returnReason && (
        <Card className="border-0 shadow-lg overflow-hidden border-l-4 border-l-red-400">
          <CardHeader className="pb-2 bg-gradient-to-r from-red-50/60 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10 border-b border-red-200 dark:border-red-800/40">
            <CardTitle className="text-base font-bold text-red-700 dark:text-red-300">Return Remarks</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">{purchaseOrder.returnReason}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
