/**
 * APR Details Page
 * Displays complete APR information: header, items, timeline, and actions from live backend API
 */

import { useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { ArrowLeft, Plus, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  APRHeaderSection,
  APRStatsGrid,
  ConsolidatedItemsTable,
  APRTermsConditionsSection,
  APRActionsSection,
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
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-gray-500">Loading APR details from database...</p>
      </div>
    )
  }

  if (error || !apr) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" onClick={handleBackClick} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Failed to load APR</p>
                <p className="text-sm">{String((error as any)?.message || 'The requested APR was not found in the database.')}</p>
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
  const canSubmitForReview = statusLower === 'draft'
  const canReturn = statusLower === 'forapproval' || statusLower === 'submitted'
  const canApprove = statusLower === 'forapproval' || statusLower === 'submitted'
  const canAddItems = statusLower === 'draft' || statusLower === 'returned'

  return (
    <div className="space-y-6 pb-8">
      {/* Header Navigation */}
      <div className="sticky top-0 bg-white border-b z-40 pt-6 -mx-6 px-6 pb-4 flex items-center justify-between">
        <Button variant="ghost" onClick={handleBackClick}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {search.from === 'manage-aprs' ? 'Back to Manage APRs' : 'Back to APRs'}
        </Button>
        <div className="text-xs text-muted-foreground font-mono">
          ID: {apr.id}
        </div>
      </div>

      {/* APR Header Section */}
      <div>
        <APRHeaderSection apr={apr} />
      </div>

      {/* APR Stats */}
      <div>
        <APRStatsGrid
          totalItemsCount={apr.consolidatedItems.length}
          totalAmount={apr.totalAmount}
          consolidatedCount={apr.consolidatedItems.length}
          approvalStatus={apr.status as any}
        />
      </div>

      {/* Tabs: Items, Terms, Actions */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">Items ({apr.consolidatedItems.length})</TabsTrigger>
          <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Consolidated Items</h3>
            {canAddItems && (
              <Button 
                size="sm" 
                className="gap-2"
                onClick={() => setAddItemDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Item from Catalog
              </Button>
            )}
          </div>
          <ConsolidatedItemsTable items={apr.consolidatedItems} status={apr.status as string} />
        </TabsContent>

        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-4">
          <APRTermsConditionsSection terms={apr.terms || {} as any} />
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <APRActionsSection
            apr={apr}
            canSubmitForReview={canSubmitForReview}
            canReturn={canReturn}
            canApprove={canApprove}
            isSubmitting={isSubmitting}
            onSubmit={() => setSubmitDialogOpen(true)}
            onReturn={() => setReturnDialogOpen(true)}
            onApprove={() => setApproveDialogOpen(true)}
          />
        </TabsContent>
      </Tabs>

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
    </div>
  )
}
