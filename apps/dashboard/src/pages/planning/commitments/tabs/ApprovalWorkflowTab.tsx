import { useMemo } from 'react'
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
} from '@/features/planning/opcr/table/approvalworkflow'
import { OPCR, type CommitmentStatus } from '@/features/planning/opcr/types'
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
  const fiscalYearId = searchParams.fiscalYearId || ''
  const searchQuery = searchParams.searchQuery || ''

  // Build backend filters for server-side Sieve filtering
  // Display all OPCRs under approval workflow / approved (everything except Draft)
  const backendFilters = useMemo(() => {
    const arr: string[] = ['commitmentStatus!=Draft']
    if (fiscalYearId) arr.push(`fiscalYearId==${fiscalYearId}`)
    if (searchQuery) arr.push(`name@=*${searchQuery}*`)
    return arr.join(',')
  }, [fiscalYearId, searchQuery])

  // Fetch OPCRs from API with server-side filtering
  const {
    data: opcrs,
    isLoading,
    refetch: refetchOPCRs,
  } = useOPCRs({
    pathParams: {},
    queryParams: {
      pageNumber,
      pageSize,
      filters: backendFilters,
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
        isApprovalWorkflow={true}
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
      toast.success(`OPCR "${opcr.name}" approved successfully`)
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
          commitmentStatus: 'Returned' as CommitmentStatus,
        },
      })
      toast.success(`OPCR "${opcr.name}" returned for revision`)
      refetchOPCRs()
    } catch (error) {
      toast.error('Failed to return OPCR')
      console.error('Return error:', error)
    }
  }

  const handleSearchChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        searchQuery: value || undefined,
        pageNumber: 1,
      }),
    })
  }

  const handleFiscalYearChange = (fyId: string | null) => {
    navigate({
      search: (prev) => ({
        ...prev,
        fiscalYearId: fyId || undefined,
        pageNumber: 1,
      }),
    })
  }

  const handleResetFilters = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        searchQuery: undefined,
        fiscalYearId: undefined,
        pageNumber: 1,
      }),
    })
  }

  const tableMetaOptions: ApprovalWorkflowTableMeta = {
    onViewDetails: handleViewDetails,
    onApprove: handleApprove,
    onReturn: handleReturn,
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
        fiscalYearId={fiscalYearId}
        onFiscalYearChange={handleFiscalYearChange}
        onSearch={handleSearchChange}
        onResetFilters={handleResetFilters}
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
