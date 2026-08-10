import { useMemo, useState } from 'react'
import { Search, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { KpiActionMenu } from '@/components/KpiActionMenu'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { FYActiveKpi } from '@/features/planning/fiscal-year-and-policies/fy-active-kpi/types/types'
import { KPIAssignment } from '@/features/planning/kpi-assignment/types'

interface KPIAssignedMapViewProps {
  assignments: KPIAssignment[]
  allKPIs: FYActiveKpi[]
  isLoading: boolean
  onViewKPI: (kpi: FYActiveKpi) => void
}

interface GroupedKPI {
  parent: FYActiveKpi | null
  kpi: FYActiveKpi
  isSubKpi: boolean
}

export function KPIAssignedMapView({
  assignments,
  allKPIs,
  isLoading,
  onViewKPI,
}: KPIAssignedMapViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const navigation = useNavigate({ from: '/v2/commitments' })
  const searchParams = useSearch({ from: '/v2/commitments/' })

  // Map assignments to their KPI data and organize by parent
  const groupedKPIs = useMemo(() => {
    const assignedKPIIds = new Set(assignments.map((a) => a.fyActiveKPIId))
    const assignedKPIs = allKPIs.filter((kpi) => assignedKPIIds.has(kpi.id))

    // Filter by search term
    const filtered = assignedKPIs.filter(
      (kpi) =>
        kpi.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kpi.code?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Separate parents and children
    const parentKPIs = filtered.filter((kpi) => !kpi.parentKPIId)
    const childKPIsByParent = new Map<string, FYActiveKpi[]>()

    filtered
      .filter((kpi) => kpi.parentKPIId)
      .forEach((child) => {
        const parentId = child.parentKPIId!
        if (!childKPIsByParent.has(parentId)) {
          childKPIsByParent.set(parentId, [])
        }
        childKPIsByParent.get(parentId)!.push(child)
      })

    // Build grouped structure
    const groups: GroupedKPI[] = []

    parentKPIs.forEach((parent) => {
      // Add parent
      groups.push({
        parent: null,
        kpi: parent,
        isSubKpi: false,
      })

      // Add children
      const children = childKPIsByParent.get(parent.id) || []
      children.forEach((child) => {
        groups.push({
          parent,
          kpi: child,
          isSubKpi: true,
        })
      })
    })

    return groups
  }, [assignments, allKPIs, searchTerm])

  const toggleGroup = (parentId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId)
    } else {
      newExpanded.add(parentId)
    }
    setExpandedGroups(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-2 text-gray-500">Loading assignments...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search KPI by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {/* KPI List */}
      {groupedKPIs.length > 0 ? (
        <div className="space-y-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {groupedKPIs.map((item) => {
            const isParent = !item.isSubKpi
            const isExpanded = expandedGroups.has(item.kpi.id)
            const hasChildren =
              groupedKPIs.some((g) => g.parent?.id === item.kpi.id) && isParent

            if (isParent) {
              return (
                <div key={item.kpi.id} className="border-b last:border-b-0">
                  {/* Parent KPI Row - Accordion Header */}
                  <div
                    onClick={() => hasChildren && toggleGroup(item.kpi.id)}
                    className={`group flex items-center justify-between px-4 py-3 transition-colors cursor-pointer ${
                      hasChildren ? 'hover:bg-gray-50' : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-center flex-1 min-w-0 gap-3">
                      {/* Expand/Collapse Arrow */}
                      {hasChildren ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleGroup(item.kpi.id)
                          }}
                          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <svg
                            className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      ) : (
                        <div className="w-6 flex-shrink-0" />
                      )}

                      {/* KPI Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">
                            {item.kpi.code}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                          {item.kpi.name}
                        </p>
                      </div>
                    </div>

                    {/* Right Side - Badges & Actions */}
                    <div
                      className="flex items-center gap-2 ml-4 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Badge
                        variant="soft"
                        className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] h-5 py-0 px-2"
                      >
                        KPI
                      </Badge>
                      <Badge
                        variant="soft"
                        className="bg-green-50 text-green-700 border-green-200 text-[10px] h-5 py-0 px-2"
                      >
                        Assigned
                      </Badge>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <KpiActionMenu
                          onView={() => {
                            navigation({
                              search: {
                                ...searchParams,
                                kpiId: item.kpi.id,
                              },
                            })
                            onViewKPI(item.kpi)
                          }}
                          isSubKpi={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Accordion Content - Child KPIs */}
                  {hasChildren && isExpanded && (
                    <div className="bg-gray-50 border-t border-gray-100 divide-y divide-gray-100">
                      {groupedKPIs
                        .filter((g) => g.parent?.id === item.kpi.id)
                        .map((child) => (
                          <div
                            key={child.kpi.id}
                            className="group flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center flex-1 min-w-0 gap-3 pl-6">
                              {/* Sub-KPI Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">
                                    {child.kpi.code}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-gray-800 truncate leading-tight">
                                  {child.kpi.name}
                                </p>
                              </div>
                            </div>

                            {/* Right Side - Badge & Actions */}
                            <div
                              className="flex items-center gap-2 ml-4 flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Badge
                                variant="soft"
                                className="bg-green-50 text-green-700 border-green-200 text-[10px] h-5 py-0 px-2"
                              >
                                Sub-KPI
                              </Badge>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigation({
                                      search: {
                                        ...searchParams,
                                        kpiId: child.kpi.id,
                                      },
                                    })
                                    onViewKPI(child.kpi)
                                  }}
                                  className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  View Details
                                </Button>
                                <Popover>
                                  <PopoverTrigger
                                    asChild
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 hover:bg-gray-200"
                                    >
                                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-40 p-0"
                                    align="end"
                                  >
                                    <KpiActionMenu
                                      onView={() => {
                                        navigation({
                                          search: {
                                            ...searchParams,
                                            kpiId: child.kpi.id,
                                          },
                                        })
                                        onViewKPI(child.kpi)
                                      }}
                                      isSubKpi={true}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )
            }
            return null
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <div className="p-3 bg-gray-100 rounded-full mb-3">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">
            No KPIs assigned
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm
              ? `No KPIs match your search for "${searchTerm}"`
              : 'No KPIs have been assigned to your office yet.'}
          </p>
          {searchTerm && (
            <Button
              variant="ghost"
              onClick={() => setSearchTerm('')}
              className="mt-2 text-blue-600 hover:text-blue-700 hover:bg-transparent p-0 h-auto font-normal"
            >
              Clear search
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
