import { useMemo } from 'react'
import { SearchIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { KPIAssignment } from '@/features/planning/kpi-assignment/types'
import { useKpiAssignments } from '@/components/features/planning/kpi-assignment-for-office/hooks/useAssignKpiToOffice'
import { useSearch, useNavigate } from '@tanstack/react-router'
import OPCRPaginationFooter from '../OPCRPaginationFooter'
import { FunctionCategory } from '@/features/planning/master-kpi/types'

interface KpiAssignedContentProps {
  readonly kpiAssignments?: KPIAssignment[]
  readonly isLoading?: boolean
  readonly queryError?: Error | null
  readonly onKPIAssignmentClick?: (kpiAssignmentId: string) => void
}

export function KpiAssignedContent({
  kpiAssignments: externalAssignments,
  isLoading: externalIsLoading,
  queryError: externalQueryError,
  onKPIAssignmentClick,
}: KpiAssignedContentProps) {
  const navigate = useNavigate({ from: '/v2/commitments' })
  // Fetch KPI assignments with filter
  const {
    officeId,
    fiscalYearId,
    functionCategory,
    pageNumber: searchPageNumber,
    pageSize: searchPageSize,
  } = useSearch({
    from: '/v2/commitments/',
  }) as {
    officeId?: string
    fiscalYearId?: string
    functionCategory?: FunctionCategory
    pageNumber?: number
    pageSize?: number
  }

  const pageNumber = searchPageNumber || 1
  const pageSize = searchPageSize || 10

  // Only fetch from server if external assignments are not provided
  const {
    data: assignmentsResponse,
    isLoading: internalIsLoading,
    error: internalError,
  } = useKpiAssignments(
    !externalAssignments
      ? {
          pathParams: {},
          queryParams: {
            pageNumber,
            pageSize,
            filters: `officeId==${officeId};fyActiveKPI.fiscalYearId==${fiscalYearId};fyActiveKPI.functionCategory==${functionCategory}`,
          },
        }
      : {
          pathParams: {},
          queryParams: {
            pageNumber,
            pageSize,
          },
        },
  )

  // Use either external or internal data
  const assignments = useMemo(() => {
    if (externalAssignments) {
      const start = (pageNumber - 1) * pageSize
      return externalAssignments.slice(start, start + pageSize)
    }
    return (assignmentsResponse?.data as KPIAssignment[]) || []
  }, [externalAssignments, assignmentsResponse, pageNumber, pageSize])

  const totalRows = useMemo(() => {
    if (externalAssignments) return externalAssignments.length
    return assignmentsResponse?.totalRows ?? 0
  }, [externalAssignments, assignmentsResponse])

  const totalPageNumber = useMemo(() => {
    if (externalAssignments)
      return Math.ceil(externalAssignments.length / pageSize)
    return assignmentsResponse?.totalPageNumber ?? 1
  }, [externalAssignments, assignmentsResponse, pageSize])

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

  const isLoading = externalIsLoading ?? internalIsLoading
  const queryError =
    externalQueryError ??
    (internalError instanceof Error ? internalError : null)

  return (
    <>
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Loading KPI details...</p>
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
          {assignments.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-4">
                {assignments.map((assignment: KPIAssignment) => (
                  <button
                    key={assignment.id}
                    onClick={() => {
                      if (onKPIAssignmentClick && assignment.id) {
                        onKPIAssignmentClick(assignment.id)
                      }
                    }}
                    className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    aria-label={`View KPI: ${assignment.fyActiveKPI?.name || 'Unnamed KPI'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {assignment.fyActiveKPI?.name || 'Unnamed KPI'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Code: {assignment.fyActiveKPI?.code || 'N/A'}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-4 shrink-0">
                        Target: {assignment.assignedTargetAnnual ?? '—'}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>

              <OPCRPaginationFooter
                pageNumber={pageNumber}
                pageSize={pageSize}
                totalPageNumber={totalPageNumber}
                totalRows={totalRows}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
              <div className="flex justify-center mb-4">
                <SearchIcon className="h-12 w-12 text-gray-300" />
              </div>
              <p className="text-gray-600 font-medium">No KPIs assigned</p>
              <p className="text-gray-500 text-sm mt-1">
                No KPIs have been assigned to this function type for the
                selected office and fiscal year.
              </p>
            </div>
          )}
        </>
      )}
    </>
  )
}
