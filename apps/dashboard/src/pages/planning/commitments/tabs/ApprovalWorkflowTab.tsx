import { Loader2 } from 'lucide-react'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import OPCRDetailPage from './OPCRDetailPage'
import { getOPCRsRequest } from '@/features/planning/opcr/handlers/getOPCRsRequest'
import { updateCommitmentStatusRequest } from '@/features/planning/opcr/handlers/updateCommitmentStatusRequest'
import {
  DataTable,
  columns,
  type ApprovalWorkflowTableMeta,
  type CommitmentStatus,
} from '@/features/planning/opcr/table/approvalworkflow'
import { OPCR } from '@/features/planning/opcr/types'
import { toast } from 'sonner'
import { useNavigate, useSearch } from '@tanstack/react-router'

const useOPCRs = createQueryHookFromTemplate(getOPCRsRequest)
const useUpdateCommitmentStatus = createMutationHookFromTemplate(
  updateCommitmentStatusRequest,
)

/**
 * Approval Workflow Tab Component
 * Displays OPCR approval workflows and their statuses
 */
export default function ApprovalWorkflowTab() {
  const navigate = useNavigate({ from: '/v2/commitments' })
  const searchParams = useSearch({ from: '/v2/commitments/' })

  const pageNumber = searchParams.pageNumber || 1
  const pageSize = searchParams.pageSize || 25

  // Fetch OPCRs from API with optional server-side filtering
  const {
    data: opcrs,
    isLoading,
    refetch: refetchOPCRs,
  } = useOPCRs({
    pathParams: {},
    queryParams: {
      pageNumber,
      pageSize,
    },
  })

  // Update commitment status mutation
  const { mutateAsync: updateCommitmentStatus, isPending: isUpdating } =
    useUpdateCommitmentStatus()

  if (isLoading)
    return (
      <div className="flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )

  const { opcrId } = searchParams

  // Level 1: OPCR Detail View (when opcrId set)
  if (opcrId) {
    return (
      <OPCRDetailPage
        opcrId={opcrId}
        onBack={() => {
          window.history.back()
        }}
      />
    )
  }

  const handleViewDetails = (opcr: OPCR) => {
    navigate({
      search: (prev) => ({
        ...prev,
        opcrId: opcr.id,
        tab: 'approvalWorkflow',
      }),
    })
  }

  const handleApprove = async (opcr: OPCR) => {
    try {
      await updateCommitmentStatus({
        pathParams: { id: opcr.id },
        queryParams: {},
        payload: {
          commitmentStatus: 'Approved' as CommitmentStatus,
        },
      })
      toast.success('OPCR approved successfully')
      refetchOPCRs()
    } catch (error) {
      toast.error('Failed to approve OPCR')
      console.error('Approve error:', error)
    }
  }

  const handleReturn = async (opcr: OPCR) => {
    try {
      await updateCommitmentStatus({
        pathParams: { id: opcr.id },
        queryParams: {},
        payload: {
          commitmentStatus: 'Rejected' as CommitmentStatus,
        },
      })
      toast.success('OPCR returned successfully')
      refetchOPCRs()
    } catch (error) {
      toast.error('Failed to return OPCR')
      console.error('Return error:', error)
    }
  }

  const handleGenerate = async (opcr: OPCR) => {
    try {
      await updateCommitmentStatus({
        pathParams: { id: opcr.id },
        queryParams: {},
        payload: {
          commitmentStatus: 'Submitted' as CommitmentStatus,
        },
      })
      toast.success('OPCR generated and submitted successfully')
      refetchOPCRs()
    } catch (error) {
      toast.error('Failed to generate OPCR')
      console.error('Generate error:', error)
    }
  }
  const handleDraft = async (opcr: OPCR) => {
    try {
      await updateCommitmentStatus({
        pathParams: { id: opcr.id },
        queryParams: {},
        payload: {
          commitmentStatus: 'Draft' as CommitmentStatus,
        },
      })
      toast.success('OPCR saved as draft successfully')
      refetchOPCRs()
    } catch (error) {
      toast.error('Failed to save OPCR as draft')
      console.error('Draft error:', error)
    }
  }

  const tableMetaOptions: ApprovalWorkflowTableMeta = {
    onViewDetails: handleViewDetails,
    onApprove: handleApprove,
    onReturn: handleReturn,
    onGenerate: handleGenerate,
    onDraft: handleDraft,
    isUpdating,
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">OPCR Approval Workflow List</h2>
        <p className="text-sm text-muted-foreground">
          Review and approve OPCR submissions from different offices
        </p>
      </div>
      <DataTable
        columns={columns}
        data={opcrs?.data || []}
        isLoading={isLoading || isUpdating}
        showToolbar={true}
        meta={tableMetaOptions}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPageNumber={opcrs?.totalPageNumber ?? 1}
        totalRows={opcrs?.totalRows ?? 0}
        onPageChange={(newPageNumber) => {
          navigate({
            search: (prev) => ({
              ...prev,
              pageNumber: newPageNumber,
            }),
          })
        }}
        onPageSizeChange={(newPageSize) => {
          navigate({
            search: (prev) => ({
              ...prev,
              pageSize: newPageSize,
              pageNumber: 1,
            }),
          })
        }}
      />
    </div>
  )
}
