import { Button } from '@/components/ui/button'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PurchaseOrderSupportingDocumentCard } from './PurchaseOrderSupportingDocumentCard'
import { PurchaseOrderDocumentPreviewCard } from './PurchaseOrderDocumentPreviewCard'
import { PurchaseOrderStatusBadge } from './PurchaseOrderStatusBadge'
import { AobEvaluationTab } from './AobEvaluationTab'
import {
  Calendar,
  Truck,
  Clock,
  CreditCard,
  Hash,
  DollarSign,
  FileText,
  MapPin,
  Building2,
  CalendarCheck,
  ArrowRight,
  ListChecks,
  Layers,
  FileCheck2,
} from 'lucide-react'
import type { PurchaseOrder } from '../types'
import type { AOB, BidMatrix } from '@/features/procurement/aob/types/aobTypes'

type PurchaseOrderDetailsShellProps = {
  purchaseOrder: PurchaseOrder
  activeTab?: string
  onTabChange?: (tab: string) => void
  isAob?: boolean
  aobData?: {
    aob?: AOB | null
    bidMatrix?: BidMatrix | null
    isLoading?: boolean
  }
}

export function PurchaseOrderDetailsShell({
  purchaseOrder,
  activeTab = 'po-details',
  onTabChange,
  isAob = false,
  aobData,
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

  // Detail tiles card content
  const renderDetailsCard = () => (
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
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800/50 hover:shadow-sm transition-shadow lg:col-span-3 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
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

            {onTabChange && isAob && (
              <div className="mt-3 pt-2 border-t border-amber-200/60 dark:border-amber-800/40 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onTabChange('aob-matrix')}
                  className="h-7 text-xs text-amber-800 dark:text-amber-200 hover:bg-amber-200/50 dark:hover:bg-amber-900/40 px-2 font-semibold gap-1"
                >
                  View Bid Matrix
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
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
  )

  // Line items card content
  const renderLineItemsCard = () => (
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
  )

  // Documents card content
  const renderDocumentsCard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Supporting Documents */}
      <PurchaseOrderSupportingDocumentCard
        supportingDocument={supportingDoc}
        fileName={purchaseOrder.poNumber ? `${purchaseOrder.poNumber}-BID-supporting.pdf` : undefined}
      />

      {/* Official PO Document preview */}
      <PurchaseOrderDocumentPreviewCard
        file={purchaseOrder.signedDocument ?? (purchaseOrder as any).signedDocumentUrl ?? null}
        fileName={purchaseOrder.signedDocumentFileName ?? (purchaseOrder.poNumber ? `${purchaseOrder.poNumber}-signed.pdf` : undefined)}
        title="Purchase Order Document"
        description="Preview and download the official Purchase Order document."
        emptyDescription="The official purchase order document has not been uploaded yet."
        previewTitle="Purchase order preview"
        downloadLabel="Download PO Document"
      />
    </div>
  )

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

      {/* When in SVP / AOB mode: Render 4 Workflow Tabs */}
      {isAob ? (
        <Tabs
          value={activeTab}
          onValueChange={onTabChange}
          className="w-full space-y-6"
        >
          <div className="border-b border-slate-200 dark:border-slate-800 pb-1">
            <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl h-auto flex flex-wrap gap-1 border border-slate-200 dark:border-slate-700">
              <TabsTrigger
                value="po-details"
                className="gap-2 px-4 py-2 font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs text-sm"
              >
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                PO Details
              </TabsTrigger>
              <TabsTrigger
                value="line-items"
                className="gap-2 px-4 py-2 font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs text-sm"
              >
                <ListChecks className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Line Items ({lineItems.length})
              </TabsTrigger>
              <TabsTrigger
                value="aob-matrix"
                className="gap-2 px-4 py-2 font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs text-sm"
              >
                <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                AOB Bid Evaluation Matrix
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="gap-2 px-4 py-2 font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs text-sm"
              >
                <FileCheck2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Documents & Previews
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="po-details" className="mt-0 space-y-6">
            {renderDetailsCard()}
          </TabsContent>

          <TabsContent value="line-items" className="mt-0 space-y-6">
            {renderLineItemsCard()}
          </TabsContent>

          <TabsContent value="aob-matrix" className="mt-0 space-y-6">
            <AobEvaluationTab
              aob={aobData?.aob}
              bidMatrix={aobData?.bidMatrix}
              isLoading={aobData?.isLoading}
              sourceDocumentNumber={purchaseOrder.sourceDocumentNumber}
            />
          </TabsContent>

          <TabsContent value="documents" className="mt-0 space-y-6">
            {renderDocumentsCard()}
          </TabsContent>
        </Tabs>
      ) : (
        /* Standard Non-AOB Stacked Layout */
        <div className="space-y-6">
          {renderDetailsCard()}
          {renderLineItemsCard()}
          {renderDocumentsCard()}
        </div>
      )}
    </div>
  )
}
