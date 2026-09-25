import {  useMemo, useState } from 'react'
import {
  ArrowLeft, Building2, Calendar,
  CheckCircle, Clock, Download, FileCheck, FileText, Receipt, RotateCcw, Send, ShieldCheck, ShoppingCart, Tag, UserCheck
} from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {  DirectContractingStatusEnum } from '../types'
import { useChangeDirectContractingStatus, useDirectContracting } from '../handlers'
import type {ComponentType} from 'react';
import type {DirectContracting} from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { extractErrorMessage } from '@/services/utils/messages'
import { useConsolidatedPRStore } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import { formatCurrencyPHP, formatDisplayDate } from '@/utils/formatters'
import { cn } from '@/lib/utils'

import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: ComponentType<{ className?: string }> }> = {
  [DirectContractingStatusEnum.DRAFT]: { label: 'DRAFT', className: 'bg-gray-100 text-gray-700 border-gray-300', icon: ShoppingCart },
  [DirectContractingStatusEnum.FOR_REVIEW]: { label: 'FOR REVIEW', className: 'bg-amber-100 text-amber-700 border-amber-300', icon: FileCheck },
  [DirectContractingStatusEnum.SUBMITTED_TO_SUPPLIER]: { label: 'SUBMITTED TO SUPPLIER', className: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle },
  [DirectContractingStatusEnum.PENDING_FOR_APPROVAL]: { label: 'PENDING APPROVAL', className: 'bg-sky-100 text-sky-700 border-sky-300', icon: Clock },
  [DirectContractingStatusEnum.APPROVED]: { label: 'APPROVED', className: 'bg-green-100 text-green-700 border-green-300', icon: ShieldCheck },
  [DirectContractingStatusEnum.RETURNED]: { label: 'RETURNED', className: 'bg-rose-100 text-rose-700 border-rose-300', icon: RotateCcw },
  DRAFT: { label: 'DRAFT', className: 'bg-gray-100 text-gray-700 border-gray-300', icon: ShoppingCart },
  FOR_REVIEW: { label: 'FOR REVIEW', className: 'bg-amber-100 text-amber-700 border-amber-300', icon: FileCheck },
  'FOR-REVIEW': { label: 'FOR REVIEW', className: 'bg-amber-100 text-amber-700 border-amber-300', icon: FileCheck },
  SUBMITTED_TO_SUPPLIER: { label: 'SUBMITTED TO SUPPLIER', className: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle },
  'SUBMITTED-TO-SUPPLIER': { label: 'SUBMITTED TO SUPPLIER', className: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle },
  PENDING_FOR_APPROVAL: { label: 'PENDING APPROVAL', className: 'bg-sky-100 text-sky-700 border-sky-300', icon: Clock },
  APPROVED: { label: 'APPROVED', className: 'bg-green-100 text-green-700 border-green-300', icon: ShieldCheck },
  RETURNED: { label: 'RETURNED', className: 'bg-rose-100 text-rose-700 border-rose-300', icon: RotateCcw },
  REJECTED: { label: 'REJECTED', className: 'bg-rose-100 text-rose-700 border-rose-300', icon: RotateCcw },
  draft: { label: 'DRAFT', className: 'bg-gray-100 text-gray-700 border-gray-300', icon: ShoppingCart },
  submitted: { label: 'SUBMITTED', className: 'bg-blue-100 text-blue-700 border-blue-300', icon: Send },
  'for-review': { label: 'FOR REVIEW', className: 'bg-amber-100 text-amber-700 border-amber-300', icon: FileCheck },
  'submitted-to-supplier': { label: 'SUBMITTED TO SUPPLIER', className: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle },
  approved: { label: 'APPROVED', className: 'bg-green-100 text-green-700 border-green-300', icon: ShieldCheck },
  returned: { label: 'RETURNED', className: 'bg-rose-100 text-rose-700 border-rose-300', icon: RotateCcw },
  rejected: { label: 'REJECTED', className: 'bg-rose-100 text-rose-700 border-rose-300', icon: RotateCcw },
}

interface Props {
  entry: DirectContracting
  onBack: () => void
  isManagementView?: boolean
}

