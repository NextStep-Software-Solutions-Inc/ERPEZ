import { useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import { useQueryClient } from 'erpez-shared-lib'
import { Users } from 'lucide-react'
import { PageContainerDashtail } from '@/components/v2'
import {
  EditSignatoryDialog,
  DeleteSignatoryDialog,
  CreateSignatoryDialog,
} from '../dialogs'
import { DataTable } from '../components/table/data-table'
import { SignatoryMatrixToolbar } from '../components/SignatoryMatrixToolbar'
import {
  currentPageAtom,
  pageSizeAtom,
  filterFiscalYearAtom,
  filterOrganizationAtom,
} from '../atoms/signatoryMatrixAtoms'
import { createColumns } from '../components/table/columns'
import type { User } from '@/lib/fiscal-year-and-policies/types'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getFiscalYearsRequest } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import { getPersonnelPositionsRequest } from '@/components/features/planning/organizational-structure/handlers/getPersonnelPositionsRequest'

import { getWorkflowMatricesRequest } from '../handlers/getWorkflowMatricesRequest'
const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
const usePersonnelPositions = createQueryHookFromTemplate(
  getPersonnelPositionsRequest,
)
const useWorkflowMatrices = createQueryHookFromTemplate(
  getWorkflowMatricesRequest,
)
/**
 * Workflow Matrices Page Component
 * Manages approval routing for workflow matrix assignments
 */
function WorkflowMatricesPage({ users: overrideUsers }: { users?: User[] }) {
  const queryClient = useQueryClient()

  // Fetch fiscal years
  const { data: fiscalYearsData } = useFiscalYears({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 100,
    },
  })

  const { data: personnelPositionsData } = usePersonnelPositions({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 100,
    },
  })

  // State management
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom)
  const [pageSize, setPageSize] = useAtom(pageSizeAtom)
  const [filterFiscalYear] = useAtom(filterFiscalYearAtom)
  const [filterOrganization] = useAtom(filterOrganizationAtom)

  // Build API filter string (null-based filters)
  const buildFilters = useCallback(() => {
    const filters: string[] = []

    if (filterFiscalYear) {
      filters.push(`fiscalYearId==${filterFiscalYear}`)
    }

    if (filterOrganization) {
      filters.push(`organizationId==${filterOrganization}`)
    }

    return filters.length > 0 ? filters.join(' and ') : undefined
  }, [filterFiscalYear, filterOrganization])

  // Fetch signatories
  const {
    data: response,
    isLoading,
    refetch,
  } = useWorkflowMatrices({
    pathParams: {},
    queryParams: {
      filters: buildFilters(),
      pageNumber: currentPage,
      pageSize,
    },
  })

  const personnelPositions = personnelPositionsData?.data || []
  const mappedUsers = useMemo<User[]>(() => {
    if (overrideUsers) {
      return overrideUsers
    }

    return personnelPositions.map((entry) => ({
      id: entry.user.id,
      name:
        entry.user.fullName ||
        [
          entry.user.firstName,
          entry.user.middleName,
          entry.user.lastName,
          entry.user.nameExtension,
        ]
          .filter(Boolean)
          .join(' '),
      department:
        entry.user.officeName || entry.position.officeName || 'Unknown Office',
      position:
        entry.positionTitle ||
        entry.position.title ||
        entry.position.functionalTitle ||
        entry.user.employmentStatus ||
        'Unknown',
    }))
  }, [overrideUsers, personnelPositions])

  const totalPages = useMemo(() => response?.totalPageNumber || 1, [response])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleSuccess = () => {
    void queryClient.invalidateQueries({
      predicate: (query) =>
        typeof query.queryKey[0] === 'string' &&
        query.queryKey[0].includes('/workflow-matrices'),
    })
    void refetch()
  }

  // Create columns with context props
  const tableColumns = useMemo(
    () =>
      createColumns({
        availableUsers: mappedUsers,
        onSuccess: handleSuccess,
      }),
    [mappedUsers, handleSuccess],
  )

  const fiscalYears = fiscalYearsData?.data || []

  return (
    <PageContainerDashtail
      title="Workflow Matrices"
      titleIcon={<Users className="h-6 w-6 text-blue-600" />}
      description="Assign approval authorities to workflow routes for a specific fiscal year"
      headerSize="small"
      containerClassName="p-4 bg-white"
    >
      <div className="space-y-6 pt-6">
        {/* Toolbar */}
        <SignatoryMatrixToolbar fiscalYears={fiscalYears} />

        {/* Data Table */}
        <DataTable
          columns={tableColumns}
          data={response?.data || []}
          isLoading={isLoading}
          pageCount={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Dialogs */}
      <EditSignatoryDialog onSuccess={handleSuccess} />
      <CreateSignatoryDialog onSuccess={handleSuccess} />
      <DeleteSignatoryDialog onSuccess={handleSuccess} />
    </PageContainerDashtail>
  )
}

export default WorkflowMatricesPage
