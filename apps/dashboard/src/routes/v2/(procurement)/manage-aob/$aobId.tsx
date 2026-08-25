import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AOBDetailsPage } from '@/features/procurement/aob/components'
import { ApproveAOBDialog } from '@/features/procurement/aob/dialogs/ApproveAOBDialog'
import { ReturnAOBDialog, type ReturnReason } from '@/features/procurement/aob/dialogs/ReturnAOBDialog'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { getAOBDetailRequest } from '@/features/procurement/aob/handlers/getAOBDetailRequest'
import { getBidMatrixRequest } from '@/features/procurement/aob/handlers/getBidMatrixRequest'
import { approveAOBRequest } from '@/features/procurement/aob/handlers/approveAOBRequest'
import { returnAOBRequest } from '@/features/procurement/aob/handlers/returnAOBRequest'
import { getAOBListRequest } from '@/features/procurement/aob/handlers/getAOBListRequest'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Loader2 } from 'lucide-react'

const useAOBDetail = createQueryHookFromTemplate(getAOBDetailRequest)
const useBidMatrix = createQueryHookFromTemplate(getBidMatrixRequest)
const useApproveAOB = createMutationHookFromTemplate(approveAOBRequest)
const useReturnAOB = createMutationHookFromTemplate(returnAOBRequest)

export const Route = createFileRoute('/v2/(procurement)/manage-aob/$aobId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { aobId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch live AOB details
  const {
    data: aob,
    isLoading: isAobLoading,
    error: aobError,
  } = useAOBDetail({
    pathParams: { id: aobId },
  })

  // Fetch live Bid Matrix
  const {
    data: bidMatrix,
    isLoading: isMatrixLoading,
  } = useBidMatrix({
    pathParams: { aobId },
  })

  // Mutations
  const { mutateAsync: approveAOB } = useApproveAOB()
  const { mutateAsync: returnAOB } = useReturnAOB()

  const handleBack = () => {
    navigate({ to: '/v2/manage-aob' })
  }

  const handleApprove = () => {
    setIsApproveDialogOpen(true)
  }

  const handleReturn = () => {
    setIsReturnDialogOpen(true)
  }

  const handleApproveSubmit = async (data: {
    approvalDocument: File
    approvalRemarks?: string
    approvedBy: string
  }) => {
    try {
      setIsProcessing(true)
      await approveAOB({
        pathParams: { id: aobId },
        payload: {
          approvedBy: data.approvedBy,
          remarks: data.approvalRemarks,
        },
      })

      void queryClient.invalidateQueries({
        queryKey: [getAOBDetailRequest.endpoint, aobId],
      })
      void queryClient.invalidateQueries({
        queryKey: [getBidMatrixRequest.endpoint, aobId],
      })
      void queryClient.invalidateQueries({
        queryKey: [getAOBListRequest.endpoint],
      })

      toast.success('AOB approved successfully')
      setIsApproveDialogOpen(false)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to approve AOB'
      toast.error(msg)
      console.error('Approval error:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReturnSubmit = async (data: {
    reason: ReturnReason
    remarks: string
  }) => {
    try {
      setIsProcessing(true)
      await returnAOB({
        pathParams: { id: aobId },
        payload: {
          remarks: `[${data.reason}] ${data.remarks}`,
        },
      })

      void queryClient.invalidateQueries({
        queryKey: [getAOBDetailRequest.endpoint, aobId],
      })
      void queryClient.invalidateQueries({
        queryKey: [getBidMatrixRequest.endpoint, aobId],
      })
      void queryClient.invalidateQueries({
        queryKey: [getAOBListRequest.endpoint],
      })

      toast.success('AOB returned to BAC Secretariat')
      setIsReturnDialogOpen(false)
      navigate({ to: '/v2/manage-aob' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to return AOB'
      toast.error(msg)
      console.error('Return error:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  if (isAobLoading || isMatrixLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading Abstract of Bids details...</p>
      </div>
    )
  }

  if (aobError || !aob) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-destructive mb-2">AOB Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The requested AOB could not be found or you do not have permission to view it.
          </p>
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Manage AOB
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      <AOBDetailsPage
        aob={aob}
        bidMatrix={bidMatrix}
        onBack={handleBack}
        onApprove={handleApprove}
        onReturn={handleReturn}
        isProcessing={isProcessing}
        isAdmin={true}
      />

      <ApproveAOBDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        aob={aob}
        onApprove={handleApproveSubmit}
      />

      <ReturnAOBDialog
        open={isReturnDialogOpen}
        onOpenChange={setIsReturnDialogOpen}
        aob={aob}
        onReturn={handleReturnSubmit}
      />
    </div>
  )
}
