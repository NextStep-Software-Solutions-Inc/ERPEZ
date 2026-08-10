import { useState, useMemo } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { ArrowLeft, Search as SearchIcon, X } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { StrategicTargetBreadcrumb } from './StrategicTargetBreadcrumb'
import { getKpiAssignmentsRequest } from '@/features/planning/kpi-assignment/handlers/getKpiAssignmentsRequest'
import { OfficeKpiCard } from '@/features/planning/kpi-assignment/components/OfficeKpiCard'
import { FiscalYearKpiCard } from '@/features/planning/kpi-assignment/components/FiscalYearKpiCard'
import { FunctionTypeCard } from '@/features/planning/kpi-assignment/components/FunctionTypeCard'
import { OPCRKPIDetails } from '@/features/planning/opcr/components/OPCRKPIDetails'
import { StrategicTargetTabsContainer } from '@/features/planning/opcr/components/strategic-target-tabs'
import OPCRPaginationFooter from '@/features/planning/opcr/components/OPCRPaginationFooter'
import {
  groupByOffice,
  groupByFiscalYear,
  groupByFunctionType,
  getUniqueKpiCount,
} from '@/features/planning/kpi-assignment/utils/grouping'
import { FunctionCategory } from '@/features/planning/master-kpi/types'
import type {
  FunctionTypeGroup,
  FYGroup,
  OfficeGroup,
} from '@/features/planning/kpi-assignment/types/grouping.types'
import { useFiscalYearQueries } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/hooks/useFiscalYearQueries'
import OPCRToolbar from '@/features/planning/opcr/components/OPCRToolbar'

const useKPIAssignments = createQueryHookFromTemplate(getKpiAssignmentsRequest)

interface CommitmentsSearch {
  officeId?: string
  fiscalYearId?: string
  functionCategory?: FunctionCategory
  kpiAssignmentId?: string
  kpiViewSource?: 'kpiassignment' | 'strategicTarget' | 'opcr'
  pageNumber?: number
  pageSize?: number
  [key: string]: unknown
}

