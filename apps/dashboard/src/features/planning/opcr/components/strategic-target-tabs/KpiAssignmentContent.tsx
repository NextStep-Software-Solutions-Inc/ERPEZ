import { SearchIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { KPIAssignment } from '@/features/planning/kpi-assignment/types'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import OPCRPaginationFooter from '../OPCRPaginationFooter'

interface KpiAssignmentContentProps {
  readonly kpiAssignments: KPIAssignment[]
  readonly isLoading: boolean
  readonly queryError: Error | null
  readonly onKPIAssignmentClick?: (kpiAssignmentId: string) => void
}

export function KpiAssignmentContent({
  kpiAssignments,
  isLoading,
  queryError,
  onKPIAssignmentClick,
}: KpiAssignmentContentProps) {
  const navigate = useNavigate({ from: '/v2/commitments' })
  const search = useSearch({
    from: '/v2/commitments/',
  }) as {
    pageNumber?: number
    pageSize?: number
  }

  const pageNumber = search.pageNumber || 1
  const pageSize = search.pageSize || 10

  const assignments = useMemo(() => {
    const start = (pageNumber - 1) * pageSize
    return kpiAssignments.slice(start, start + pageSize)
  }, [kpiAssignments, pageNumber, pageSize])

  const totalPageNumber = Math.ceil(kpiAssignments.length / pageSize)

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
                {assignments.map((assignment) => (
                  <button
                    key={assignment.id}
                    onClick={() => {
                      if (onKPIAssignmentClick && assignment.id) {
                        onKPIAssignmentClick(assignment.id)
                      }
                    }}
                    className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    aria-label={`View assignment details for: ${assignment.fyActiveKPI?.name || 'Unnamed KPI'}`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {assignment.fyActiveKPI?.name || 'Unnamed KPI'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Code: {assignment.fyActiveKPI?.code || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Annual Target:</p>
                          <p className="font-medium text-gray-900">
                            {assignment.assignedTargetAnnual ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status:</p>
                          <Badge
                            variant={
                              assignment.isLocked ? 'default' : 'secondary'
                            }
                          >
                            {assignment.isLocked ? 'Locked' : 'Unlocked'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-gray-600">Q1 Target:</p>
                          <p className="font-medium text-gray-900">
                            {assignment.assignedTargetQ1 ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Q2 Target:</p>
                          <p className="font-medium text-gray-900">
                            {assignment.assignedTargetQ2 ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Q3 Target:</p>
                          <p className="font-medium text-gray-900">
                            {assignment.assignedTargetQ3 ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Q4 Target:</p>
                          <p className="font-medium text-gray-900">
                            {assignment.assignedTargetQ4 ?? '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <OPCRPaginationFooter
                pageNumber={pageNumber}
                pageSize={pageSize}
                totalPageNumber={totalPageNumber}
                totalRows={kpiAssignments.length}
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
