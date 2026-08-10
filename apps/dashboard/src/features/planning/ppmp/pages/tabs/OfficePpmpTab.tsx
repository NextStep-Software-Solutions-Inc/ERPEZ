import { useMemo, useState } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Skeleton } from '@/components/ui/skeleton'
import { PPMPState } from '../../types'
import { PpmpManagementOverview } from '../../components'
import {
  CreatePpmpDialog,
  DeletePpmpDialog,
  UpdatePpmpDialog,
} from '../../dialogs'
import { getPPMPsRequest } from '../../handlers/getPpmpsRequest'
import { mockLineItemBudgets, mockPpmpDatabase } from '../../data/mockPpmpData'
import type { PPMPManagementSearch } from '@/routes/v2/ppmp/constants'
import { DataTable } from '../../tables/office-level-table/data-table'
import { columns } from '../../tables/office-level-table/columns'
import { usePpmpFormData } from '../../hooks/usePpmpFormData'

const usePpmps = createQueryHookFromTemplate(getPPMPsRequest)

interface OfficePpmpTabProps {
  searchParams: PPMPManagementSearch
  handleUpdateSearch: (
    updater: (prev: PPMPManagementSearch) => Partial<PPMPManagementSearch>,
  ) => void
}

export default function OfficePpmpTab({
  searchParams,
  handleUpdateSearch,
}: OfficePpmpTabProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const { offices, fiscalYears, libs } = usePpmpFormData({ enabled: true })
  const filterParts = [
    searchParams.searchQuery
      ? `documentName==${searchParams.searchQuery}`
      : null,
    searchParams.status && searchParams.status !== 'all'
      ? `status==${searchParams.status}`
      : null,
    searchParams.fiscalYearId
      ? `fiscalYearId==${searchParams.fiscalYearId}`
      : null,
    searchParams.officeId ? `officeId==${searchParams.officeId}` : null,
    searchParams.lib ? `libId==${searchParams.lib}` : null,
    // Ensure we only fetch master PPMPs for the office view
    `isMaster==true`,
  ].filter((f): f is string => f !== null)

  const sorts =
    searchParams.sortBy && searchParams.sortOrder
      ? `${searchParams.sortBy} ${searchParams.sortOrder}`
      : ''

  const {
    data: ppmps,
    isLoading,
    refetch: reload,
  } = usePpmps({
    pathParams: {},
    queryParams: {
      pageNumber: searchParams.pageNumber,
      pageSize: searchParams.pageSize,
      filters: filterParts.join(','),
      sorts,
    },
    enabled: true,
  })

  const statusSummary = useMemo(
    () => ({
      draft: ppmps?.data.filter((p) => p.state === PPMPState.DRAFT).length ?? 0,
      pending:
        ppmps?.data.filter((p) => p.state === PPMPState.PENDING_REVIEW)
          .length ?? 0,
      approved:
        ppmps?.data.filter((p) => p.state === PPMPState.APPROVED).length ?? 0,
    }),
    [ppmps],
  )

  return (
    <div className="space-y-4">
      <PpmpManagementOverview
        ppmps={mockPpmpDatabase}
        lineItemBudgets={mockLineItemBudgets}
        statusSummary={statusSummary}
      />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={ppmps?.data ?? []}
          onCreateNew={() => setCreateOpen(true)}
          searchParams={searchParams}
          handleUpdateSearch={handleUpdateSearch}
          pageCount={ppmps?.totalPageNumber ?? 1}
          totalRows={ppmps?.totalRows ?? 0}
          offices={offices}
          fiscalYears={fiscalYears}
          libs={libs}
        />
      )}
      <CreatePpmpDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create Master Office PPMP"
        description="Create a master PPMP workspace for consolidating submitted department PPMPs."
        preSelectedOfficeId="master-office"
        defaultIsMaster={true}
      />
      <UpdatePpmpDialog />
      <DeletePpmpDialog onSuccess={reload} />
    </div>
  )
}