export function DirectContractingDetailsPage({ entry: initialEntry, onBack, isManagementView = false }: Props) {
  const queryClient = useQueryClient()
  const consolidatedPRs = useConsolidatedPRStore((state) => state.consolidatedPRs)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showConvertToDraftConfirm, setShowConvertToDraftConfirm] = useState(false)
  const [showSendToSupplierConfirm, setShowSendToSupplierConfirm] = useState(false)

  const {
    data: directContractingResponse,
    isLoading,
    error,
    refetch,
  } = useDirectContracting({
    pathParams: { id: initialEntry.id },
    queryParams: {},
    enabled: !!initialEntry.id,
  })

  const item = directContractingResponse?.data ?? initialEntry



  // Find linked PR items across all consolidated PRs mentioned in item.prNumber / bacProjectTitle (comma separated)
  const linkedItems = useMemo(() => {
    const prNumbers = (item.prNumber || item.bacProjectTitle || '').split(',').map((s) => s.trim())
    return consolidatedPRs
      .filter((cpr) => prNumbers.includes(cpr.prNumber || ''))
      .flatMap((cpr) => cpr.selectedPRItems)
  }, [item.prNumber, item.bacProjectTitle, consolidatedPRs])

  const displayItems = useMemo(() => {
    if (item.items && item.items.length > 0) {
      return item.items.map((it) => ({
        itemName: it.itemName,
        qty: it.quantity,
        unit: it.unit,
        unitPrice: it.unitABC,
        totalAmount: it.totalABC,
      }))
    }
    return linkedItems
  }, [item.items, linkedItems])

  const statusMutation = useChangeDirectContractingStatus()

  const statusUpper = (item.status || '').toUpperCase()
  const isDraft = statusUpper === DirectContractingStatusEnum.DRAFT || statusUpper === 'DRAFT'
  const isForReview =
    statusUpper === DirectContractingStatusEnum.FOR_REVIEW ||
    statusUpper === 'FOR_REVIEW' ||
    statusUpper === 'FOR-REVIEW'
  const isSubmittedToSupplier =
    statusUpper === DirectContractingStatusEnum.SUBMITTED_TO_SUPPLIER ||
    statusUpper === 'SUBMITTED_TO_SUPPLIER' ||
    statusUpper === 'SUBMITTED-TO-SUPPLIER'
  const isReturned =
    statusUpper === DirectContractingStatusEnum.RETURNED ||
    statusUpper === 'RETURNED' ||
    statusUpper === 'REJECTED'
  const isApproved =
    statusUpper === DirectContractingStatusEnum.APPROVED ||
    statusUpper === 'APPROVED'

  const status =
    STATUS_CONFIG[statusUpper] ||
    STATUS_CONFIG[(item.status || '').toLowerCase()] ||
    STATUS_CONFIG[DirectContractingStatusEnum.DRAFT]

  const proposalAmount = item.proposal?.totalProposalAmount ?? item.proposalAmount
  const exclusiveSupplierName = item.exclusiveSupplierName || item.supplierName || item.office || '—'
  const dcName = item.name || item.dcName || 'Direct Contracting Request'
  const bacResolutionNumber = item.bacProjectTitle || item.bacResolutionNumber || 'N/A'
  const submissionDeadline = item.submissionDeadline || item.deadline
  const remarks = item.proposal?.proposalRemarks || item.reviewRemarks || item.remarks

  const handleSendToSupplier = async () => {
    try {
      await toast.promise(
        statusMutation.mutateAsync(
          {
            pathParams: { id: item.id },
            payload: { status: DirectContractingStatusEnum.SUBMITTED_TO_SUPPLIER },
          },
          {
            onSuccess: async () => {
              await queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].includes('direct-contracting'),
              })
              onBack()
            },
          },
        ),
        {
          loading: 'Submitting request to supplier...',
          success: `Direct Contracting request ${item.dcNumber} has been submitted to ${exclusiveSupplierName}.`,
          error: (err: unknown) => extractErrorMessage(err as any) || 'Failed to submit request status.',
        },
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleConvertToDraft = async () => {
    try {
      await toast.promise(
        statusMutation.mutateAsync(
          {
            pathParams: { id: item.id },
            payload: { status: DirectContractingStatusEnum.DRAFT },
          },
          {
            onSuccess: async () => {
              await queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].includes('direct-contracting'),
              })
              onBack()
            },
          },
        ),
        {
          loading: 'Converting request to draft...',
          success: `Direct Contracting request ${item.dcNumber} has been converted back to draft.`,
          error: (err: unknown) => extractErrorMessage(err as any) || 'Failed to convert request to draft.',
        },
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleInitialSubmit = async () => {
    try {
      await toast.promise(
        statusMutation.mutateAsync(
          {
            pathParams: { id: item.id },
            payload: { status: DirectContractingStatusEnum.FOR_REVIEW },
          },
          {
            onSuccess: async () => {
              await queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].includes('direct-contracting'),
              })
              onBack()
            },
          },
        ),
        {
          loading: 'Submitting request for review...',
          success: `Direct Contracting request ${item.dcNumber} has been submitted for review.`,
          error: (err: unknown) => extractErrorMessage(err as any) || 'Failed to submit request status.',
        },
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div className="space-y-6 pb-20">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{dcName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{item.dcNumber}</Badge>
                <Badge className={cn("border", status.className)}>
                  <status.icon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isManagementView && isDraft && (
              <Button onClick={() => setShowSubmitConfirm(true)} className="bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition-all">
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            )}
            {!isManagementView && (isForReview || isReturned) && (
              <Button onClick={() => setShowConvertToDraftConfirm(true)} variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold shadow-sm transition-all">
                <RotateCcw className="mr-2 h-4 w-4" />
                Convert to Draft
              </Button>
            )}
            {isManagementView && isForReview && (
              <Button onClick={() => setShowSendToSupplierConfirm(true)} className="bg-primary text-primary-foreground font-bold shadow-lg hover:bg-primary/90 transition-all">
                <Send className="mr-2 h-4 w-4" />
                Submit to Supplier
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                toast.info('Preparing your Direct Contracting request document for printing...')
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Print Direct Contracting Request
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Basic Info & Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Procurement Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">BAC Resolution</p>
                      <p className="font-semibold">{bacResolutionNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Requesting Office</p>
                      <p className="font-semibold">{exclusiveSupplierName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Submission Deadline</p>
                      <p className="font-semibold">{formatDisplayDate(submissionDeadline)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary">
                      <Tag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mode of Procurement</p>
                      <Badge color="secondary">Direct Contracting (RA 12009)</Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Line Items (Consolidated from PRs)
                  </h3>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Item Description</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Unit Price (ABC)</TableHead>
                          <TableHead>Total ABC</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayItems.length > 0 ? (
                          displayItems.map((itemRow, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{itemRow.itemName}</TableCell>
                              <TableCell>{itemRow.qty}</TableCell>
                              <TableCell>{itemRow.unit}</TableCell>
                              <TableCell>{formatCurrencyPHP(itemRow.unitPrice)}</TableCell>
                              <TableCell className="font-semibold">{formatCurrencyPHP(itemRow.totalAmount)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground italic">
                              No items found for the linked PRs ({item.bacProjectTitle || item.prNumber || 'N/A'})
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end p-2 bg-muted/20 rounded-lg">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Approved Budget (ABC)</p>
                      <p className="text-xl font-bold text-primary">{formatCurrencyPHP(item.totalABC)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {proposalAmount && !isDraft && !isForReview && (
              <Card className="border-primary/20">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Supplier Proposal (Submitted by {exclusiveSupplierName})
                  </CardTitle>
                  <CardDescription>
                    Review the prices and legal documents submitted for this proprietary acquisition.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 rounded-xl border bg-primary/5 border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-bold">Quoted Amount</p>
                      <p className="text-3xl font-black text-primary">{formatCurrencyPHP(proposalAmount || 0)}</p>
                      {proposalAmount > item.totalABC && (
                        <Badge color="destructive" className="mt-2">EXCEEDS ABC</Badge>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Remarks/Notes</p>
                        <p className="text-sm italic p-3 bg-muted rounded-md">{remarks || 'No remarks provided by supplier.'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-sm uppercase text-muted-foreground tracking-widest border-b pb-2">Verification Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 text-red-600 rounded">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold truncate max-w-[200px]">{item.proposal?.exclusivityDocumentUrl || item.exclusivityProofFileName || 'Exclusivity_Proof.pdf'}</p>
                            <p className="text-[10px] text-muted-foreground">Sole Distributorship Proof</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="group-hover:text-primary">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold truncate max-w-[200px]">{item.soleDistCertFileName || 'Distributorship_Cert.pdf'}</p>
                            <p className="text-[10px] text-muted-foreground">Manufacturer Certification</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="group-hover:text-primary">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!proposalAmount && !isDraft && (
              <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                <Send className="h-10 w-10 mb-4 opacity-20" />
                <p className="text-lg font-medium">Proposal Pending</p>
                <p className="text-sm">Once the request is sent and reviewed, the supplier will upload their proprietary proof and pricing.</p>
              </div>
            )}
          </div>

          {/* Right Column: Timeline/Metadata */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Lifecycle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="relative pl-6 pb-6 border-l-2 border-primary/30 last:pb-0 last:border-l-transparent">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                    <p className="text-sm font-bold">Request Created</p>
                    <p className="text-xs text-muted-foreground">{formatDisplayDate(item.createdAt) ? new Date(formatDisplayDate(item.createdAt)).toLocaleString() : 'N/A'}</p>
                    <p className="text-xs mt-1 italic">Initialized by Procurement Office</p>
                  </div>

                  {!isDraft && (
                    <div className="relative pl-6 pb-6 border-l-2 border-primary/30 last:pb-0 last:border-l-transparent">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                      <p className="text-sm font-bold">Submitted</p>
                      <p className="text-xs text-muted-foreground">Notification dispatched to BAC Secretariat</p>
                    </div>
                  )}

                  {(isSubmittedToSupplier || isApproved || isReturned) && (
                    <div className="relative pl-6 pb-6 border-l-2 border-primary/30 last:pb-0 last:border-l-transparent">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                      <p className="text-sm font-bold">Submitted to Supplier</p>
                      <p className="text-xs text-muted-foreground">Request sent to {exclusiveSupplierName}</p>
                    </div>
                  )}

                  {proposalAmount && !isDraft && !isForReview && (
                    <div className="relative pl-6 pb-6 border-l-2 border-primary/30 last:pb-0 last:border-l-transparent">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background" />
                      <p className="text-sm font-bold">Proposal Submitted</p>
                      <p className="text-xs text-muted-foreground">Supplier proposal and exclusivity proof uploaded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-none">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">System Audit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">UUID</p>
                  <p className="text-[10px] break-all opacity-60">{item.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Workflow Version</p>
                  <p className="text-xs font-bold">NGP-RA12009-Direct-Contracting</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ConfirmAlertDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title="Submit Direct Contracting Request?"
        description={`Are you sure you want to submit the Direct Contracting request ${item.dcNumber} for review?`}
        confirmLabel="Submit"
        onConfirm={async () => {
          setShowSubmitConfirm(false)
          await handleInitialSubmit()
        }}
      />
      <ConfirmAlertDialog
        open={showConvertToDraftConfirm}
        onOpenChange={setShowConvertToDraftConfirm}
        title="Convert Request to Draft?"
        description={`Are you sure you want to convert the Direct Contracting request ${item.dcNumber} back to draft? It will be editable again.`}
        confirmLabel="Convert to Draft"
        onConfirm={async () => {
          setShowConvertToDraftConfirm(false)
          await handleConvertToDraft()
        }}
      />
      <ConfirmAlertDialog
        open={showSendToSupplierConfirm}
        onOpenChange={setShowSendToSupplierConfirm}
        title="Submit Request to Supplier?"
        description={`Are you sure you want to submit this request to supplier ${exclusiveSupplierName}?`}
        confirmLabel="Submit to Supplier"
        onConfirm={async () => {
          setShowSendToSupplierConfirm(false)
          await handleSendToSupplier()
        }}
      />

    </>
  )
}
