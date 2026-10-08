import { useMemo, useState } from 'react'
import { useAtom } from 'jotai'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Skeleton } from '@/components/ui/skeleton'
import { PpmpManagementOverview } from '../../components'
import {
  CreatePpmpDialog,
  DeletePpmpDialog,
  UpdatePpmpDialog,
  CreateSupplementalPpmpDialog,
} from '../../dialogs'
import {
  supplementalDialogOpenAtom,
  selectedPpmpForSupplementalAtom,
} from '../../atoms/ppmpStateAtoms'
import { getPPMPsRequest } from '../../handlers/getPpmpsRequest'
import { useOfficeCeilings } from '@/lib/fiscal-year-and-policies/requests/hooks/useOfficeCeilings'
import { computePpmpManagementOverview } from '../../lib/ppmpUtils'
import type { PPMPManagementSearch } from '@/routes/v2/(planning)/ppmp/constants'
import { DataTable } from '../../tables/office-level-table/data-table'
import { columns } from '../../tables/office-level-table/columns'
import { usePpmpFormData } from '../../hooks/usePpmpFormData'
import { usePermissions } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/constants/permissions'

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
  const [supplementalOpen, setSupplementalOpen] = useAtom(
    supplementalDialogOpenAtom,
  )
  const [selectedSupplementalPpmp] = useAtom(selectedPpmpForSupplementalAtom)
  const { offices, fiscalYears, libs } = usePpmpFormData({ enabled: true })
  const { hasPermission } = usePermissions()
  const canCreatePpmp = hasPermission(PERMISSIONS.Procurement.Ppmp.Create) || hasPermission(PERMISSIONS.Procurement.Ppmp.Manage)

  // 1. Paginated Table Filters
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

  // 2. Real Office Ceilings (Exclusive to Office Level view)
  const ceilingFilterParts = [
    searchParams.fiscalYearId ? `fiscalYearId==${searchParams.fiscalYearId}` : null,
    searchParams.officeId ? `officeId==${searchParams.officeId}` : null,
  ].filter((f): f is string => f !== null)

  const { data: officeCeilingsResponse } = useOfficeCeilings({
    pathParams: {},
    queryParams: {
      pageSize: 1000,
      filters: ceilingFilterParts.join(','),
    },
    enabled: true,
  })

  // 3. Full Scope PPMPs for Complete Management Overview and Status Metrics
  const overviewFilterParts = [
    searchParams.fiscalYearId ? `fiscalYearId==${searchParams.fiscalYearId}` : null,
    searchParams.officeId ? `officeId==${searchParams.officeId}` : null,
    searchParams.lib ? `libId==${searchParams.lib}` : null,
    `isMaster==true`,
  ].filter((f): f is string => f !== null)

  const { data: overviewPpmpsResponse } = usePpmps({
    pathParams: {},
    queryParams: {
      pageSize: 1000,
      filters: overviewFilterParts.join(','),
    },
    enabled: true,
  })

  // Compute real overview metrics from authoritative domain records
  const overviewSummary = useMemo(() => {
    const allPpmps = overviewPpmpsResponse?.data ?? []
    const ceilings = officeCeilingsResponse?.data ?? []
    return computePpmpManagementOverview({
      ppmps: allPpmps,
      ceilings,
      fiscalYearId: searchParams.fiscalYearId,
      officeId: searchParams.officeId,
      isMaster: true,
    })
  }, [overviewPpmpsResponse, officeCeilingsResponse, searchParams.fiscalYearId, searchParams.officeId])

  return (
    <div className="space-y-4">
      <PpmpManagementOverview
        summary={overviewSummary}
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
          onCreateNew={canCreatePpmp ? () => setCreateOpen(true) : undefined}
          searchParams={searchParams}
          handleUpdateSearch={handleUpdateSearch}
          pageCount={ppmps?.totalPages ?? ppmps?.totalPageNumber ?? 1}
          totalRows={ppmps?.totalCount ?? ppmps?.totalRows ?? 0}
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
      <CreateSupplementalPpmpDialog
        open={supplementalOpen}
        onOpenChange={setSupplementalOpen}
        sourcePpmp={selectedSupplementalPpmp}
        onSuccess={() => {
          void reload()
        }}
      />
    </div>
  )
}
