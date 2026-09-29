import { useMemo, useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  DollarSign,
  Download,
  FileCheck,
  FileText,
  Hash,
  ListChecks,
  Paperclip,
  Receipt,
  ShieldCheck,
  Store,
} from 'lucide-react'
import { DARequirementsModal } from '../_components/DARequirementsModal'
import type { DirectContracting } from '@/features/procurement/direct-contracting/types'
import type {
  DirectContractingItem,
  DirectContractingItemDetails as DirectContractingItemDetailsType,
  QuotationItemBid,
} from '../types/direct-contracting-item-type'
import type { ConsolidatedPRItem } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore';
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExportComingSoonDialog } from '@/components/ExportComingSoonDialog'
import { useConsolidatedPRStore } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import { formatCurrencyPHP } from '@/utils/formatters'
import { cn } from '@/lib/utils'
import {
  useDirectContracting,
  useSubmitProposal,
} from '@/features/procurement/direct-contracting/handlers'

interface DirectContractingItemDetailsProps {
  item: DirectContracting | DirectContractingItem | DirectContractingItemDetailsType
  onBack: () => void
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMonthLabel(monthValue: string): string {
  const [, month] = monthValue.split('-')
  const idx = Number(month) - 1
  return idx >= 0 && idx < 12 ? MONTH_NAMES[idx] : monthValue
}

export function DirectContractingItemDetails({ item: initialItem, onBack }: DirectContractingItemDetailsProps) {
  const { toast } = useToast()

  // Determine if it is a Direct Contracting request vs a legacy DA item
  const isDC =
    'dcNumber' in initialItem ||
    ('modeOfProcurement' in initialItem && initialItem.modeOfProcurement === 'Direct Contracting') ||
    !('daNumber' in initialItem)

  // Cast to specific types for easier access
  const dcBase = isDC ? (initialItem as DirectContracting) : null
  const dciBase = !isDC ? (initialItem as DirectContractingItem) : null

  // Fetch full details including items and submitted proposal
  const { data: fetchedDCResponse } = useDirectContracting({
    pathParams: { id: initialItem.id },
    queryParams: {},
  })
  const fetchedDC = fetchedDCResponse?.data


  const activeDC: DirectContracting | null = useMemo(() => {
    if (!isDC) return null
    if (!fetchedDC) return dcBase
    return {
      ...(dcBase || {}),
      id: fetchedDC.id,
      dcNumber: fetchedDC.dcNumber,
      name: fetchedDC.name || fetchedDC.dcName || dcBase?.dcName || '',
      dcName: fetchedDC.name || fetchedDC.dcName || dcBase?.dcName || '',
      bacProjectId: fetchedDC.bacProjectId,
      bacProjectTitle: fetchedDC.bacProjectTitle || '',
      bacResolutionId: fetchedDC.bacProjectId,
      bacResolutionNumber: fetchedDC.bacProjectTitle,
      prNumber: fetchedDC.bacProjectTitle || dcBase?.prNumber || '',
      office: fetchedDC.exclusiveSupplierName || dcBase?.office || '',
      category: 'Direct Contracting',
      modeOfProcurement: 'Direct Contracting',
      totalABC: fetchedDC.totalABC || dcBase?.totalABC || 0,
      status: (fetchedDC.status?.toLowerCase() === 'approved' ? 'approved' :
        fetchedDC.status?.toLowerCase() === 'pending_for_approval' ? 'for-review' :
          fetchedDC.status?.toLowerCase() === 'returned' ? 'rejected' :
            fetchedDC.status?.toLowerCase() === 'submitted_to_supplier' ? 'submitted-to-supplier' :
              dcBase?.status || 'draft'),
      exclusiveSupplierId: fetchedDC.exclusiveSupplierId,
      exclusiveSupplierName: fetchedDC.exclusiveSupplierName || '',
      supplierId: fetchedDC.exclusiveSupplierId,
      supplierName: fetchedDC.exclusiveSupplierName,
      items: fetchedDC.items,
      createdAt: fetchedDC.createdAt || dcBase?.createdAt || new Date().toISOString(),
      submissionDeadline: fetchedDC.submissionDeadline || dcBase?.deadline || '',
      deadline: fetchedDC.submissionDeadline || dcBase?.deadline || '',
      remarks: fetchedDC.reviewRemarks,
      proposalAmount: fetchedDC.proposal?.totalProposalAmount || dcBase?.proposalAmount,
      bidTotalAmount: fetchedDC.proposal?.totalProposalAmount || dcBase?.bidTotalAmount,
      exclusivityProofUrl: fetchedDC.proposal?.exclusivityDocumentUrl || dcBase?.exclusivityProofUrl,
      proposalNotes: fetchedDC.proposal?.proposalRemarks || dcBase?.proposalNotes,
      quotationItems: fetchedDC.proposal?.proposalItems?.length
        ? fetchedDC.proposal.proposalItems.map((pi) => ({
          cprItemId: pi.cprItemId,
          prItemId: pi.cprItemId,
          itemName: pi.cprItemName,
          qty: pi.quantity || 1,
          unit: 'Item',
          bidUnitPrice: pi.unitBid,
          bidTotalAmount: pi.totalBid,
          bidBrand: pi.brand,
          bidModel: pi.model,
          bidColor: pi.color,
          bidBrochureUrl: pi.brochureFileUrl,
        }))
        : dcBase?.quotationItems,
    } as DirectContracting
  }, [isDC, fetchedDC, dcBase])

  const baseItem = activeDC || dciBase!

  const [exportOpen, setExportOpen] = useState(false)
  const [showWizardModal, setShowWizardModal] = useState(false)

  const isQuotationSubmitted =
    baseItem.quotationStatus === 'submitted' ||
    baseItem.status === 'for-review' ||
    baseItem.status === 'for_review' ||
    baseItem.status === 'approved' ||
    baseItem.status === 'rejected'

  // Link to Consolidated PR via prNumber
  const consolidatedPRs = useConsolidatedPRStore((s) => s.consolidatedPRs)
  const linkedPR = useMemo(
    () => consolidatedPRs.find((pr) => pr.id === baseItem.prNumber || pr.prNumber === baseItem.prNumber) ?? null,
    [consolidatedPRs, baseItem.prNumber],
  )

  // Resolve mock data for submitted items if they don't have it
  const resolvedItem = useMemo(() => {
    if (!isQuotationSubmitted) return { ...baseItem, items: activeDC?.items }

    // Exclusivity document fallback
    const exclusivityProofFileName = baseItem.exclusivityProofFileName || 'Sole_Distributorship_Authorization_Certificate.pdf'
    const exclusivityProofUrl = baseItem.exclusivityProofUrl || '#'

    // Notes fallback
    const proposalNotes = baseItem.proposalNotes || 'All items conform to the technical specifications of the procuring entity. Manufacturer warranty and support included.'

    // Quotation items fallback
    let quotationItems = baseItem.quotationItems
    if (!quotationItems || quotationItems.length === 0) {
      if (activeDC?.items && activeDC.items.length > 0) {
        quotationItems = activeDC.items.map((di) => {
          const bidUnitPrice = di.unitABC * 0.95 // slightly discounted from ABC
          return {
            prItemId: di.cprItemId || di.id,
            itemName: di.itemName,
            qty: di.quantity,
            unit: di.unit,
            bidUnitPrice,
            bidTotalAmount: di.quantity * bidUnitPrice,
            bidBrand: 'Accredited Brand',
            bidModel: 'Premium Series',
            bidColor: 'Standard',
            bidBrochureFileName: 'technical_specifications.pdf',
            bidBrochureUrl: '#',
          }
        })
      } else if (linkedPR && linkedPR.selectedPRItems.length > 0) {
        quotationItems = linkedPR.selectedPRItems.map((pi) => {
          const bidUnitPrice = pi.unitPrice * 0.95 // slightly discounted from ABC
          return {
            prItemId: pi.id,
            itemName: pi.itemName,
            qty: pi.qty,
            unit: pi.unit,
            bidUnitPrice,
            bidTotalAmount: pi.qty * bidUnitPrice,
            bidBrand: 'Accredited Brand',
            bidModel: 'Premium Series',
            bidColor: 'Standard',
            bidBrochureFileName: 'technical_specifications.pdf',
            bidBrochureUrl: '#',
          }
        })
      } else {
        const qty = isDC ? (dcBase?.totalItems || 1) : (dciBase?.quantity || 1)
        const unit = isDC ? 'Items' : (dciBase?.unit || 'Items')
        const abcPrice = isDC
          ? ((dcBase?.totalABC ? dcBase.totalABC / qty : 0) || 50000)
          : (dciBase?.actualPurchaseAmount || 50000)
        const bidUnitPrice = abcPrice * 0.95
        quotationItems = [
          {
            prItemId: 'single',
            itemName: isDC ? (dcBase?.dcName || 'Proprietary Request') : (dciBase?.itemName || 'Proprietary Item/Service'),
            qty,
            unit,
            bidUnitPrice,
            bidTotalAmount: qty * bidUnitPrice,
            bidBrand: 'Accredited Brand',
            bidModel: 'Standard Model',
            bidColor: 'Default',
            bidBrochureFileName: 'product_brochure.pdf',
            bidBrochureUrl: '#',
          }
        ]
      }
    }

    // Bid total fallback
    const bidTotalAmount = baseItem.bidTotalAmount || baseItem.proposalAmount || quotationItems.reduce((acc, q) => acc + (q.bidTotalAmount || 0), 0)

    // Proposal amount fallback
    const proposalAmount = baseItem.proposalAmount || bidTotalAmount

    // Single item specs fallback
    const bidUnitPrice = baseItem.bidUnitPrice !== undefined ? baseItem.bidUnitPrice : (quotationItems[0]?.bidUnitPrice ?? 0)
    const bidModel = baseItem.bidModel || 'Standard Model'
    const bidBrand = baseItem.bidBrand || 'Accredited Brand'
    const bidColor = baseItem.bidColor || 'Default'
    const bidBrochureFileName = baseItem.bidBrochureFileName || 'product_brochure.pdf'
    const bidBrochureUrl = baseItem.bidBrochureUrl || '#'

    return {
      ...baseItem,
      items: activeDC?.items,
      exclusivityProofFileName,
      exclusivityProofUrl,
      proposalNotes,
      quotationItems,
      bidTotalAmount,
      proposalAmount,
      bidUnitPrice,
      bidModel,
      bidBrand,
      bidColor,
      bidBrochureFileName,
      bidBrochureUrl,
    }
  }, [baseItem, isQuotationSubmitted, linkedPR, activeDC])

  const item = resolvedItem
  const dc = isDC ? (item as DirectContracting) : null
  const dci = !isDC ? (item as DirectContractingItem) : null

  const hasProposal = isDC ? !!(item as DirectContracting).proposalAmount : (item as DirectContractingItem).quotationStatus === 'submitted'

  const submitProposalMutation = useSubmitProposal()

  const handleWizardSave = async (patch: Partial<DirectContracting> | Partial<DirectContractingItem>) => {
    if (isDC) {
      if (patch.quotationStatus === 'submitted') {
        try {
          const mappedItems = (patch.quotationItems || []).map((q: QuotationItemBid) => ({
            cprItemId: q.cprItemId || q.prItemId || '',
            prItemId: q.prItemId,
            itemName: q.itemName,
            qty: q.qty,
            unit: q.unit,
            unitBid: Number(q.bidUnitPrice) || 0,
            bidUnitPrice: Number(q.bidUnitPrice) || 0,
            bidTotalAmount: Number(q.bidTotalAmount) || 0,
            model: q.bidModel || '',
            bidModel: q.bidModel || '',
            brand: q.bidBrand || '',
            bidBrand: q.bidBrand || '',
            color: q.bidColor || '',
            bidColor: q.bidColor || '',
            brochureFileUrl: q.bidBrochureUrl,
            bidBrochureUrl: q.bidBrochureUrl,
            bidBrochureFileName: q.bidBrochureFileName,
          }))

          const payload = {
            supplierId: activeDC?.supplierId || dc?.supplierId || '',
            exclusivityDocumentUrl: patch.exclusivityProofUrl || '',
            exclusivityProofUrl: patch.exclusivityProofUrl || '',
            exclusivityProofFileName: patch.exclusivityProofFileName || '',
            proposalRemarks: patch.proposalNotes || '',
            proposalNotes: patch.proposalNotes || '',
            proposalAmount: patch.proposalAmount || 0,
            bidTotalAmount: patch.bidTotalAmount || 0,
            brand: patch.bidBrand || '',
            model: patch.bidModel || '',
            brochureUrls: patch.bidBrochureUrl ? [patch.bidBrochureUrl] : [],
            bidAmounts: mappedItems.map((q) => q.bidTotalAmount || 0),
            proposalItems: mappedItems,
            quotationItems: mappedItems,
          }

          await submitProposalMutation.mutateAsync({
            pathParams: { id: item.id },
            payload,
          })
          toast({
            title: '✅ Proposal Submitted',
            description: 'Your formal bid and proposal documents have been submitted to the BAC.',
          })
        } catch (err: unknown) {
          console.error(err)
          const errMsg =
            err instanceof Error && err.message
              ? err.message
              : 'Failed to submit proposal.'
          toast({
            title: 'Error',
            description: errMsg,
          })
          return
        }
      }
    } else {
      // Logic for legacy DA items if needed
    }
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Back button */}
      <div className="mb-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="px-2 py-1 gap-1">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Header card */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-3xl font-bold">{isDC ? (item as DirectContracting).dcNumber : (item as DirectContractingItem).daNumber}</CardTitle>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold uppercase",
                    hasProposal
                      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                      : "bg-indigo-100 text-indigo-700 border-indigo-300"
                  )}
                >
                  {hasProposal ? "PROPOSAL SUBMITTED" : "PENDING QUOTATION"}
                </Badge>
                {hasProposal && (
                  <Badge className="bg-emerald-600 rounded-full px-3 py-1 text-xs font-semibold text-white">
                    QUOTATION SUBMITTED
                  </Badge>
                )}
                {isDC && (item as DirectContracting).proposalAmount === 0 && (
                  <Badge className="bg-red-500 rounded-full px-3 py-1 text-xs font-semibold text-white">
                    NO BUDGET
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Hash className="h-3.5 w-3.5" />
                {isDC ? (item as DirectContracting).prNumber : (item as DirectContractingItem).prNumber}
                — {isDC ? (item as DirectContracting).dcName : (item as DirectContractingItem).itemName}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowWizardModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 font-bold gap-2"
                disabled={isQuotationSubmitted}
              >
                <FileCheck className="h-4 w-4" />
                {isQuotationSubmitted
                  ? 'Submitted'
                  : hasProposal
                    ? 'Update Quotation'
                    : 'Set Quotation & DC Requirements'}
              </Button>
              <Button variant="outline" onClick={() => setExportOpen(true)} className="gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Created Date</p>
              <p className="text-sm font-bold">{new Date((isDC ? (item as DirectContracting).createdAt : (item as DirectContractingItem).purchaseDate) || '').toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">PR Number</p>
              <p className="primary text-sm font-bold font-mono">{isDC ? (item as DirectContracting).prNumber : (item as DirectContractingItem).prNumber}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-cyan-100 text-cyan-700 rounded-lg">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Source</p>
              <p className="text-sm font-bold uppercase tracking-tight">{isDC ? 'Accredited Supplier' : (item as DirectContractingItem).purchaseSource}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-2 transition-all",
          (isDC ? (item as DirectContracting).proposalAmount : (item as DirectContractingItem).totalAmount) ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100"
        )}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              (isDC ? (item as DirectContracting).proposalAmount : (item as DirectContractingItem).totalAmount) ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            )}>
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Budget / ABC</p>
              <p className="text-xl font-black text-primary">
                {formatCurrencyPHP(isDC ? (item as DirectContracting).totalABC : (item as DirectContractingItem).totalAmount)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>Detailed view of the direct contracting item</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/20 divide-y text-sm">
            {[
              ['Item Name', dc ? dc.dcName : dci?.itemName],
              ['Quantity', `${dc ? (dc.totalItems ?? 0) : (dci?.quantity ?? 0)} ${dc ? 'Items' : (dci?.unit ?? '')}`],
              ['ABC / Threshold', `₱${(dc ? (dc.totalABC || 0) : (dci?.actualPurchaseAmount ?? 0)).toLocaleString()}`],
              ['Total Amount', `₱${(dc ? (dc.proposalAmount ?? 0) : (dci?.totalAmount ?? 0)).toLocaleString()}`],
              ['Purchase Source', dc ? 'Accredited Supplier' : (dci?.purchaseSource ?? '')],
              [
                'Purchase Date',
                (dc ? dc.createdAt : dci?.purchaseDate)
                  ? new Date((dc ? dc.createdAt : dci?.purchaseDate)!).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                  : '—',
              ],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-2 px-4 py-3 gap-2">
                <span className="text-muted-foreground font-medium">{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
            <div className="grid grid-cols-2 px-4 py-3 gap-2">
              <span className="text-muted-foreground font-medium">Receipt / Proof</span>
              {(dc ? dc.proposalAttachment : dci?.receiptFileName) ? (
                <a
                  href={(dc ? dc.proposalAttachment : dci?.receiptAttachment) ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline w-fit"
                >
                  <Paperclip className="h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold">{dc ? 'Proposal Document' : dci?.receiptFileName}</span>
                </a>
              ) : (
                <span className="italic text-muted-foreground">No receipt uploaded</span>
              )}
            </div>
            {(dci?.remarks || (dc && dc.status === 'rejected')) && (
              <div className="grid grid-cols-2 px-4 py-3 gap-2">
                <span className="text-muted-foreground font-medium">Remarks</span>
                <span className={`font-semibold ${(dc ? dc.status : dci?.status) === 'rejected' ? 'text-red-700' : ''}`}>
                  {dci?.remarks || dc?.reason}
                </span>
              </div>
            )}
            {!(isDC) && dci?.approvalDocumentFileName && (
              <div className="grid grid-cols-2 px-4 py-3 gap-2">
                <span className="text-muted-foreground font-medium">Approval Document</span>
                <a
                  href={dci.approvalDocumentUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline w-fit"
                >
                  <Paperclip className="h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold">{dci.approvalDocumentFileName}</span>
                </a>
              </div>
            )}
            {(dc ? dc.approvedBy : dci?.approvedBy) && (
              <div className="grid grid-cols-2 px-4 py-3 gap-2">
                <span className="text-muted-foreground font-medium">Approved By</span>
                <span className="font-semibold">
                  {dc ? dc.approvedBy : dci?.approvedBy} — {dc ? dc.approvedAt : dci?.approvedAt}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quotation Details */}
      {(!isDC && (dci?.quotationStatus || (dci?.quotationItems && dci?.quotationItems.length > 0) || dci?.bidUnitPrice !== undefined)) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <CardTitle>Quotation Details</CardTitle>
              {dci?.quotationStatus && (
                <Badge
                  className={
                    dci.quotationStatus === 'submitted'
                      ? 'bg-emerald-600 text-white ml-2'
                      : 'bg-amber-500 text-white ml-2'
                  }
                >
                  {dci.quotationStatus === 'submitted' ? 'Submitted' : 'Draft'}
                </Badge>
              )}
            </div>
            <CardDescription>Bid prices and item specifications submitted by the supplier</CardDescription>
          </CardHeader>
          <CardContent>
            {dci?.quotationItems && dci.quotationItems.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Bid Unit Price</TableHead>
                      <TableHead>Bid Total</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead className="text-left">Brochure</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dci.quotationItems.map((qi: QuotationItemBid, idx: number) => (
                      <TableRow key={qi.prItemId ?? idx}>
                        <TableCell className="font-medium">{qi.itemName}</TableCell>
                        <TableCell>{qi.qty} {qi.unit}</TableCell>
                        <TableCell className="font-semibold">₱{qi.bidUnitPrice.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold text-emerald-700">₱{qi.bidTotalAmount.toLocaleString()}</TableCell>
                        <TableCell>{qi.bidModel || <span className="text-muted-foreground italic">—</span>}</TableCell>
                        <TableCell>{qi.bidBrand || <span className="text-muted-foreground italic">—</span>}</TableCell>
                        <TableCell>{qi.bidColor || <span className="text-muted-foreground italic">—</span>}</TableCell>
                        <TableCell className="font-medium text-left">
                          {qi.bidBrochureFileName ? (
                            <a
                              href={qi.bidBrochureUrl ?? '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 hover:underline text-sm"
                            >
                              <Paperclip className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate max-w-[120px]" title={qi.bidBrochureFileName}>{qi.bidBrochureFileName}</span>
                            </a>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">None</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/20 divide-y text-sm">
                {[
                  ['Bid Unit Price', dci?.bidUnitPrice !== undefined ? `₱${dci.bidUnitPrice.toLocaleString()}` : null],
                  ['Bid Total Amount', dci?.bidTotalAmount !== undefined ? `₱${dci.bidTotalAmount.toLocaleString()}` : null],
                  ['Model', dci?.bidModel],
                  ['Brand', dci?.bidBrand],
                  ['Color', dci?.bidColor],
                ].filter(([, v]) => v !== null).map(([label, value]) => (
                  <div key={label} className="grid grid-cols-2 px-4 py-3 gap-2">
                    <span className="text-muted-foreground font-medium">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
                {dci?.bidBrochureFileName && (
                  <div className="grid grid-cols-2 px-4 py-3 gap-2">
                    <span className="text-muted-foreground font-medium">Brochure</span>
                    <a
                      href={dci.bidBrochureUrl ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline w-fit"
                    >
                      <Paperclip className="h-4 w-4 flex-shrink-0" />
                      <span className="font-semibold">{dci.bidBrochureFileName}</span>
                    </a>
                  </div>
                )}
              </div>
            )}
            {dci?.quotationSubmittedAt && (
              <div className="mt-4 text-xs text-muted-foreground text-right italic">
                Submitted at: {new Date(dci.quotationSubmittedAt).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* DA Requirements (only for legacy OR if we want to show it for DC too? For now, keep it legacy-only to fix errors) */}
      {(!isDC && (dci?.daRequirementsStatus || dci?.exclusivityProofFileName || dci?.soleDistCertFileName || dci?.proposalNotes || dci?.proposalUnitPrice !== undefined)) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              <CardTitle>DA Requirements</CardTitle>
              {dci?.daRequirementsStatus && (
                <Badge
                  className={
                    dci.daRequirementsStatus === 'submitted'
                      ? 'bg-emerald-600 text-white ml-2'
                      : 'bg-amber-500 text-white ml-2'
                  }
                >
                  {dci.daRequirementsStatus === 'submitted' ? 'Submitted' : 'Draft'}
                </Badge>
              )}
            </div>
            <CardDescription>Support documents for Direct Contracting justification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted/20 divide-y text-sm">
              <div className="grid grid-cols-2 px-4 py-3 gap-2">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-violet-500" /> Proof of Exclusivity
                </span>
                {dci?.exclusivityProofFileName ? (
                  <a
                    href={dci.exclusivityProofUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline w-fit"
                  >
                    <Paperclip className="h-4 w-4 flex-shrink-0" />
                    <span className="font-semibold">{dci.exclusivityProofFileName}</span>
                  </a>
                ) : (
                  <span className="italic text-muted-foreground">Not uploaded</span>
                )}
              </div>
              <div className="grid grid-cols-2 px-4 py-3 gap-2">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" /> Sole Distributorship Certificate
                </span>
                {dci?.soleDistCertFileName ? (
                  <a
                    href={dci.soleDistCertUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline w-fit"
                  >
                    <Paperclip className="h-4 w-4 flex-shrink-0" />
                    <span className="font-semibold">{dci.soleDistCertFileName}</span>
                  </a>
                ) : (
                  <span className="italic text-muted-foreground">Not uploaded</span>
                )}
              </div>
              {dci?.proposalUnitPrice !== undefined && (
                <div className="grid grid-cols-2 px-4 py-3 gap-2">
                  <span className="text-muted-foreground font-medium">Proposed Unit Price</span>
                  <span className="font-semibold text-emerald-700">₱{dci.proposalUnitPrice.toLocaleString()}</span>
                </div>
              )}
              {dci?.proposalNotes && (
                <div className="grid grid-cols-2 px-4 py-3 gap-2">
                  <span className="text-muted-foreground font-medium">Proposal Notes</span>
                  <span className="font-semibold">{dci.proposalNotes}</span>
                </div>
              )}
              <div className="grid grid-cols-2 px-4 py-3 gap-2 border-t bg-emerald-50/50">
                <span className="text-emerald-900 font-bold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Final Proposal Amount
                </span>
                {dci?.proposalUnitPrice !== undefined && (
                  <span className="font-semibold text-emerald-700">₱{dci.proposalUnitPrice.toLocaleString()}</span>
                )}
              </div>
            </div>
            {dci?.daRequirementsSubmittedAt && (
              <div className="mt-4 text-xs text-muted-foreground text-right italic">
                Submitted at: {new Date(dci.daRequirementsSubmittedAt).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Linked Consolidated PR Items */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-4 w-4 text-primary" />
            Consolidated PR Items
          </CardTitle>
          <CardDescription>Items from the linked Consolidated PR ({item.prNumber || '—'})</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!linkedPR ? (
            <p className="text-sm text-muted-foreground">
              No Consolidated PR data found for <span className="font-mono">{item.prNumber}</span>.
            </p>
          ) : linkedPR.selectedPRItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items are attached to this Consolidated PR.</p>
          ) : (
            <Tabs defaultValue="by-office" className="w-full">
              <TabsList className="grid grid-cols-2 gap-2 bg-muted/50 p-2 mb-4">
                <TabsTrigger value="by-office" className="flex items-center gap-2">
                  📋 By Office
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  📊 Summary
                </TabsTrigger>
              </TabsList>

              <TabsContent value="by-office" className="space-y-4">
                {Object.entries(
                  linkedPR.selectedPRItems.reduce<Record<string, Array<ConsolidatedPRItem>>>((g, it) => {
                    const k = it.prOffice || '—'
                    if (!g[k]) g[k] = []
                    g[k].push(it)
                    return g
                  }, {}),
                ).map(([office, officeItems], index) => {
                  const sourceTotal = officeItems.reduce((sum, it) => sum + it.totalAmount, 0)
                  const prs = Array.from(new Set(officeItems.map((i) => i.prNumber).filter(Boolean)))
                  const uniqueMonths = Array.from(new Set(officeItems.map((i) => i.month).filter(Boolean)))
                  const monthLabel =
                    uniqueMonths.length === 0
                      ? '—'
                      : uniqueMonths.length === 1
                        ? formatMonthLabel(uniqueMonths[0])
                        : 'Multiple'
                  const uniqueFunds = Array.from(new Set(officeItems.map((i) => i.fund).filter(Boolean)))
                  const fundLabel =
                    uniqueFunds.length === 0 ? '—' : uniqueFunds.length === 1 ? uniqueFunds[0] : 'Multiple'
                  const uniquePrTypes = Array.from(new Set(officeItems.map((i) => i.prType).filter(Boolean)))
                  const prTypeLabel =
                    uniquePrTypes.length === 0
                      ? '—'
                      : uniquePrTypes.length === 1
                        ? uniquePrTypes[0] === 'out-of-stock'
                          ? 'Out of Stock'
                          : 'Non-CSE'
                        : 'Multiple'

                  return (
                    <div key={office}>
                      {index > 0 && <Separator className="mb-4" />}
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-medium">{office}</p>
                            <p className="text-sm text-muted-foreground">
                              {prs.length > 0 ? `${prs.join(', ')} · ` : ''}
                              {officeItems.length} item(s)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Month: {monthLabel} · Fund: {fundLabel}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline">{prTypeLabel}</Badge>
                            <Badge variant="outline">{formatCurrencyPHP(sourceTotal)}</Badge>
                          </div>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-default-200">
                          <Table>
                            <TableHeader className="bg-default-50">
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Fund</TableHead>
                                {MONTH_NAMES.map((m) => (
                                  <TableHead key={m} className="text-center">
                                    {m}
                                  </TableHead>
                                ))}
                                <TableHead className="text-center">Total Qty</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead className="text-left">Total Amount</TableHead>
                                <TableHead>Mode of Procurement</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {officeItems.map((prItem) => {
                                const itemMop = linkedPR.itemMOPs?.[prItem.id]
                                const itemMonth = formatMonthLabel(prItem.month)
                                return (
                                  <TableRow key={prItem.id}>
                                    <TableCell className="font-medium">{prItem.itemName}</TableCell>
                                    <TableCell>{prItem.category}</TableCell>
                                    <TableCell>{prItem.fund}</TableCell>
                                    {MONTH_NAMES.map((m) => (
                                      <TableCell key={m} className="text-center">
                                        {itemMonth === m ? `${prItem.qty} ${prItem.unit}` : `0 ${prItem.unit}`}
                                      </TableCell>
                                    ))}
                                    <TableCell className="text-center font-semibold">
                                      <Badge variant="outline">
                                        {prItem.qty} {prItem.unit}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{formatCurrencyPHP(prItem.unitPrice)}</TableCell>
                                    <TableCell className="text-left">
                                      {formatCurrencyPHP(prItem.totalAmount)}
                                    </TableCell>
                                    <TableCell>
                                      {itemMop?.mop
                                        ? itemMop.mop
                                          .split('-')
                                          .map((p) => p[0].toUpperCase() + p.slice(1))
                                          .join(' ')
                                        : '—'}
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                {(() => {
                  const officeGroups = linkedPR.selectedPRItems.reduce<Record<string, Array<ConsolidatedPRItem>>>(
                    (g, it) => {
                      const k = it.prOffice || '—'
                      if (!g[k]) g[k] = []
                      g[k].push(it)
                      return g
                    },
                    {},
                  )

                  const officeSummaries = Object.entries(officeGroups).map(([office, items]) => {
                    const distinctItems = new Set(items.map((i) => i.id)).size
                    const totalQtyByUnit = items.reduce<Record<string, number>>((acc, i) => {
                      const unit = i.unit || 'unit'
                      acc[unit] = (acc[unit] || 0) + i.qty
                      return acc
                    }, {})
                    const totalQtyLabel = Object.entries(totalQtyByUnit)
                      .map(([unit, qty]) => `${qty} ${unit}`)
                      .join(', ')
                    const totalAmount = items.reduce((s, i) => s + i.totalAmount, 0)
                    const totalDeficit = items.reduce((s, i) => s + (i.deficit ?? 0), 0)
                    return {
                      office,
                      distinctItems,
                      totalQty: totalQtyLabel,
                      qtyByUnit: totalQtyByUnit,
                      totalAmount,
                      totalDeficit,
                    }
                  })

                  const grandQtyByUnit = officeSummaries.reduce<Record<string, number>>((acc, s) => {
                    Object.entries(s.qtyByUnit || {}).forEach(([unit, qty]) => {
                      acc[unit] = (acc[unit] || 0) + qty
                    })
                    return acc
                  }, {})
                  const grand = officeSummaries.reduce(
                    (acc, s) => ({
                      ...acc,
                      distinctItems: acc.distinctItems + s.distinctItems,
                      totalAmount: acc.totalAmount + s.totalAmount,
                      totalDeficit: acc.totalDeficit + s.totalDeficit,
                    }),
                    { distinctItems: 0, totalQty: '', totalAmount: 0, totalDeficit: 0 },
                  )
                  grand.totalQty =
                    Object.entries(grandQtyByUnit)
                      .map(([unit, qty]) => `${qty} ${unit}`)
                      .join(', ') || '0'

                  return (
                    <div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div className="rounded-lg p-3 shadow-sm bg-amber-50 border border-amber-100">
                          <div className="text-xs text-amber-700">Offices</div>
                          <div className="text-lg font-semibold text-amber-900">{officeSummaries.length}</div>
                        </div>
                        <div className="rounded-lg p-3 shadow-sm bg-sky-50 border border-sky-100 text-center">
                          <div className="text-xs text-sky-700">Distinct Item Types</div>
                          <div className="text-lg font-semibold text-sky-900">{grand.distinctItems}</div>
                        </div>
                        <div className="rounded-lg p-3 shadow-sm bg-violet-50 border border-violet-100 text-center">
                          <div className="text-xs text-violet-700">Total Quantity</div>
                          <div className="text-lg font-semibold text-violet-900">{grand.totalQty}</div>
                        </div>
                        <div className="rounded-lg p-3 shadow-sm bg-emerald-50 border border-emerald-100 text-right">
                          <div className="text-xs text-emerald-700">Total Amount</div>
                          <div className="text-lg font-semibold text-emerald-900">
                            {formatCurrencyPHP(grand.totalAmount)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">Summary by requesting office</div>
                      <div className="overflow-x-auto rounded-lg border border-default-200">
                        <Table>
                          <TableHeader className="bg-default-50 sticky top-0">
                            <TableRow>
                              <TableHead className="text-left">Office</TableHead>
                              <TableHead className="text-left">Distinct Items</TableHead>
                              <TableHead className="text-left">Total Qty</TableHead>
                              <TableHead className="text-left">Total Amount</TableHead>
                              <TableHead className="text-center">Deficit</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {officeSummaries.map((s) => (
                              <TableRow key={s.office} className="hover:bg-muted/5">
                                <TableCell className="font-medium">{s.office}</TableCell>
                                <TableCell>{s.distinctItems}</TableCell>
                                <TableCell>{s.totalQty}</TableCell>
                                <TableCell className="font-semibold">{formatCurrencyPHP(s.totalAmount)}</TableCell>
                                <TableCell className="text-center">
                                  {s.totalDeficit > 0 ? (
                                    <Badge className="bg-red-50 text-red-700">{s.totalDeficit}</Badge>
                                  ) : (
                                    <Badge className="bg-green-50 text-green-700">OK</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-default-50">
                              <TableCell className="font-semibold">Total</TableCell>
                              <TableCell className="font-semibold">{grand.distinctItems}</TableCell>
                              <TableCell className="font-semibold">{grand.totalQty}</TableCell>
                              <TableCell className="font-semibold">
                                {formatCurrencyPHP(grand.totalAmount)}
                              </TableCell>
                              <TableCell className="text-center font-semibold">
                                {grand.totalDeficit || '—'}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )
                })()}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Submitted Proposal & Exclusivity Document Card */}
      {(item.quotationStatus || item.exclusivityProofFileName || item.proposalNotes) && (
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-4 w-4 text-primary" />
                Submitted Proposal &amp; Exclusivity Document
              </CardTitle>
              <Badge
                variant="outline"
                className={cn(
                  "px-3 py-0.5 rounded-full text-xs font-semibold uppercase",
                  item.quotationStatus === 'submitted'
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                    : "bg-amber-100 text-amber-700 border-amber-300"
                )}
              >
                {item.quotationStatus === 'submitted' ? 'Submitted' : 'Draft'}
              </Badge>
            </div>
            <CardDescription>
              Justification documents and itemized quotation details submitted by the supplier.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exclusivity Document Link */}
              <div className="p-4 rounded-lg border bg-muted/10 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exclusivity Justification</p>
                {item.exclusivityProofFileName ? (
                  <a
                    href={item.exclusivityProofUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline text-sm font-semibold w-fit"
                  >
                    <Paperclip className="h-4 w-4 text-primary" />
                    <span>{item.exclusivityProofFileName}</span>
                  </a>
                ) : (
                  <p className="text-sm italic text-muted-foreground">No exclusivity document uploaded</p>
                )}
              </div>

              {/* Proposal Notes */}
              <div className="p-4 rounded-lg border bg-muted/10 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proposal Notes &amp; Remarks</p>
                {item.proposalNotes ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap">{item.proposalNotes}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">No notes or remarks provided</p>
                )}
              </div>
            </div>

            {/* Quotation Table */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-muted-foreground">Quotation Details</p>
              {item.quotationItems && item.quotationItems.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Model / Brand / Color</TableHead>
                        <TableHead>Unit Bid</TableHead>
                        <TableHead>Total Bid</TableHead>
                        <TableHead>Brochure</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.quotationItems.map((qi: QuotationItemBid, idx: number) => (
                        <TableRow key={qi.prItemId ?? idx}>
                          <TableCell className="font-medium">{qi.itemName}</TableCell>
                          <TableCell>{qi.qty} {qi.unit}</TableCell>
                          <TableCell>
                            {qi.bidModel || qi.bidBrand ? (
                              <span className="text-xs">
                                {qi.bidModel && <span><strong>Model:</strong> {qi.bidModel} </span>}
                                {qi.bidBrand && <span><strong>Brand:</strong> {qi.bidBrand} </span>}
                                {qi.bidColor && <span><strong>Color:</strong> {qi.bidColor} </span>}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">{formatCurrencyPHP(qi.bidUnitPrice)}</TableCell>
                          <TableCell className="font-semibold text-emerald-700">{formatCurrencyPHP(qi.bidTotalAmount)}</TableCell>
                          <TableCell>
                            {qi.bidBrochureFileName ? (
                              <a
                                href={qi.bidBrochureUrl ?? '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 hover:underline text-xs"
                              >
                                <Paperclip className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate max-w-[100px]" title={qi.bidBrochureFileName}>{qi.bidBrochureFileName}</span>
                              </a>
                            ) : (
                              <span className="text-muted-foreground italic text-xs">None</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/10 divide-y text-sm">
                  <div className="grid grid-cols-2 px-4 py-3 gap-2">
                    <span className="text-muted-foreground font-medium">Bid Unit Price</span>
                    <span className="font-semibold">
                      {item.bidUnitPrice !== undefined ? formatCurrencyPHP(item.bidUnitPrice) : formatCurrencyPHP(item.proposalUnitPrice ?? 0)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 px-4 py-3 gap-2">
                    <span className="text-muted-foreground font-medium">Bid Total Amount</span>
                    <span className="font-semibold text-emerald-700">
                      {formatCurrencyPHP(item.bidTotalAmount ?? item.proposalAmount ?? 0)}
                    </span>
                  </div>
                  {(item.bidModel || item.bidBrand || item.bidColor) && (
                    <div className="grid grid-cols-2 px-4 py-3 gap-2">
                      <span className="text-muted-foreground font-medium">Specifications</span>
                      <span className="font-semibold">
                        {item.bidModel && `Model: ${item.bidModel} `}
                        {item.bidBrand && `Brand: ${item.bidBrand} `}
                        {item.bidColor && `Color: ${item.bidColor}`}
                      </span>
                    </div>
                  )}
                  {item.bidBrochureFileName && (
                    <div className="grid grid-cols-2 px-4 py-3 gap-2">
                      <span className="text-muted-foreground font-medium">Brochure</span>
                      <a
                        href={item.bidBrochureUrl ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline w-fit font-semibold"
                      >
                        <Paperclip className="h-4 w-4 flex-shrink-0" />
                        <span>{item.bidBrochureFileName}</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Total Quotation Amount Summary */}
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border mt-2">
                <span className="text-sm font-semibold text-muted-foreground">Total Proposal Amount</span>
                <span className="text-xl font-black text-primary">
                  {formatCurrencyPHP(item.bidTotalAmount ?? item.proposalAmount ?? 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <DARequirementsModal
        open={showWizardModal}
        onOpenChange={setShowWizardModal}
        item={item}
        onSave={handleWizardSave}
      />

      <ExportComingSoonDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}
