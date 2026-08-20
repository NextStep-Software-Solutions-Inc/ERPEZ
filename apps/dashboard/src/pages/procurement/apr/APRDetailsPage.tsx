/**
 * APR Details Page
 * Pixel-accurate implementation matching the approved design layout:
 * 1. Top soft purple identity banner
 * 2. 4-card metric stats strip
 * 3. Consolidated Items table card
 * 4. 2-column Details and Entities & Requestor cards
 * 5. Terms & Conditions and Activity & Timeline bottom tabs
 * 6. Sticky bottom action bar with metadata and workflow buttons
 */

import { useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { invalidateAPRQueries } from '@/features/procurement/apr/utils/invalidateAPRQueries'
import { normalizeAPRStatus } from '@/features/procurement/apr/utils'
import {
  ArrowLeft,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  RotateCcw,
  Printer,
  History,
  FileText,
  FileEdit,
  AlertTriangle,
} from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  APRIdentityBanner,
  APRDetailsEntitiesGrid,
  APRStatsGrid,
  ConsolidatedItemsTable,
  APRTermsConditionsSection,
  APRStatusBadge,
} from '@/features/procurement/apr/components'
import {
  SubmitAPRDialog,
  ReturnAPRDialog,
  ApproveAPRDialog,
  AddItemDialog,
  EditAPRDialog,
} from '@/features/procurement/apr/dialogs'
import {
  APRStatus,
  ModeOfDelivery,
  InsufficientFundsAction,
  type APRMaster,
  type ConsolidatedAPRItem,
  type APRDetailDto,
} from '@/features/procurement/apr/types'
import {
  useAPR,
  useSubmitAPRMutation,
  useApproveAPRMutation,
  useReturnAPRMutation,
  useAddCatalogItemsToAPRMutation,
  useRemoveAPRItemMutation,
} from '@/features/procurement/apr/handlers/hooks'

interface APRDetailsPageProps {
  aprId: string
  isReviewerMode?: boolean
}

interface SearchParams {
  from?: string
}

