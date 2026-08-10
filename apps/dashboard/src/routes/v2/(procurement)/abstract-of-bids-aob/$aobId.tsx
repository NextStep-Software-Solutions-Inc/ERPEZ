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

export const Route = createFileRoute('/v2/(procurement)/abstract-of-bids-aob/$aobId')({
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
  const [isProcessing, setIsProcessing] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)

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
    navigate({ to: '/v2/abstract-of-bids-aob' })
  }

  const handleDelete = async () => {
    try {
      setIsProcessing(true)
      
      // TODO: Call API to delete AOB
      // const response await deleteAOB(aobId)
      
      // Mock delete
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // TODO: Update mock store to support deletion
      // mockAOBStore.delete(aobId)
      
      toast.success('AOB deleted successfully')
      console.log('Delete AOB:', aobId)
      
      // Navigate back to list
      navigate({ to: '/v2/abstract-of-bids-aob' })
    } catch (error) {
      toast.error('Failed to delete AOB')
      console.error('Delete error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmitForApproval = async () => {
    try {
      setIsProcessing(true)
      
      // TODO: Call API to submit AOB for approval
      // const response = await submitAOBForApproval(aobId)
      
      // Mock submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update mock AOB status
      mockAOBStore.submit(aobId)
      
      toast.success('AOB submitted for approval')
      console.log('Submit for approval AOB:', aobId)
      
      // Navigate back to list
      navigate({ to: '/v2/abstract-of-bids-aob' })
    } catch (error) {
      toast.error('Failed to submit AOB for approval')
      console.error('Submit error:', error)
    } finally {
      setIsProcessing(false)
    }
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
      
      // Mock approval with document
      console.log('Approving AOB with document:', {
        aobId,
        approvedBy: data.approvedBy,
        remarks: data.approvalRemarks,
        documentName: data.approvalDocument.name,
      })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('AOB approved successfully')
      setIsApproveDialogOpen(false)
      
      // Refresh data or navigate back
      // navigate({ to: '/v2/(procurement)/abstract-of-bids-aob/' })
    } catch (error) {
      toast.error('Failed to approve AOB')
      console.error('Approval error:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async () => {
    try {
      setIsProcessing(true)
      
      // TODO: Call API to export AOB
      // const response = await exportAOB(aobId, format)
      
      // Mock export
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('AOB exported successfully')
      console.log('Export AOB:', aobId)
    } catch (error) {
      toast.error('Failed to export AOB')
      console.error('Export error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="p-6">
      <AOBDetailsPage
        aob={aob}
        bidMatrix={bidMatrix}
        onBack={handleBack}
        onDelete={handleDelete}
        onSubmitForApproval={handleSubmitForApproval}
        onExport={handleExport}
        isProcessing={isProcessing}
        isAdmin={false}
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
