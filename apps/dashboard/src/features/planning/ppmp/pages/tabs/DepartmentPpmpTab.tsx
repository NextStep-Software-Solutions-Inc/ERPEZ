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
import { useSubOfficeCeilings } from '@/lib/fiscal-year-and-policies/requests/hooks/useSubOfficeCeilings'
import { computePpmpManagementOverview } from '../../lib/ppmpUtils'
import { DataTable } from '../../tables/department-level-table/data-table'
import { columns } from '../../tables/department-level-table/columns'
import { usePpmpFormData } from '../../hooks/usePpmpFormData'
import type { PPMPManagementSearch } from '@/routes/v2/(planning)/ppmp/constants'

const usePpmps = createQueryHookFromTemplate(getPPMPsRequest)

interface DepartmentPpmpTabProps {
  searchParams: PPMPManagementSearch
  handleUpdateSearch: (
    updater: (prev: PPMPManagementSearch) => Partial<PPMPManagementSearch>,
  ) => void
}

export default function DepartmentPpmpTab({
  searchParams,
  handleUpdateSearch,
}: DepartmentPpmpTabProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [supplementalOpen, setSupplementalOpen] = useAtom(
    supplementalDialogOpenAtom,
  )
  const [selectedSupplementalPpmp] = useAtom(selectedPpmpForSupplementalAtom)
  const { offices, fiscalYears, libs } = usePpmpFormData({ enabled: true })

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
    searchParams.consolidated && searchParams.consolidated !== 'all'
      ? searchParams.consolidated === 'consolidated'
        ? `consolidatedIntoId!=null`
        : `consolidatedIntoId==null`
      : null,
    `isMaster==false`,
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

  // 2. Real Sub-Office Ceilings (Exclusive to Department Level view)
  const subCeilingFilterParts = [
    searchParams.fiscalYearId ? `fiscalYearId==${searchParams.fiscalYearId}` : null,
    searchParams.officeId ? `subOfficeId==${searchParams.officeId}` : null,
  ].filter((f): f is string => f !== null)

  const { data: subOfficeCeilingsResponse } = useSubOfficeCeilings({
    pathParams: {},
    queryParams: {
      pageSize: 1000,
      filters: subCeilingFilterParts.join(','),
    },
    enabled: true,
  })

  // 3. Full Scope PPMPs for Complete Management Overview and Status Metrics
  const overviewFilterParts = [
    searchParams.fiscalYearId ? `fiscalYearId==${searchParams.fiscalYearId}` : null,
    searchParams.officeId ? `officeId==${searchParams.officeId}` : null,
    searchParams.lib ? `libId==${searchParams.lib}` : null,
    searchParams.consolidated && searchParams.consolidated !== 'all'
      ? searchParams.consolidated === 'consolidated'
        ? `consolidatedIntoId!=null`
        : `consolidatedIntoId==null`
      : null,
    `isMaster==false`,
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
    const ceilings = subOfficeCeilingsResponse?.data ?? []
    return computePpmpManagementOverview({
      ppmps: allPpmps,
      ceilings,
      fiscalYearId: searchParams.fiscalYearId,
      officeId: searchParams.officeId,
      isMaster: false,
    })
  }, [overviewPpmpsResponse, subOfficeCeilingsResponse, searchParams.fiscalYearId, searchParams.officeId])

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
          onCreateNew={() => setCreateOpen(true)}
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
        defaultIsMaster={false}
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