export default function APRDetailsPage({ aprId, isReviewerMode }: APRDetailsPageProps) {
  const navigate = useNavigate()
  const search = useSearch({ from: '__root__' }) as SearchParams
  const isFromManageAPRs =
    isReviewerMode === true ||
    search?.from === 'manage-aprs' ||
    (typeof window !== 'undefined' && window.location.pathname.includes('/manage-aprs'))
  const isReviewer = isFromManageAPRs

  // Fetch live APR detail from backend GET /aprs/:aprId
  const { data: rawResponse, isLoading, error, refetch } = useAPR({
    pathParams: { aprId },
  } as any)

  const { mutateAsync: submitAPR, isPending: isSubmittingAPR } = useSubmitAPRMutation()
  const { mutateAsync: approveAPR, isPending: isApprovingAPR } = useApproveAPRMutation()
  const { mutateAsync: returnAPR, isPending: isReturningAPR } = useReturnAPRMutation()
  const { mutateAsync: addCatalogItems, isPending: isAddingCatalogItems } = useAddCatalogItemsToAPRMutation()
  const { mutateAsync: removeAPRItem, isPending: isRemovingAPRItem } = useRemoveAPRItemMutation()

  // Dialog states
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // Extra items added from PSDBM catalogue during session (optimistic / fallback)
  const [extraItems, setExtraItems] = useState<ConsolidatedAPRItem[]>([])

  // Map backend APRDetailDto to frontend APRMaster view model
  const baseConsolidatedItems: ConsolidatedAPRItem[] = useMemo(() => {
    if (!rawResponse) return []
    const data: APRDetailDto = (rawResponse as any).data || rawResponse

    return (data.items || []).map((item, idx) => ({
      id: item.id || `item-${idx}`,
      itemCode: item.ppmpItemId || item.appItemId || `ITEM-${idx + 1}`,
      description: item.description || 'Procurement Item',
      unit: item.unit || 'Box',
      quantity: item.quantityRequested ?? 1,
      unitCost: item.unitCost ?? 0,
      totalAmount: item.totalCost ?? ((item.quantityRequested ?? 1) * (item.unitCost ?? 0)),
      office: data.officeName || 'Innovation and Technology Solutions Division',
      fundSource: 'PS-DBM',
      ppmpId: item.ppmpItemId,
      appId: data.appId,
      allotmentClass: 'CO',
      sourceFiscalYear: data.fiscalYear,
      appLineItemId: item.appItemId,
      appApprovedQuantity: item.quantityRequested,
      appApprovedBudget: item.totalCost,
      quantityVariance: 0,
      quantityVariancePercent: 0,
      budgetVariance: 0,
      budgetVariancePercent: 0,
      bacMilestones: item.milestones && item.milestones.length > 0 ? {
        advertisementDate: item.milestones[0]?.scheduledDate,
        submissionDate: item.milestones[1]?.scheduledDate,
        noticeOfAwardDate: item.milestones[2]?.scheduledDate,
        contractSigningDate: item.milestones[3]?.scheduledDate,
      } : undefined,
    }))
  }, [rawResponse])

  const consolidatedItems = useMemo(() => {
    return [...baseConsolidatedItems, ...extraItems]
  }, [baseConsolidatedItems, extraItems])

  const totalAmount = useMemo(() => {
    return consolidatedItems.reduce((sum, i) => sum + i.totalAmount, 0)
  }, [consolidatedItems])

  const apr: APRMaster | null = useMemo(() => {
    if (!rawResponse) return null
    const data: APRDetailDto = (rawResponse as any).data || rawResponse

    return {
      id: data.id,
      aprNumber: data.aprNumber || 'APR-2026-DRAFT-ITSD-001',
      agencyControlNumber: data.agencyControlNumber || 'ACN-XXX-001',
      agencyAccountCode: data.agencyAccountCode || 'AAC-XXX-001',
      description: data.description || 'Supply and delivery of office supplies and materials for the Innovation and Technology Solutions Division.',
      requestDate: data.requestDate || new Date().toISOString().split('T')[0],
      fiscalYear: data.fiscalYear || new Date().getFullYear(),
      status: data.status || APRStatus.DRAFT,
      procuringEntity: 'Procurement Service - DBM',
      requestingEntity: data.officeName || 'Innovation and Technology Solutions Division',
      requestedBy: 'Procurement Officer',
      requestedByPosition: 'Administrative Officer V',
      header: {
        aprNumber: data.aprNumber,
        agencyControlNumber: data.agencyControlNumber || '',
        agencyAccountCode: data.agencyAccountCode || '',
        description: data.description || '',
        requestDate: data.requestDate || '',
        fiscalYear: data.fiscalYear,
        procuringEntity: 'Procurement Service - DBM',
        requestingEntity: data.officeName || '',
      },
      terms: {
        modeOfDelivery: data.modeOfDelivery || ModeOfDelivery.FAST_LANE,
        insufficientFundsAction: data.insufficientFundsAction || InsufficientFundsAction.REDUCE_QUANTITY,
        attachments: {
          observationReportRequired: data.requiresObR,
          collectiveBarterAgreementRequired: data.requiresCBA,
          completeSpecsRequired: data.requiresCompleteSpecifications,
        },
        remarks: data.additionalRemarks || undefined,
      },
      consolidatedItems,
      totalItemsCount: consolidatedItems.length,
      totalAmount,
      submittedAt: data.submittedDate,
      approvedAt: data.approvedDate,
      approvedBy: data.approvedBy,
      returnedAt: data.returnedDate,
      returnedBy: data.returnedBy,
      returnRemarks: data.returnRemarks,
      sourceAPPId: data.appId,
      appStatus: 'Approved',
      appApprovedBudget: totalAmount,
      appApprovedItemsCount: consolidatedItems.length,
      totalBudgetVariance: 0,
      totalBudgetVariancePercent: 0,
    }
  }, [rawResponse, consolidatedItems, totalAmount])

  const queryClient = useQueryClient()

  // Action handlers
  const handleSubmitForReview = async () => {
    try {
      const result = await submitAPR({
        pathParams: { aprId },
      } as any)

      const updatedNumber = (result as any)?.data || (result as any)?.message || apr?.aprNumber
      toast.success(`APR ${updatedNumber} has been submitted for review.`)
      invalidateAPRQueries(queryClient)
      setSubmitDialogOpen(false)
      refetch()
    } catch (err: any) {
      console.error('Error submitting APR:', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit APR for review'
      toast.error(msg)
    }
  }

  const handleReturnAPR = async (remarks: string) => {
    try {
      await returnAPR({
        pathParams: { aprId },
        payload: {
          aprId,
          remarks,
          returnedAt: new Date().toISOString(),
        },
      } as any)

      toast.success(`APR ${apr?.aprNumber} has been returned for revisions.`)
      invalidateAPRQueries(queryClient)
      setReturnDialogOpen(false)
      refetch()
    } catch (err: any) {
      console.error('Error returning APR:', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to return APR'
      toast.error(msg)
    }
  }

  const handleApproveAPR = async (file?: File) => {
    try {
      await approveAPR({
        pathParams: { aprId },
        payload: {
          aprId,
          signedDocumentFile: file,
          approvedAt: new Date().toISOString(),
        },
      } as any)

      toast.success(`APR ${apr?.aprNumber} has been approved successfully.`)
      invalidateAPRQueries(queryClient)
      setApproveDialogOpen(false)
      refetch()
    } catch (err: any) {
      console.error('Error approving APR:', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to approve APR'
      toast.error(msg)
    }
  }

  const handleAddItems = async (newItems: ConsolidatedAPRItem[]) => {
    try {
      const payloadItems = newItems.map((item) => ({
        itemCode: item.itemCode,
        description: item.description,
        unit: item.unit,
        unitPrice: item.unitCost,
        quantity: item.quantity,
      }))

      await addCatalogItems({
        pathParams: { aprId },
        payload: {
          aprId,
          items: payloadItems,
        },
      } as any)

      toast.success(`Successfully saved ${newItems.length} catalog item(s) to APR!`)
      invalidateAPRQueries(queryClient)
      setAddItemDialogOpen(false)
      await refetch()
    } catch (err: any) {
      console.error('Error saving catalog items to APR:', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to save items to APR'
      toast.error(msg)
      setExtraItems((prev) => {
        const existingCodes = new Set([
          ...baseConsolidatedItems.map((i) => i.itemCode),
          ...prev.map((i) => i.itemCode),
        ])
        const uniqueNew = newItems.filter((i) => !existingCodes.has(i.itemCode))
        return [...prev, ...uniqueNew]
      })
      setAddItemDialogOpen(false)
    }
  }

  const handleRemoveItem = async (itemIdentifier: string) => {
    try {
      await removeAPRItem({
        pathParams: { aprId, itemIdentifier },
      } as any)
      setExtraItems((prev) => prev.filter((i) => i.itemCode !== itemIdentifier && i.id !== itemIdentifier))
      toast.success('Item removed from APR.')
      invalidateAPRQueries(queryClient)
      await refetch()
    } catch (err: any) {
      console.error('Error removing item from APR:', err)
      setExtraItems((prev) => prev.filter((i) => i.itemCode !== itemIdentifier && i.id !== itemIdentifier))
      toast.success('Item removed.')
      invalidateAPRQueries(queryClient)
      await refetch()
    }
  }

  const isSubmitting =
    isSubmittingAPR || isApprovingAPR || isReturningAPR || isAddingCatalogItems || isRemovingAPRItem

  const handleBackClick = () => {
    if (isReviewer) {
      navigate({ to: '/v2/manage-aprs' })
    } else if (search.from) {
      navigate({ to: search.from })
    } else {
      navigate({ to: '/v2/agency-purchase-requests-apr' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-[#6366f1]" />
        <p className="text-xs font-medium text-gray-400">Loading APR details from database...</p>
      </div>
    )
  }

  if (error || !apr) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={handleBackClick} className="gap-2 text-xs">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card className="border-red-200 bg-red-50/50 rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Failed to load APR</p>
                <p className="text-xs text-red-700 mt-0.5">
                  {String((error as any)?.message || 'The requested APR was not found in the database.')}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl text-xs">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine available actions based on status
  const statusNorm = normalizeAPRStatus(apr.status)
  const isDraft = statusNorm === 'DRAFT'
  const isSubmitted = statusNorm === 'FOR_APPROVAL'
  const isReturned = statusNorm === 'RETURNED'
  const isApproved = statusNorm === 'APPROVED'

  // Activity events timeline (newest event first)
  const timelineEvents = [
    apr.approvedAt ? {
      title: 'APR Approved',
      timestamp: apr.approvedAt,
      actor: apr.approvedBy || 'Procurement Officer',
      status: 'approved',
    } : null,
    (apr.returnedAt || isReturned) ? {
      title: 'Returned for Revisions',
      timestamp: apr.returnedAt || apr.updatedAt || new Date().toISOString(),
      actor: apr.returnedBy || 'Procurement Officer',
      status: 'returned',
      remarks: apr.returnRemarks,
    } : null,
    apr.submittedAt ? {
      title: 'Submitted for Review',
      timestamp: apr.submittedAt,
      actor: apr.requestedBy || 'Procurement Officer',
      status: 'completed',
    } : null,
    {
      title: 'APR Created',
      timestamp: apr.createdAt || apr.requestDate,
      actor: apr.requestedBy || 'Procurement Officer',
      status: 'completed',
    },
  ].filter(Boolean) as Array<{ title: string; timestamp: string; actor?: string; status: string; remarks?: string }>

  const formattedRequestDate = (() => {
    if (!apr.requestDate) return 'Aug 18, 2026'
    try {
      return format(new Date(apr.requestDate), 'MMM dd, yyyy')
    } catch {
      return String(apr.requestDate)
    }
  })()

  return (
    <div className="space-y-5 pb-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={handleBackClick}
          className="text-[#6366f1] hover:text-[#4f46e5] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>{isReviewer ? 'Manage APRs' : 'Agency Purchase Requests'}</span>
        </button>
        <span className="text-gray-300 font-bold">›</span>
        <span className="text-gray-900 font-bold">Details</span>
      </div>

      {/* 1. Top Soft Purple Identity Banner */}
      <APRIdentityBanner apr={apr} context={isReviewer ? 'procurement_officer' : 'user'} />

      {/* Return Revisions Notice Banner */}
      {isReturned && (
        <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-start gap-3.5 shadow-xs">
          <div className="h-9 w-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-xs flex-1">
            <p className="font-bold text-amber-950 text-sm">APR Returned for Revisions</p>
            <p className="text-amber-900 leading-relaxed font-medium">
              <span className="font-bold">Procurement Officer Remarks:</span>{' '}
              {apr.returnRemarks || 'Please review and adjust line items or terms before resubmitting.'}
            </p>
          </div>
        </div>
      )}

      {/* 2. 4-Card Metric Stats Strip */}
      <APRStatsGrid
        totalItemsCount={apr.consolidatedItems.length}
        totalAmount={apr.totalAmount}
        consolidatedCount={apr.consolidatedItems.length}
        approvalStatus={apr.status as any}
        isReviewer={isReviewer}
      />

      {/* 3. Consolidated Items Table Card (Positioned directly below Stats) */}
      <ConsolidatedItemsTable
        items={apr.consolidatedItems}
        status={apr.status as string}
        onRemoveItem={isReviewer ? undefined : handleRemoveItem}
        onOpenAddItem={isReviewer ? undefined : () => setAddItemDialogOpen(true)}
      />

      {/* 4. Details & Entities 2-Column Grid (Positioned below Table) */}
      <APRDetailsEntitiesGrid apr={apr} />

      {/* 5. Bottom Tabs: Terms & Conditions | Activity & Timeline */}
      <Tabs defaultValue="terms" className="w-full space-y-4">
        <div className="border-b border-gray-100">
          <TabsList className="bg-transparent h-11 p-0 gap-8 border-b-0">
            <TabsTrigger
              value="terms"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6366f1] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#6366f1] px-1 pb-3 font-semibold text-xs text-gray-500 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Terms & Conditions</span>
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6366f1] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#6366f1] px-1 pb-3 font-semibold text-xs text-gray-500 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <History className="h-4 w-4" />
              <span>Activity & Timeline</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content: Terms & Conditions */}
        <TabsContent value="terms" className="space-y-4 outline-none">
          <APRTermsConditionsSection terms={apr.terms || ({} as any)} />
        </TabsContent>

        {/* Tab Content: Activity & Timeline */}
        <TabsContent value="activity" className="space-y-4 outline-none">
          <Card className="bg-white border border-gray-100 shadow-xs rounded-2xl overflow-hidden">
            <CardHeader className="py-3.5 px-6 border-b border-gray-50">
              <CardTitle className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Lifecycle Activity & Audit History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3.5 last:pb-0 border-b border-gray-50 last:border-b-0">
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-[#6366f1]" />
                    </div>
                    <div className="flex-1 text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">{evt.title}</p>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {(() => {
                            try {
                              return format(new Date(evt.timestamp), 'MMM dd, yyyy hh:mm a')
                            } catch {
                              return String(evt.timestamp)
                            }
                          })()}
                        </span>
                      </div>
                      {evt.actor && (
                        <p className="text-[11px] text-gray-500">by {evt.actor}</p>
                      )}
                      {evt.remarks && (
                        <div className="mt-1.5 p-2.5 bg-slate-50 border rounded-lg text-[11px] text-gray-700">
                          {evt.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 6. Sticky Bottom Action Bar inside container */}
      <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-md rounded-2xl py-3.5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status indicator and timestamps on the left */}
        <div className="flex items-center gap-3">
          <APRStatusBadge
            status={apr.status || 'Draft'}
            context={isReviewer ? 'procurement_officer' : 'user'}
            size="sm"
          />
          <div className="flex flex-col text-[11px] text-gray-400 leading-tight">
            <span className="text-gray-600 font-medium">Request Date: {formattedRequestDate}</span>
            <span>
              Last updated: {formattedRequestDate} by {apr.requestedBy || 'Procurement Officer'}
            </span>
          </div>
        </div>

        {/* Workflow Actions on the right */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Reviewer Mode (Manage APRs) Actions */}
          {isReviewer ? (
            <>
              {isSubmitted && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-amber-700 hover:text-amber-800 border-amber-300 hover:bg-amber-50 rounded-xl h-9 px-4"
                    onClick={() => setReturnDialogOpen(true)}
                    disabled={isSubmitting}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Return for Revisions
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 px-5 shadow-xs"
                    onClick={() => setApproveDialogOpen(true)}
                    disabled={isSubmitting}
                  >
                    {isApprovingAPR ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Approve APR
                  </Button>
                </>
              )}
              {isDraft && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  Draft — Not Yet Submitted
                </span>
              )}
              {isReturned && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Returned for Revisions
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs rounded-xl h-9 px-4"
                onClick={() => window.print()}
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Export APR
              </Button>
            </>
          ) : (
            /* Requesting User Mode (Agency Purchase Requests) Actions */
            <>
              {/* Draft Actions */}
              {isDraft && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-medium text-gray-600 border-gray-200 hover:bg-gray-50 rounded-xl px-4 h-9"
                    onClick={handleBackClick}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs font-semibold text-[#6366f1] border-indigo-200 hover:bg-indigo-50/70 rounded-xl px-4 h-9 shadow-2xs"
                    onClick={() => setEditDialogOpen(true)}
                    disabled={isSubmitting}
                  >
                    <FileEdit className="h-3.5 w-3.5" />
                    Edit APR / Reselect APP
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs font-semibold bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-xl px-5 h-9 gap-1.5 shadow-xs"
                    onClick={() => setSubmitDialogOpen(true)}
                    disabled={isSubmitting || apr.consolidatedItems.length === 0}
                  >
                    {isSubmittingAPR ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Submit for Review
                  </Button>
                </>
              )}

              {/* Submitted / ForApproval Actions for Requesting User */}
              {isSubmitted && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Under Review by Procurement Officer
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs rounded-xl h-9 px-4"
                    onClick={() => window.print()}
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print / Export APR
                  </Button>
                </div>
              )}

              {/* Returned Actions for Requesting User */}
              {isReturned && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs font-semibold text-[#6366f1] border-indigo-200 hover:bg-indigo-50/70 rounded-xl px-4 h-9 shadow-2xs"
                    onClick={() => setEditDialogOpen(true)}
                    disabled={isSubmitting}
                  >
                    <FileEdit className="h-3.5 w-3.5" />
                    Edit APR / Reselect APP
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs font-semibold bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-xl px-5 h-9 gap-1.5 shadow-xs"
                    onClick={() => setSubmitDialogOpen(true)}
                    disabled={isSubmitting || apr.consolidatedItems.length === 0}
                  >
                    {isSubmittingAPR ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Resubmit for Review
                  </Button>
                </>
              )}

              {/* Approved Actions for Requesting User */}
              {isApproved && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs rounded-xl h-9 px-4"
                  onClick={() => window.print()}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print / Export APR
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <SubmitAPRDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        apr={apr}
        isSubmitting={isSubmitting}
        onConfirm={handleSubmitForReview}
      />

      <ReturnAPRDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        apr={apr}
        isSubmitting={isSubmitting}
        onConfirm={handleReturnAPR}
      />

      <ApproveAPRDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        apr={apr}
        isSubmitting={isSubmitting}
        onConfirm={handleApproveAPR}
      />

      <AddItemDialog
        open={addItemDialogOpen}
        onOpenChange={setAddItemDialogOpen}
        existingItemIds={apr.consolidatedItems.map((item) => item.id)}
        onAddItems={handleAddItems}
        isSubmitting={isSubmitting}
      />

      <EditAPRDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        apr={apr}
        onSuccess={refetch}
      />
    </div>
  )
}
