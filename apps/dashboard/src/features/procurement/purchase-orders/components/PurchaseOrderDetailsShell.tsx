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
import { GeneratedPurchaseOrderPreviewCard } from './GeneratedPurchaseOrderPreviewCard'
import { PurchaseOrderStatusBadge } from './PurchaseOrderStatusBadge'
import { AobEvaluationTab } from './AobEvaluationTab'
import { PurchaseOrderReadinessCard } from './PurchaseOrderReadinessCard'
import {
  Calendar,
  Truck,
  CreditCard,
  FileText,
  MapPin,
  Building2,
  CalendarCheck,
  ArrowRight,
  Layers,
  FileCheck2,
} from 'lucide-react'
import type { PurchaseOrder } from '../types'
import type { AOB, BidMatrix } from '@/features/procurement/aob/types/aobTypes'

function formatDate(value?: string | null): string {
  if (!value) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatPlaceOfDelivery(val?: string | null): string {
  if (!val) return '—'
  return val.replace(/^Place of Delivery:\s*/i, '').trim() || val
}

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
  onOpenSubmit?: () => void
  onOpenApprove?: () => void
  onOpenReturn?: () => void
  isSubmitting?: boolean
  canSubmit?: boolean
  canForApproval?: boolean
}

export function PurchaseOrderDetailsShell({
  purchaseOrder,
  activeTab = 'po-details',
  onTabChange,
  isAob = false,
  aobData,
  onOpenSubmit,
  onOpenApprove,
  onOpenReturn,
  isSubmitting = false,
  canSubmit = false,
  canForApproval = false,
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

  // Redesigned official enterprise procurement details card
  const renderDetailsCard = () => (
    <Card className="border border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
      <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Details
            </CardTitle>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Purchase Order Record
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* ── Section 1: Purchase Order Information ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Purchase Order Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* PO Number */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                PO Number
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                {purchaseOrder.poNumber || '—'}
              </p>
            </div>

            {/* PO Date */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                PO Date
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                {formatDate(purchaseOrder.date)}
              </p>
            </div>

            {/* Status */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </p>
              <div className="mt-1">
                <PurchaseOrderStatusBadge status={purchaseOrder.status} />
              </div>
            </div>

            {/* Supplier */}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Supplier
              </p>
              <div className="flex items-start gap-2 mt-1">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug break-words">
                    {purchaseOrder.supplierName || 'Unlinked'}
                  </p>
                  {purchaseOrder.supplierTin && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      TIN: {purchaseOrder.supplierTin}
                    </p>
                  )}
                  {purchaseOrder.supplierAddress && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {purchaseOrder.supplierAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Source Document */}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Source Document
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {purchaseOrder.sourceDocumentNumber || 'None yet'}
                </span>
                {onTabChange && isAob && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onTabChange('aob-matrix')}
                    className="h-6 px-2 text-xs font-semibold text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 bg-blue-50/60 hover:bg-blue-100/70 dark:bg-blue-950/40 gap-1 rounded shadow-2xs"
                  >
                    <span>View Bid Matrix</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {purchaseOrder.sourceDocumentType && (
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Type: {purchaseOrder.sourceDocumentType}
                </span>
              )}
            </div>

            {/* Total Amount */}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Amount
              </p>
              <div className="mt-1">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                  ₱{purchaseOrder.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  {lineItems.length} line item{lineItems.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Source Document Description (if present) */}
          {purchaseOrder.sourceDocumentDescription && (
            <div className="pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/70 dark:border-slate-700/60 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Source Document Description
                </span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                  {purchaseOrder.sourceDocumentDescription}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 2: Delivery & Payment ── */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Delivery & Payment
            </h3>
          </div>

          {/* Place of Delivery: Full-width */}
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Place of Delivery
            </p>
            <div className="flex items-start gap-2 mt-1">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                {formatPlaceOfDelivery(purchaseOrder.placeOfDelivery)}
              </p>
            </div>
          </div>

          {/* Date of Delivery, Delivery Term, Payment Term: 3 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
            {/* Date of Delivery */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Date of Delivery
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(purchaseOrder.dateOfDelivery)}
                </p>
              </div>
            </div>

            {/* Delivery Term */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Delivery Term
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Truck className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {purchaseOrder.deliveryTerm || '—'}
                </p>
              </div>
            </div>

            {/* Payment Term */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Payment Term
              </p>
              <div className="flex items-center gap-2 mt-1">
                <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {purchaseOrder.paymentTerm || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Metadata Footer ── */}
        {(purchaseOrder.createdAt || purchaseOrder.updatedAt || purchaseOrder.approvedBy) && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-4">
              {purchaseOrder.createdAt && (
                <span className="flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Created: {formatDate(purchaseOrder.createdAt)}</span>
                </span>
              )}
              {purchaseOrder.updatedAt && purchaseOrder.updatedAt !== purchaseOrder.createdAt && (
                <span>Updated: {formatDate(purchaseOrder.updatedAt)}</span>
              )}
            </div>
            {purchaseOrder.approvedBy && (
              <span>Approved by: {purchaseOrder.approvedBy}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Line items card content
  const renderLineItemsCard = () => (
    <Card className="border border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
      <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">Line Items</CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {lineItems.length} item{lineItems.length !== 1 ? 's' : ''} in this purchase order
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {lineItems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">No line items yet. Link a source document to populate items.</p>
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-50/70">
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs">Description</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs w-24">Qty</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs w-24">Unit</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs text-right w-36">Unit Price</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs text-right w-40">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((lineItem) => (
                  <TableRow key={lineItem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <TableCell className="font-medium text-sm text-slate-900 dark:text-slate-100">{lineItem.description}</TableCell>
                    <TableCell className="text-sm text-slate-700 dark:text-slate-300">{lineItem.quantity}</TableCell>
                    <TableCell className="text-sm text-slate-700 dark:text-slate-300">{lineItem.unit}</TableCell>
                    <TableCell className="text-sm text-slate-700 dark:text-slate-300 text-right">
                      ₱{lineItem.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm text-slate-900 dark:text-slate-100">
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
          <div className="flex justify-end mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-right">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Total</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
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
    <div className="space-y-6">
      {/* Generated Purchase Order Preview (COA GAM Appendix 61) */}
      <GeneratedPurchaseOrderPreviewCard purchaseOrder={purchaseOrder} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supporting Documents */}
        <PurchaseOrderSupportingDocumentCard
          supportingDocument={supportingDoc}
          fileName={purchaseOrder.poNumber ? `${purchaseOrder.poNumber}-BID-supporting.pdf` : undefined}
        />

        {/* Official Signed PO Document preview */}
        <PurchaseOrderDocumentPreviewCard
          file={purchaseOrder.signedDocument ?? (purchaseOrder as any).signedDocumentUrl ?? null}
          fileName={purchaseOrder.signedDocumentFileName ?? (purchaseOrder.poNumber ? `${purchaseOrder.poNumber}-signed.pdf` : undefined)}
          title="Uploaded Signed PO Document"
          description="Preview and download the physical signed Purchase Order document uploaded upon approval."
          emptyDescription="The official signed purchase order document has not been uploaded yet."
          previewTitle="Purchase order preview"
          downloadLabel="Download Signed PO"
        />
      </div>
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

      {/* Workflow & Submission Readiness Card — matches LIB implementation */}
      <PurchaseOrderReadinessCard
        purchaseOrder={purchaseOrder}
        onOpenSubmit={onOpenSubmit}
        onOpenApprove={onOpenApprove}
        onOpenReturn={onOpenReturn}
        isSubmitting={isSubmitting}
        canSubmit={canSubmit}
        canForApproval={canForApproval}
      />

      {/* SVP / AOB mode: Exactly 3 Workflow Tabs */}
      {isAob ? (
        <Tabs
          value={activeTab}
          onValueChange={onTabChange}
          className="w-full space-y-6"
        >
          <div className="flex items-center justify-start border-b border-slate-200 dark:border-slate-800 pb-1">
            <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl h-auto inline-flex flex-wrap justify-start gap-1 border border-slate-200 dark:border-slate-700 w-auto">
              <TabsTrigger
                value="po-details"
                className="gap-2 px-4 py-2 font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs text-sm"
              >
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                PO Details & Line Items
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
        /* Standard Non-AOB Layout: PO Details and Documents */
        <Tabs
          value={activeTab === 'aob-matrix' ? 'po-details' : activeTab}
          onValueChange={onTabChange}
          className="w-full space-y-6"
        >
          <div className="flex items-center justify-start border-b border-slate-200 dark:border-slate-800 pb-1">
            <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl h-auto inline-flex flex-wrap justify-start gap-1 border border-slate-200 dark:border-slate-700 w-auto">
              <TabsTrigger
                value="po-details"
                className="gap-2 px-4 py-2 font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs text-sm"
              >
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                PO Details & Line Items
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
            {renderLineItemsCard()}
          </TabsContent>

          <TabsContent value="documents" className="mt-0 space-y-6">
            {renderDocumentsCard()}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
