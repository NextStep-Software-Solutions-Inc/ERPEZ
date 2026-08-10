import { useState, useMemo } from 'react'
import {
  SearchIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap,
  Hourglass,
} from 'lucide-react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useFYActiveKPIs } from '@/features/planning/annual-performance-planning/hooks/useAPPQueries'
import AssignKpiToOfficeDialog from '@/components/features/planning/kpi-assignment-for-office/dialog/AssignKpiToOfficeDialog'
import {
  useKpiAssignments,
  checkKpiAssignmentExists,
} from '@/components/features/planning/kpi-assignment-for-office/hooks/useAssignKpiToOffice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { FYActiveKPI } from '@/features/planning/fiscal-year-and-policies/fy-active-kpi/types/types'
import OPCRPaginationFooter from '../OPCRPaginationFooter'

interface StrategicTargetSearch {
  officeId?: string
  pageSize?: number
  pageNumber?: number
  [key: string]: unknown
}

const DEFAULT_PAGE_SIZE = 25
const DEFAULT_PAGE_NUMBER = 1

export function KpiIndicatorContent() {
  const navigate = useNavigate({ from: '/v2/commitments' })
  const search = useSearch({
    from: '/v2/commitments/',
  }) as StrategicTargetSearch

  const officeId = search.officeId as string | undefined
  const pageSize = search.pageSize ?? DEFAULT_PAGE_SIZE
  // Ensure pageNumber is always >= 1 (1-based indexing for user-friendly URLs)
  const pageNumber = Math.max(
    search.pageNumber ?? DEFAULT_PAGE_NUMBER,
    DEFAULT_PAGE_NUMBER,
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedKpi, setSelectedKpi] = useState<FYActiveKPI | null>(null)

  // Fetch FY Active KPIs with pagination from URL
  const {
    data: response,
    isLoading,
    error,
  } = useFYActiveKPIs({
    pathParams: {},
    queryParams: {
      filters: 'isOptInAvailable==true;agencyTargetAnnual!=0',
      pageNumber,
      pageSize,
    },
  })

  // Fetch existing assignments for duplicate check
  const { data: assignmentsData } = useKpiAssignments({
    pathParams: {},
    queryParams: {
      pageSize: 1000,
      filters: officeId ? `officeId==${officeId}` : '',
    },
  })

  const fyActiveKPIs = useMemo(
    () =>
      ((response?.data as FYActiveKPI[]) || []).filter(
        (kpi) => kpi.agencyTargetAnnual !== 0,
      ),
    [response],
  )
  const totalItems = response?.totalRows ?? 0
  const queryError = error instanceof Error ? error : null
  const existingAssignments = assignmentsData?.data ?? []
  const totalPages = Math.ceil(totalItems / pageSize)

  const handlePageChange = (newPage: number): void => {
    // Ensure newPage is always >= 1
    const validPageNumber = Math.max(newPage, DEFAULT_PAGE_NUMBER)
    // Navigate with updated pageNumber in URL (1-based, user-friendly)
    void navigate({
      search: (prev: StrategicTargetSearch) => ({
        ...prev,
        pageNumber: validPageNumber,
      }),
    })
  }

  const handlePageSizeChange = (newPageSize: number): void => {
    void navigate({
      search: (prev: StrategicTargetSearch) => ({
        ...prev,
        pageSize: newPageSize,
        pageNumber: 1,
      }),
    })
  }

  const handleAssignClick = (kpi: FYActiveKPI) => {
    if (!officeId) return
    setSelectedKpi(kpi)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedKpi(null)
  }

  const handleAssignmentSuccess = () => {
    handleDialogClose()
  }

  const getFunctionCategoryBadge = (category?: string) => {
    const categoryLower = category?.toLowerCase() || ''
    if (categoryLower.includes('core')) {
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Core Function',
      }
    }
    if (categoryLower.includes('strategic')) {
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        label: 'Strategic Priority',
      }
    }
    if (
      categoryLower.includes('support') ||
      categoryLower.includes('mandatory')
    ) {
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        label: 'Mandatory Support',
      }
    }
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: category || 'N/A',
    }
  }

  const getDistributionBehaviorLabel = (behavior?: string) => {
    const behaviorLower = behavior?.toLowerCase() || ''
    if (behaviorLower.includes('sum')) return 'SUM'
    if (behaviorLower.includes('average')) return 'AVERAGE'
    if (behaviorLower.includes('non')) return 'NON_CUMULATIVE'
    return behavior || 'N/A'
  }

  return (
    <>
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Loading KPI indicators...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {queryError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium">Error loading data</p>
          <p className="text-red-700 text-sm mt-1">
            {queryError instanceof Error ? queryError.message : 'Unknown error'}
          </p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !queryError && (
        <>
          {fyActiveKPIs.length > 0 ? (
            <>
              <div className="space-y-4">
                {fyActiveKPIs.map((kpi) => {
                  const isAlreadyAssigned =
                    !!officeId &&
                    checkKpiAssignmentExists(
                      existingAssignments,
                      kpi.id,
                      officeId,
                    )
                  const funcCategoryBadge = getFunctionCategoryBadge(
                    kpi.functionCategory,
                  )

                  return (
                    <div
                      key={kpi.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all group"
                    >
                      {/* Header: Title, Code, Status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {kpi.name || 'Unnamed KPI'}
                            </h3>
                            {kpi.isGAD && (
                              <Badge
                                variant="outline"
                                className="bg-pink-50 text-pink-700 border-pink-200 text-xs shrink-0"
                              >
                                GAD
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 font-mono">
                            Code: {kpi.code || 'N/A'}
                          </p>
                        </div>

                        {/* Assign Button (visible on hover, only when officeId present) */}
                        {officeId && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button
                              type="button"
                              variant={
                                isAlreadyAssigned ? 'outline' : 'default'
                              }
                              size="sm"
                              onClick={() => handleAssignClick(kpi)}
                              disabled={Boolean(isAlreadyAssigned)}
                              className={
                                isAlreadyAssigned
                                  ? 'border-green-300 text-green-700'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {isAlreadyAssigned ? 'Assigned' : 'Assign'}
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {kpi.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {kpi.description}
                        </p>
                      )}

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                        {/* Function Category */}
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-gray-600 font-medium mb-1">
                            Function
                          </p>
                          <Badge
                            className={`${funcCategoryBadge.bg} ${funcCategoryBadge.text} text-xs font-medium w-full justify-center`}
                          >
                            {funcCategoryBadge.label}
                          </Badge>
                        </div>

                        {/* Measurement Unit */}
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-gray-600 font-medium mb-1">Unit</p>
                          <p className="font-semibold text-gray-900 truncate">
                            {kpi.measurementUnit || 'N/A'}
                          </p>
                        </div>

                        {/* Distribution Behavior */}
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-gray-600 font-medium mb-1 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Agg.
                          </p>
                          <p className="font-semibold text-gray-900">
                            {getDistributionBehaviorLabel(
                              kpi.distributionBehavior,
                            )}
                          </p>
                        </div>

                        {/* Monitoring Frequency */}
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-gray-600 font-medium mb-1 flex items-center gap-1">
                            <Hourglass className="w-3 h-3" /> Freq.
                          </p>
                          <p className="font-semibold text-gray-900 truncate">
                            {kpi.monitoringFrequency || 'N/A'}
                          </p>
                        </div>

                        {/* Opt-In Status */}
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-gray-600 font-medium mb-1 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Opt-In
                          </p>
                          <Badge
                            variant="outline"
                            className={
                              kpi.isOptInAvailable
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }
                          >
                            {kpi.isOptInAvailable ? 'Available' : 'No'}
                          </Badge>
                        </div>
                      </div>

                      {/* Agency Targets (if present) */}
                      {(kpi.agencyTargetAnnual ||
                        kpi.agencyTargetQ1 ||
                        kpi.agencyTargetQ2 ||
                        kpi.agencyTargetQ3 ||
                        kpi.agencyTargetQ4) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-600 mb-2">
                            Agency Targets:
                          </p>
                          <div className="grid grid-cols-5 gap-2 text-xs">
                            <div className="bg-indigo-50 p-2 rounded text-center">
                              <p className="text-gray-600 font-medium">
                                Annual
                              </p>
                              <p className="font-bold text-indigo-900">
                                {kpi.agencyTargetAnnual?.toFixed(2) ?? '-'}
                              </p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded text-center">
                              <p className="text-gray-600 font-medium">Q1</p>
                              <p className="font-bold text-blue-900">
                                {kpi.agencyTargetQ1?.toFixed(2) ?? '-'}
                              </p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded text-center">
                              <p className="text-gray-600 font-medium">Q2</p>
                              <p className="font-bold text-blue-900">
                                {kpi.agencyTargetQ2?.toFixed(2) ?? '-'}
                              </p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded text-center">
                              <p className="text-gray-600 font-medium">Q3</p>
                              <p className="font-bold text-blue-900">
                                {kpi.agencyTargetQ3?.toFixed(2) ?? '-'}
                              </p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded text-center">
                              <p className="text-gray-600 font-medium">Q4</p>
                              <p className="font-bold text-blue-900">
                                {kpi.agencyTargetQ4?.toFixed(2) ?? '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <OPCRPaginationFooter
                pageNumber={pageNumber}
                pageSize={pageSize}
                totalPageNumber={totalPages}
                totalRows={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
              <div className="flex justify-center mb-4">
                <SearchIcon className="h-12 w-12 text-gray-300" />
              </div>
              <p className="text-gray-600 font-medium">
                No KPI indicators found
              </p>
              <p className="text-gray-500 text-sm mt-1">
                No FY Active KPIs are available for the selected function type,
                office, and fiscal year.
              </p>
            </div>
          )}
        </>
      )}

      {/* Assign KPI Dialog */}
      {selectedKpi && officeId && (
        <AssignKpiToOfficeDialog
          kpiId={selectedKpi.id}
          kpiName={selectedKpi.name || 'Unnamed KPI'}
          kpiCode={selectedKpi.code || 'N/A'}
          officeId={officeId}
          isOpen={dialogOpen}
          onOpenChange={setDialogOpen}
          onAssigned={handleAssignmentSuccess}
          agencyTargetAnnual={selectedKpi.agencyTargetAnnual}
          agencyTargetQ1={selectedKpi.agencyTargetQ1}
          agencyTargetQ2={selectedKpi.agencyTargetQ2}
          agencyTargetQ3={selectedKpi.agencyTargetQ3}
          agencyTargetQ4={selectedKpi.agencyTargetQ4}
        />
      )}
    </>
  )
}
