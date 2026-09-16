import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AOBDetailsPage } from '@/features/procurement/aob/components'
import { ApproveAOBDialog } from '@/features/procurement/aob/dialogs/ApproveAOBDialog'
import { useState } from 'react'
import { toast } from 'sonner'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { getAOBDetailRequest } from '@/features/procurement/aob/handlers/getAOBDetailRequest'
import { getBidMatrixRequest } from '@/features/procurement/aob/handlers/getBidMatrixRequest'
import { deleteAOBRequest } from '@/features/procurement/aob/handlers/deleteAOBRequest'
import { submitAOBRequest } from '@/features/procurement/aob/handlers/submitAOBRequest'
import { approveAOBRequest } from '@/features/procurement/aob/handlers/approveAOBRequest'
import { getAOBListRequest } from '@/features/procurement/aob/handlers/getAOBListRequest'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Loader2 } from 'lucide-react'

const useAOBDetail = createQueryHookFromTemplate(getAOBDetailRequest)
const useBidMatrix = createQueryHookFromTemplate(getBidMatrixRequest)
const useDeleteAOB = createMutationHookFromTemplate(deleteAOBRequest)
const useSubmitAOB = createMutationHookFromTemplate(submitAOBRequest)
const useApproveAOB = createMutationHookFromTemplate(approveAOBRequest)

export const Route = createFileRoute('/v2/(procurement)/abstract-of-bids-aob/$aobId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { aobId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)

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
  const { mutateAsync: deleteAOB } = useDeleteAOB()
  const { mutateAsync: submitAOB } = useSubmitAOB()
  const { mutateAsync: approveAOB } = useApproveAOB()

  const handleBack = () => {
    navigate({ to: '/v2/abstract-of-bids-aob' })
  }

  const handleDelete = async () => {
    try {
      setIsProcessing(true)
      await deleteAOB({
        pathParams: { id: aobId },
      })

      void queryClient.invalidateQueries({
        queryKey: [getAOBListRequest.endpoint],
      })

      toast.success('AOB deleted successfully')
      navigate({ to: '/v2/abstract-of-bids-aob' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to delete AOB'
      toast.error(msg)
      console.error('Delete error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmitForApproval = async () => {
    try {
      setIsProcessing(true)
      await submitAOB({
        pathParams: { id: aobId },
        payload: {},
      })

      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some(
            (k) => typeof k === 'string' && k.includes(aobId)
          ),
      })
      void queryClient.invalidateQueries({
        queryKey: [`/aobs/${aobId}`],
      })
      void queryClient.invalidateQueries({
        queryKey: [`/aobs/${aobId}/matrix`],
      })
      void queryClient.invalidateQueries({
        queryKey: [getAOBListRequest.endpoint],
      })

      toast.success('AOB submitted for approval')
      navigate({ to: '/v2/abstract-of-bids-aob' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to submit AOB for approval'
      toast.error(msg)
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
      await approveAOB({
        pathParams: { id: aobId },
        payload: {
          approvedBy: data.approvedBy,
          remarks: data.approvalRemarks,
        },
      })

      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some(
            (k) => typeof k === 'string' && k.includes(aobId)
          ),
      })
      void queryClient.invalidateQueries({
        queryKey: [`/aobs/${aobId}`],
      })
      void queryClient.invalidateQueries({
        queryKey: [`/aobs/${aobId}/matrix`],
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

  const handleExport = () => {
    toast.info('Export functionality triggered')
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
            Back to AOB List
          </Button>
        </div>
      </div>
    )
  }

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Aob.Manage}
      message="You do not have permission to view this Abstract of Bids (AOB)."
    >
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
    </RoutePermissionGuard>
  )
}
