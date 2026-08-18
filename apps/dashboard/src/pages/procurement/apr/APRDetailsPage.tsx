/**
 * APR Details Page
 * Displays complete APR information: header hierarchy, compact stats, refined items, modernized terms, and sticky action bar
 */

import { useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  ArrowLeft,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  RotateCcw,
  Printer,
  History,
  FileCheck2,
  Package,
} from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  APRHeaderSection,
  APRStatsGrid,
  ConsolidatedItemsTable,
  APRTermsConditionsSection,
} from '@/features/procurement/apr/components'
import {
  SubmitAPRDialog,
  ReturnAPRDialog,
  ApproveAPRDialog,
  AddItemDialog,
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
} from '@/features/procurement/apr/handlers/hooks'

interface APRDetailsPageProps {
  aprId: string
}

interface SearchParams {
  from?: string
}

export default function APRDetailsPage({ aprId }: APRDetailsPageProps) {
  const navigate = useNavigate()
  const search = useSearch({ from: '__root__' }) as SearchParams

  // Fetch live APR detail from backend GET /aprs/:aprId
  const { data: rawResponse, isLoading, error, refetch } = useAPR({
    pathParams: { aprId },
  } as any)

  const { mutateAsync: submitAPR, isPending: isSubmittingAPR } = useSubmitAPRMutation()
  const { mutateAsync: approveAPR, isPending: isApprovingAPR } = useApproveAPRMutation()
  const { mutateAsync: returnAPR, isPending: isReturningAPR } = useReturnAPRMutation()

  // Dialog states
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false)

  // Map backend APRDetailDto to frontend APRMaster view model
  const apr: APRMaster | null = useMemo(() => {
    if (!rawResponse) return null
    const data: APRDetailDto = (rawResponse as any).data || rawResponse

    const consolidatedItems: ConsolidatedAPRItem[] = (data.items || []).map((item, idx) => ({
      id: item.id || `item-${idx}`,
      itemCode: item.ppmpItemId || `ITEM-${idx + 1}`,
      description: item.description || 'Procurement Item',
      unit: item.unit || 'lot',
      quantity: item.quantityRequested ?? 1,
      unitCost: item.unitCost ?? 0,
      totalAmount: item.totalCost ?? ((item.quantityRequested ?? 1) * (item.unitCost ?? 0)),
      office: data.officeName || '',
      fundSource: '',
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

    return {
      id: data.id,
      aprNumber: data.aprNumber || '—',
      agencyControlNumber: data.agencyControlNumber || '',
      agencyAccountCode: data.agencyAccountCode || '',
      description: data.description || '',
      requestDate: data.requestDate || new Date().toISOString().split('T')[0],
      fiscalYear: data.fiscalYear || new Date().getFullYear(),
      status: data.status || APRStatus.DRAFT,
      procuringEntity: 'Procurement Service - DBM',
      requestingEntity: data.officeName || 'Agency Office',
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
      totalAmount: data.totalAmount ?? consolidatedItems.reduce((sum, i) => sum + i.totalAmount, 0),
      submittedAt: data.submittedDate,
      approvedAt: data.approvedDate,
      sourceAPPId: data.appId,
      appStatus: 'Approved',
      appApprovedBudget: data.totalAmount,
      appApprovedItemsCount: consolidatedItems.length,
      totalBudgetVariance: 0,
      totalBudgetVariancePercent: 0,
    }
  }, [rawResponse])

  // Action handlers
  const handleSubmitForReview = async () => {
    try {
      const result = await submitAPR({
        pathParams: { aprId },
      } as any)

      const updatedNumber = (result as any)?.data || (result as any)?.message || apr?.aprNumber
      toast.success(`APR ${updatedNumber} has been submitted for review.`)
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
      setApproveDialogOpen(false)
      refetch()
    } catch (err: any) {
      console.error('Error approving APR:', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to approve APR'
      toast.error(msg)
    }
  }

  const handleAddItems = async (newItems: ConsolidatedAPRItem[]) => {
    toast.success(`${newItems.length} item(s) selected.`)
    setAddItemDialogOpen(false)
  }

  const isSubmitting = isSubmittingAPR || isApprovingAPR || isReturningAPR

  const handleBackClick = () => {
    if (search.from === 'manage-aprs') {
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
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">Loading APR details from database...</p>
      </div>
    )
  }

  if (error || !apr) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={handleBackClick} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card className="border-red-200 bg-red-50/50">
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
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine available actions based on status
  const statusLower = (apr.status || '').toLowerCase()
  const isDraft = statusLower === 'draft'
  const isSubmitted = statusLower === 'forapproval' || statusLower === 'submitted'
  const isReturned = statusLower === 'returned'
  const isApproved = statusLower === 'approved'

  // Activity events timeline
  const timelineEvents = [
    {
      title: 'APR Created',
      timestamp: apr.requestDate,
      actor: apr.requestedBy || 'Procurement Officer',
      status: 'completed',
    },
    apr.submittedAt ? {
      title: 'Submitted for Review',
      timestamp: apr.submittedAt,
      actor: apr.requestedBy,
      status: 'completed',
    } : null,
    apr.returnedAt ? {
      title: 'Returned for Revisions',
      timestamp: apr.returnedAt,
      actor: apr.returnedBy,
      status: 'returned',
      remarks: apr.terms?.remarks,
    } : null,
    apr.approvedAt ? {
      title: 'APR Approved',
      timestamp: apr.approvedAt,
      actor: apr.approvedBy,
      status: 'approved',
    } : null,
  ].filter(Boolean) as Array<{ title: string; timestamp: string; actor?: string; status: string; remarks?: string }>

  return (
    <div className="space-y-6 pb-28">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className="text-xs text-muted-foreground hover:text-gray-900 gap-1.5 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {search.from === 'manage-aprs' ? 'Agency Purchase Requests / Manage APRs' : 'Agency Purchase Requests'}
        </Button>
      </div>

      {/* APR Identity & Summary Header */}
      <APRHeaderSection apr={apr} />

      {/* Compact High-Density Stats Strip */}
      <APRStatsGrid
        totalItemsCount={apr.consolidatedItems.length}
        totalAmount={apr.totalAmount}
        consolidatedCount={apr.consolidatedItems.length}
        approvalStatus={apr.status as any}
      />

      {/* Strong Tabs: Items, Terms & Conditions, Activity & Timeline */}
      <Tabs defaultValue="items" className="w-full space-y-4">
        <div className="border-b">
          <TabsList className="bg-transparent h-10 p-0 gap-6 border-b-0">
            <TabsTrigger
              value="items"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-2 pb-2.5 font-medium text-xs text-muted-foreground flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="h-3.5 w-3.5" />
              <span>Items</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {apr.consolidatedItems.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="terms"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-2 pb-2.5 font-medium text-xs text-muted-foreground flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>Terms & Conditions</span>
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-2 pb-2.5 font-medium text-xs text-muted-foreground flex items-center gap-1.5 cursor-pointer"
            >
              <History className="h-3.5 w-3.5" />
              <span>Activity & Timeline</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Consolidated Items Table */}
        <TabsContent value="items" className="space-y-4 outline-none">
          <ConsolidatedItemsTable
            items={apr.consolidatedItems}
            status={apr.status as string}
            onOpenAddItem={() => setAddItemDialogOpen(true)}
          />
        </TabsContent>

        {/* Tab 2: Modernized Terms & Conditions */}
        <TabsContent value="terms" className="space-y-4 outline-none">
          <APRTermsConditionsSection terms={apr.terms || ({} as any)} />
        </TabsContent>

        {/* Tab 3: Activity & Timeline */}
        <TabsContent value="activity" className="space-y-4 outline-none">
          <Card className="border shadow-xs bg-white">
            <CardHeader className="py-3 px-5 border-b bg-slate-50/50">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lifecycle Activity & Audit History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-b-0">
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">{evt.title}</p>
                        <span className="text-[11px] text-muted-foreground font-mono">
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
                        <p className="text-[11px] text-muted-foreground">by {evt.actor}</p>
                      )}
                      {evt.remarks && (
                        <div className="mt-1.5 p-2 bg-slate-50 border rounded text-[11px] text-gray-700">
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

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/95 backdrop-blur-md border-t py-3 px-6 z-30 shadow-lg flex items-center justify-between gap-4">
        {/* Status indicator on the left */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs font-mono px-2 py-0.5">
            {apr.status || 'Draft'}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Request Date: {apr.requestDate}
          </span>
        </div>

        {/* Status/Role-aware Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Draft Actions */}
          {isDraft && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setAddItemDialogOpen(true)}
                disabled={isSubmitting}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </Button>
              <Button
                size="sm"
                className="gap-1.5 text-xs"
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

          {/* Submitted / ForApproval Actions */}
          {isSubmitted && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-amber-700 hover:text-amber-800 border-amber-300 hover:bg-amber-50"
                onClick={() => setReturnDialogOpen(true)}
                disabled={isSubmitting}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Return for Revisions
              </Button>
              <Button
                size="sm"
                className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
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

          {/* Returned Actions */}
          {isReturned && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setAddItemDialogOpen(true)}
                disabled={isSubmitting}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </Button>
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setSubmitDialogOpen(true)}
                disabled={isSubmitting}
              >
                <Send className="h-3.5 w-3.5" />
                Resubmit for Review
              </Button>
            </>
          )}

          {/* Approved Actions */}
          {isApproved && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => window.print()}
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Export APR
            </Button>
          )}
        </div>
      </div>

      {/* Action Dialogs */}
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
    </div>
  )
}