export default function StrategicTargetTab() {
  const navigate = useNavigate({ from: '/v2/commitments' })
  const search = useSearch({ from: '/v2/commitments/' }) as CommitmentsSearch
  const { fiscalYears } = useFiscalYearQueries()

  const searchQuery = (search.searchQuery as string) || ''
  // Determine which view to show: Level 1 (offices), Level 2 (fiscal years), Level 3 (function types), Level 4 (KPI details), or Level 5 (Individual KPI Assignment)
  const officeId = search.officeId as string | undefined
  const fiscalYearId = search.fiscalYearId as string | undefined
  const functionCategory = search.functionCategory as
    | FunctionCategory
    | undefined
  const kpiAssignmentId = search.kpiAssignmentId as string | undefined
  const kpiViewSource = search.kpiViewSource as
    | 'kpiassignment'
    | 'strategicTarget'
    | 'opcr'
    | undefined

  const isLevel5View = !!kpiAssignmentId && kpiViewSource === 'strategicTarget'
  const isLevel2View = !!officeId && !fiscalYearId && !isLevel5View
  const isLevel3View =
    !!officeId && !!fiscalYearId && !functionCategory && !isLevel5View
  const isLevel4View =
    !!officeId && !!fiscalYearId && !!functionCategory && !isLevel5View

  // Build unified filters based on both drilldown level and toolbar parameters
  const queryFilters = useMemo(() => {
    const arr: string[] = []

    if (officeId) {
      arr.push(`officeId==${officeId}`)
    }

    // Use URL fiscalYearId parameter if set (either via drilldown or OPCRToolbar)
    const activeFyId = fiscalYearId || (search.fiscalYearId as string | undefined)
    if (activeFyId) {
      arr.push(`fyActiveKPI.fiscalYearId==${activeFyId}`)
    }

    if (functionCategory) {
      arr.push(`fyActiveKPI.functionCategory==${functionCategory}`)
    }

    return arr.join(';')
  }, [officeId, fiscalYearId, search.fiscalYearId, functionCategory])

  // Query KPI assignments - either all offices, filtered by officeId, or filtered by officeId + fiscalYearId
  const {
    data: kpiAssignments,
    isLoading,
    error: queryError,
  } = useKPIAssignments({
    pathParams: {},
    queryParams: {
      pageSize: 1000, // Increased for comprehensive data
      filters: queryFilters,
    },
  })

  // --- LEVEL 1: Office Grid View ---
  const officeGroups = useMemo(() => {
    if (!kpiAssignments?.data) return []
    return groupByOffice(kpiAssignments.data)
  }, [kpiAssignments])

  // For Level 1, we display the raw office list (since search is only for Level 2)
  const filteredOffices = officeGroups

  // --- LEVEL 2: Fiscal Year Grid View ---
  const fyGroups = useMemo(() => {
    if (!kpiAssignments?.data || !isLevel2View) return []
    const filtered = kpiAssignments.data
    const groups = groupByFiscalYear(filtered)
    // Update kpiCount and metadata with details from useFiscalYearQueries
    return groups.map((fy) => {
      const match = fiscalYears.find((f) => f.id === fy.fiscalYearId)
      return {
        ...fy,
        year: match?.year ?? 0,
        description: match?.description,
        status: match?.status,
        isLocked: match?.isLocked,
        kpiCount: getUniqueKpiCount(
          filtered.filter((a) => a.fyActiveKPI?.fiscalYearId === fy.fiscalYearId),
        ),
      }
    })
  }, [kpiAssignments, isLevel2View, fiscalYears])

  // Filter fyGroups by search query
  const filteredFyGroups = useMemo(() => {
    if (!searchQuery.trim()) return fyGroups
    const query = searchQuery.toLowerCase()
    return fyGroups.filter((fy) =>
      fy.year?.toString().includes(query) ||
      fy.description?.toLowerCase().includes(query)
    )
  }, [fyGroups, searchQuery])

  // --- LEVEL 3: Function Type Grid View ---
  const functionTypeGroups = useMemo(() => {
    if (!kpiAssignments?.data || !isLevel3View) return []
    const filtered = kpiAssignments.data.filter(
      (a) => a.fyActiveKPI?.fiscalYearId === fiscalYearId,
    )
    return groupByFunctionType(filtered)
  }, [kpiAssignments, isLevel3View, fiscalYearId])

  // --- LEVEL 4: KPI Details List ---
  const level4KpiAssignments = useMemo(() => {
    if (!kpiAssignments?.data || !isLevel4View) return []
    return kpiAssignments.data.filter(
      (a) =>
        a.fyActiveKPI?.fiscalYearId === fiscalYearId &&
        a.fyActiveKPI?.functionCategory === functionCategory,
    )
  }, [kpiAssignments, isLevel4View, fiscalYearId, functionCategory])

  // --- Event Handlers ---
  const handleOfficeClick = (id: string) => {
    navigate({
      to: '/v2/commitments',
      search: { officeId: id },
    })
  }

  const handleFiscalYearClick = (fy: string) => {
    navigate({
      to: '/v2/commitments',
      search: { officeId, fiscalYearId: fy },
    })
  }

  const handleFunctionTypeClick = (functionCategory: FunctionCategory) => {
    navigate({
      to: '/v2/commitments',
      search: {
        officeId,
        fiscalYearId,
        functionCategory,
      },
    })
  }

  const handleBackFromLevel3 = () => {
    navigate({
      to: '/v2/commitments',
      search: { officeId },
    })
  }

  const handleBackFromLevel2 = () => {
    navigate({
      to: '/v2/commitments',
      search: {},
    })
  }

  const handleBackFromLevel4 = () => {
    navigate({
      to: '/v2/commitments',
      search: { officeId, fiscalYearId },
    })
  }

  const handleKPIAssignmentClick = (kpiAssignmentId: string) => {
    navigate({
      to: '/v2/commitments',
      search: {
        officeId,
        fiscalYearId,
        functionCategory,
        kpiAssignmentId,
        kpiViewSource: 'strategicTarget',
      },
    })
  }

  const handleBackFromLevel5 = () => {
    navigate({
      to: '/v2/commitments',
      search: { officeId, fiscalYearId, functionCategory },
    })
  }

  // Breadcrumb navigation handlers - navigate to specific levels
  const handleBreadcrumbClickRoot = () => {
    navigate({
      to: '/v2/commitments',
      search: {},
    })
  }

  const handleBreadcrumbClickOffice = () => {
    navigate({
      to: '/v2/commitments',
      search: { officeId },
    })
  }

  const handleBreadcrumbClickFiscalYear = () => {
    navigate({
      to: '/v2/commitments',
      search: { officeId, fiscalYearId },
    })
  }

  const handleBreadcrumbClickFunctionCategory = () => {
    navigate({
      to: '/v2/commitments',
      search: { officeId, fiscalYearId, functionCategory },
    })
  }

  const pageNumber = search.pageNumber || 1
  const pageSize = search.pageSize || 25

  const handlePageChange = (newPageNumber: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        pageNumber: newPageNumber,
      }),
    })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        pageSize: newPageSize,
        pageNumber: 1,
      }),
    })
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

  const handleFiscalYearChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        fiscalYearId: value || undefined,
        pageNumber: 1,
      }),
    })
  }

  const handleCommitmentStatusChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        commitmentStatus: value || undefined,
        pageNumber: 1,
      }),
    })
  }

  const handleReviewStatusChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        reviewStatus: value || undefined,
        pageNumber: 1,
      }),
    })
  }

  const paginatedOffices = useMemo(() => {
    const start = (pageNumber - 1) * pageSize
    return filteredOffices.slice(start, start + pageSize)
  }, [filteredOffices, pageNumber, pageSize])

  const totalPageNumber = Math.ceil(filteredOffices.length / pageSize)

  const selectedOffice = officeGroups.find((o) => o.id === officeId)

  // --- Render: Level 1 - Office Grid ---
  if (!isLevel2View && !isLevel3View && !isLevel4View && !isLevel5View) {
    return (
      <div className="space-y-4">
        <StrategicTargetBreadcrumb
          officeId={officeId}
          selectedOffice={selectedOffice}
          fiscalYearId={fiscalYearId}
          functionCategory={functionCategory}
          isLevel4View={isLevel4View}
          onClickRoot={handleBreadcrumbClickRoot}
          onClickOffice={handleBreadcrumbClickOffice}
          onClickFiscalYear={handleBreadcrumbClickFiscalYear}
          onClickFunctionCategory={handleBreadcrumbClickFunctionCategory}
        />
        <OfficeGrid
          queryError={queryError instanceof Error ? queryError : null}
          isLoading={isLoading}
          filteredOffices={paginatedOffices}
          handleOfficeClick={handleOfficeClick}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalPageNumber={totalPageNumber}
          totalRows={filteredOffices.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    )
  }

  // --- Render: Level 5 - Individual KPI Assignment Details ---
  if (isLevel5View && kpiAssignmentId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBackFromLevel5}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Back to KPIs</span>
          </button>
        </div>
        <OPCRKPIDetails
          hideButton
          kpiAssignmentId={kpiAssignmentId}
          source="strategicTarget"
        />
      </div>
    )
  }

  // --- Render: Level 4 - KPI Details ---
  if (isLevel4View) {
    return (
      <div className="space-y-4">
        <StrategicTargetBreadcrumb
          officeId={officeId}
          selectedOffice={selectedOffice}
          fiscalYearId={fiscalYearId}
          functionCategory={functionCategory}
          isLevel4View={isLevel4View}
          onClickRoot={handleBreadcrumbClickRoot}
          onClickOffice={handleBreadcrumbClickOffice}
          onClickFiscalYear={handleBreadcrumbClickFiscalYear}
          onClickFunctionCategory={handleBreadcrumbClickFunctionCategory}
        />
        <StrategicTargetTabsContainer
          handleBackFromLevel4={handleBackFromLevel4}
          selectedOffice={selectedOffice ?? null}
          kpiAssignments={level4KpiAssignments}
          isLoading={isLoading}
          queryError={queryError instanceof Error ? queryError : null}
          fiscalYearId={fiscalYearId ?? null}
          functionCategory={functionCategory ?? null}
          onKPIAssignmentClick={handleKPIAssignmentClick}
        />
      </div>
    )
  }

  // --- Render: Level 3 - Function Type Grid ---
  if (isLevel3View) {
    return (
      <div className="space-y-4">
        <StrategicTargetBreadcrumb
          officeId={officeId}
          selectedOffice={selectedOffice}
          fiscalYearId={fiscalYearId}
          functionCategory={functionCategory}
          isLevel4View={isLevel4View}
          onClickRoot={handleBreadcrumbClickRoot}
          onClickOffice={handleBreadcrumbClickOffice}
          onClickFiscalYear={handleBreadcrumbClickFiscalYear}
          onClickFunctionCategory={handleBreadcrumbClickFunctionCategory}
        />
        <FunctionTypeGrid
          handleBackFromLevel3={handleBackFromLevel3}
          handleFunctionTypeClick={handleFunctionTypeClick}
          functionTypeGroups={functionTypeGroups}
          isLoading={isLoading}
          queryError={queryError instanceof Error ? queryError : null}
          selectedOffice={selectedOffice ?? null}
          fiscalYearId={fiscalYearId ?? null}
        />
      </div>
    )
  }

  // --- Render: Level 2 - Fiscal Year Grid ---
  return (
    <div className="space-y-4">
      <StrategicTargetBreadcrumb
        officeId={officeId}
        selectedOffice={selectedOffice}
        fiscalYearId={fiscalYearId}
        functionCategory={functionCategory}
        isLevel4View={isLevel4View}
        onClickRoot={handleBreadcrumbClickRoot}
        onClickOffice={handleBreadcrumbClickOffice}
        onClickFiscalYear={handleBreadcrumbClickFiscalYear}
        onClickFunctionCategory={handleBreadcrumbClickFunctionCategory}
      />
      <OPCRToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        showFiscalYear={false}
        showCommitmentStatus={false}
        showReviewStatus={false}
        searchPlaceholder="search fiscalYear"
      />
      <div className="bg-white border rounded-lg">
        <div className="w-full px-4 py-6">
          {/* Header with Back Button */}
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={handleBackFromLevel2}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Back to Offices</span>
            </button>
          </div>

          {/* Office Title Section */}
          {selectedOffice && (
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedOffice.name}
              </h2>
              <p className="text-gray-600">
                Fiscal Years with {selectedOffice.assignmentCount} KPI
                {selectedOffice.assignmentCount !== 1 ? 's' : ''} assigned
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-gray-600">Loading fiscal year data...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {queryError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">Error loading data</p>
              <p className="text-red-700 text-sm mt-1">
                {queryError instanceof Error
                  ? queryError.message
                  : 'Unknown error'}
              </p>
            </div>
          )}

          {/* Fiscal Year Grid */}
          {!isLoading && !queryError && (
            <>
              {filteredFyGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFyGroups.map((fy: FYGroup) => (
                    <FiscalYearKpiCard
                      key={fy.fiscalYearId}
                      fy={fy}
                      onClick={() => handleFiscalYearClick(fy.fiscalYearId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">
                    No fiscal years found matching the criteria
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function OfficeGrid({
  filteredOffices,
  isLoading,
  queryError,
  handleOfficeClick,
  pageNumber,
  pageSize,
  totalPageNumber,
  totalRows,
  onPageChange,
  onPageSizeChange,
}: {
  readonly filteredOffices: OfficeGroup[]
  readonly isLoading: boolean
  readonly queryError: Error | null
  readonly handleOfficeClick: (officeId: string) => void
  readonly pageNumber: number
  readonly pageSize: number
  readonly totalPageNumber: number
  readonly totalRows: number
  readonly onPageChange: (pageNumber: number) => void
  readonly onPageSizeChange: (pageSize: number) => void
}) {
  return (
    <div className="bg-white border rounded-lg">
      <div className="w-full px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Strategic Targets by Office
          </h2>
          <p className="text-gray-600">
            Select an office to view KPI assignments by fiscal year
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Loading KPI assignments...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {queryError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">
              Error loading KPI assignments
            </p>
            <p className="text-red-700 text-sm mt-1">
              {queryError instanceof Error
                ? queryError.message
                : 'Unknown error'}
            </p>
          </div>
        )}

        {/* Office Grid */}
        {!isLoading && !queryError && (
          <>
            {filteredOffices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOffices.map((office) => (
                  <OfficeKpiCard
                    key={office.id}
                    office={office}
                    onClick={() => handleOfficeClick(office.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No results found
                </p>
              </div>
            )}

            <OPCRPaginationFooter
              pageNumber={pageNumber}
              pageSize={pageSize}
              totalPageNumber={totalPageNumber}
              totalRows={totalRows}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </>
        )}
      </div>
    </div>
  )
}

function FunctionTypeGrid({
  handleBackFromLevel3,
  handleFunctionTypeClick,
  functionTypeGroups,
  isLoading,
  queryError,
  selectedOffice,
  fiscalYearId,
}: {
  handleBackFromLevel3: () => void
  handleFunctionTypeClick: (functionCategory: FunctionCategory) => void
  functionTypeGroups: FunctionTypeGroup[]
  isLoading: boolean
  queryError: Error | null
  selectedOffice: { id: string; name: string } | null
  fiscalYearId: string | null
}) {
  return (
    <div className="bg-white">
      <div className="w-full px-4 py-6">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={handleBackFromLevel3}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
            <span className="text-gray-700 font-medium">
              Back to Fiscal Years
            </span>
          </button>
        </div>

        {/* Breadcrumb / Title Section */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">
            {selectedOffice?.name} / FY {fiscalYearId}
          </p>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            KPI Functions
          </h2>
          <p className="text-gray-600">
            {functionTypeGroups.reduce((sum, ft) => sum + ft.kpiCount, 0)} KPIs
            grouped by function type
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Loading function types...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {queryError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Error loading data</p>
            <p className="text-red-700 text-sm mt-1">
              {queryError instanceof Error
                ? queryError.message
                : 'Unknown error'}
            </p>
          </div>
        )}

        {/* Function Type Grid */}
        {!isLoading && !queryError && (
          <>
            {functionTypeGroups.length > 0 ? (
              <div className="flex flex-col gap-6">
                {functionTypeGroups.map((ft) => (
                  <FunctionTypeCard
                    key={ft.functionCategory}
                    functionType={ft}
                    onClick={() => handleFunctionTypeClick(ft.functionCategory)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No function types found for this fiscal year
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
