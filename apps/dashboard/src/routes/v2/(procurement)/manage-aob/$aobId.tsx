import { createFileRoute } from '@tanstack/react-router'
import { AOBDetailsPage } from '@/features/procurement/aob/components'
import { ApproveAOBDialog } from '@/features/procurement/aob/dialogs/ApproveAOBDialog'
import { mockAOBStore } from '@/features/procurement/aob/utils/mockAOBStore'
import { useNavigate } from '@tanstack/react-router'
import { useMemo, useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { BidMatrix } from '@/features/procurement/aob/types'

// API-Ready Imports (uncomment when API is ready):
// import { createQueryHookFromTemplate } from 'erpez-shared-lib'
// import { getAOBDetailRequest } from '@/features/procurement/aob/handlers/getAOBDetailRequest'
// import { getBidMatrixRequest } from '@/features/procurement/aob/handlers/getBidMatrixRequest'
// const useAOBDetail = createQueryHookFromTemplate(getAOBDetailRequest)
// const useBidMatrix = createQueryHookFromTemplate(getBidMatrixRequest)

export const Route = createFileRoute('/v2/(procurement)/manage-aob/$aobId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    // In a real app, fetch from API:
    // const aobResponse = await fetch(`/api/abstract-of-bids-aob/${params.aobId}`)
    // const aob = await aobResponse.json()
    
    // Using mock store (includes newly created AOBs)
    const aob = mockAOBStore.findById(params.aobId)
    if (!aob) throw new Error('AOB not found')
    return { aob, aobId: params.aobId }
  },
  errorComponent: () => (
    <div className="p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">AOB Not Found</h2>
        <p className="text-gray-600">The requested AOB could not be found.</p>
      </div>
    </div>
  ),
})

function RouteComponent() {
  const { aob, aobId } = Route.useLoaderData()
  const navigate = useNavigate()
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Reset isProcessing when aobId changes to handle back + re-click scenario
  useEffect(() => {
    setIsProcessing(false)
  }, [aobId])

  // ============================================
  // Mock Data Setup
  // (Replace with API hooks when backend is ready)
  // ============================================
  // const { data: aobDetail, isLoading } = useAOBDetail({
  //   pathParams: { id: aobId },
  //   queryParams: {},
  // })
  // const aobData = aobDetail?.aob
  // const bidMatrix = aobDetail?.bidMatrix

  // ============================================
  // Current Mock Data Implementation
  // ============================================
  const bidMatrix = useMemo(() => {
    return mockAOBStore.getBidMatrix(aobId) as BidMatrix | null
  }, [aobId])

  // ============================================
  // Event Handlers
  // ============================================
  
  const handleBack = () => {
    navigate({ to: '/v2/manage-aob' })
  }

  // NOTE: onDelete and onSubmitForApproval handlers are not needed here.
  // When isAdmin={true}, AOBDetailsPage conditionally hides the Delete and
  // Submit buttons (only visible for DRAFT status && !isAdmin), so these
  // handlers would never be called. Passing undefined avoids misleading code.

  const handleApprove = async () => {
    // Open the approval dialog with PDF upload and signature
    setIsApproveDialogOpen(true)
  }

  const handleApproveSubmit = async (data: {
    approvalDocument: File
    approvalRemarks?: string
    approvedBy: string
  }) => {
    try {
      setIsProcessing(true)
      
      // TODO: Call API to approve AOB with the provided document
      // const response = await approveAOB(aobId, data)
      
      // Mock approval - validate form data and update AOB status
      console.log('Approving AOB with validated form data:', {
        aobId,
        approvedBy: data.approvedBy,
        remarks: data.approvalRemarks,
        documentName: data.approvalDocument.name,
        documentSize: `${(data.approvalDocument.size / 1024).toFixed(1)} KB`,
      })
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Update mock AOB status to APPROVED
      const updatedAOB = mockAOBStore.approve(aobId, data.approvedBy)
      
      console.log('AOB approved successfully:', updatedAOB.status)
      
      toast.success('AOB approved successfully')
      setIsApproveDialogOpen(false)
      
      // Refresh data or navigate back
      // navigate({ to: '/v2/manage-aob' })
    } catch (error) {
      toast.error('Failed to approve AOB')
      console.error('Approval error:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4 p-6">
      <AOBDetailsPage
        aob={aob}
        bidMatrix={bidMatrix}
        onBack={handleBack}
        onApprove={handleApprove}
        isProcessing={isProcessing}
        isAdmin={true}
      />

      <ApproveAOBDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        aob={aob}
        onApprove={handleApproveSubmit}
      />
    </div>
  )
}
