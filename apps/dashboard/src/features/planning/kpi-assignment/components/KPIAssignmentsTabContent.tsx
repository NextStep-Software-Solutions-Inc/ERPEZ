import { useMemo, useState } from 'react'
import { ChevronRight, Lock, Search, Filter, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { KPIAssignment } from '../types'
import { FunctionCategory } from '@/features/planning/master-kpi/types'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getKpiAssignmentsRequest } from '../handlers/getKpiAssignmentsRequest'

interface KPIAssignmentsTabContentProps {
  fiscalYearId: string
  functionCategory: FunctionCategory
  officeId?: string
}

interface OfficeGroup {
  id: string
  name: string
  code: string
  assignments: KPIAssignment[]
}
const useKpiAssignments = createQueryHookFromTemplate(getKpiAssignmentsRequest)
export function KPIAssignmentsTabContent({
  fiscalYearId,
  functionCategory,
  officeId,
}: KPIAssignmentsTabContentProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedOffices, setExpandedOffices] = useState<string[]>([])

  const {
    data: assignments,
    isLoading,
    isError,
  } = useKpiAssignments({
    pathParams: {},
    queryParams: {
      filters: `fiscalYearId==${fiscalYearId},functionCategory==${functionCategory}${officeId ? `,officeId==${officeId}` : ''}`,
    },
  })

  const groupedData = useMemo(() => {
    if (!assignments) return []

    // Grouping logic
    const groups = new Map<string, OfficeGroup>()

    assignments?.data.forEach((item) => {
      const officeId = item.officeId
      if (!groups.has(officeId)) {
        groups.set(officeId, {
          id: officeId,
          name: item.officeName || item.office?.name || 'Unknown Office',
          code: item.office?.responsibilityCenterCode || '',
          assignments: [],
        })
      }
      groups.get(officeId)?.assignments.push(item)
    })

    let result = Array.from(groups.values())

    // Search filter (by office name or code)
    if (searchTerm) {
      result = result.filter(
        (group) =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.code.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return result
  }, [assignments, searchTerm])

  const toggleOffice = (officeId: string) => {
    setExpandedOffices((prev) =>
      prev.includes(officeId)
        ? prev.filter((id) => id !== officeId)
        : [...prev, officeId],
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-gray-500">Loading KPI assignments...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-16 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600">
          Failed to load assignments. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by Office..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {groupedData.length > 0 ? (
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {groupedData.map((group) => {
              const isExpanded = expandedOffices.includes(group.id)
              return (
                <div key={group.id}>
                  {/* Office Header */}
                  <div
                    className={`flex items-center gap-4 px-6 py-5 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer group ${
                      isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleOffice(group.id)}
                  >
                    <div className="shrink-0">
                      <ChevronRight
                        className={`h-6 w-6 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        {group.code && (
                          <p className="text-sm font-semibold text-gray-600 shrink-0">
                            {group.code}
                          </p>
                        )}
                        <p className="text-base font-semibold text-gray-900">
                          {group.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-700"
                      >
                        {group.assignments.length} KPIs
                      </Badge>
                    </div>
                  </div>

                  {/* KPIs under Office */}
                  {isExpanded && (
                    <div className="bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                              <th className="px-6 py-3 pl-20">
                                KPI Name / Code
                              </th>
                              <th className="px-6 py-3 text-center">Annual</th>
                              <th className="px-6 py-3 text-center text-xs">
                                Q1
                              </th>
                              <th className="px-6 py-3 text-center text-xs">
                                Q2
                              </th>
                              <th className="px-6 py-3 text-center text-xs">
                                Q3
                              </th>
                              <th className="px-6 py-3 text-center text-xs">
                                Q4
                              </th>
                              <th className="px-6 py-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {group.assignments.map((assignment) => (
                              <tr
                                key={assignment.id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-6 py-4 pl-20">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">
                                      {assignment.fyActiveKPI?.name ||
                                        assignment.MFOPAP?.name ||
                                        'Untitled KPI'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {assignment.fyActiveKPIId}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-blue-600">
                                  {(
                                    assignment.assignedTargetAnnual ?? 0
                                  ).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-center text-gray-600">
                                  {(
                                    assignment.assignedTargetQ1 ?? 0
                                  ).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-center text-gray-600">
                                  {(
                                    assignment.assignedTargetQ2 ?? 0
                                  ).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-center text-gray-600">
                                  {(
                                    assignment.assignedTargetQ3 ?? 0
                                  ).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-center text-gray-600">
                                  {(
                                    assignment.assignedTargetQ4 ?? 0
                                  ).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {assignment.isLocked ? (
                                    <Badge
                                      variant="outline"
                                      className="bg-amber-50 text-amber-700 border-amber-300 gap-1"
                                    >
                                      <Lock className="h-3 w-3" />
                                      Locked
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-50 text-green-700 border-green-300"
                                    >
                                      Draft
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">
            No KPI assignments found for the selected criteria.
          </p>
        </div>
      )}
    </div>
  )
}
