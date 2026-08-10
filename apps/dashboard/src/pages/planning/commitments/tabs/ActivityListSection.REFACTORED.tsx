import { useState, useMemo } from 'react'
import {
  Search,
  BarChart3,
  Eye,
  Edit,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import DebouncedInput from '@/components/ui/DebouncedInput'
import { CreateActivityDialog } from '../../../../features/planning/opcr/dialogs/CreateOPCRActivityDialog'
import { ActivityDetailPage } from './ActivityDetailPage'
import { EditActivityDialog } from './EditActivityDialog'
import { KPITargetsDialog } from './KPITargetsDialog'

// KPI to Dimension mapping
const KPI_DIMENSIONS: Record<string, string[]> = {
  'Cost Reduction': ['Quality', 'Efficiency', 'Timeliness'],
  'Customer Satisfaction': ['Quality', 'Efficiency', 'Timeliness'],
  'Process Improvement': ['Quality', 'Efficiency', 'Timeliness'],
  'Market Share': ['Quality', 'Efficiency', 'Timeliness'],
  'Revenue Growth': ['Quality', 'Efficiency', 'Timeliness'],
  'Employee Retention': ['Quality', 'Efficiency', 'Timeliness'],
  'Innovation Index': ['Quality', 'Efficiency', 'Timeliness'],
  'Service Quality': ['Quality', 'Efficiency', 'Timeliness'],
  'Operational Efficiency': ['Quality', 'Efficiency', 'Timeliness'],
  'Financial Performance': ['Quality', 'Efficiency', 'Timeliness'],
}

// Sub-KPI examples
const KPI_SUB_KPIS: Record<string, { name: string; dimension: string }[]> = {
  'Cost Reduction': [
    { name: 'Operational Expense Reduction', dimension: 'Quality' },
    { name: 'Resource Utilization Optimization', dimension: 'Efficiency' },
    { name: 'Budget Cycle Completion', dimension: 'Timeliness' },
  ],
  'Customer Satisfaction': [
    { name: 'Service Quality Rating', dimension: 'Quality' },
    { name: 'Customer Issue Resolution Rate', dimension: 'Efficiency' },
    { name: 'Response Time to Inquiries', dimension: 'Timeliness' },
  ],
  'Process Improvement': [
    { name: 'Process Defect Rate', dimension: 'Quality' },
    { name: 'Process Cycle Time Reduction', dimension: 'Efficiency' },
    { name: 'Project Milestone Delivery', dimension: 'Timeliness' },
  ],
  'Market Share': [
    { name: 'Product Quality Index', dimension: 'Quality' },
    { name: 'Market Reach Expansion', dimension: 'Efficiency' },
    { name: 'Market Entry Timeline', dimension: 'Timeliness' },
  ],
}

interface ActivityListSectionProps {
  activities: any[]
  allKPICombinations: {
    kpi: string
    dimension: string
    annualTarget?: number
  }[]
  onActivityCreated: (activity: any) => void
  onViewActivity: (activity: any) => void
  onEditActivity: (activity: any) => void
  showSearchAndFilter?: boolean
  fiscalYear?: number
}

export default function ActivityListSection({
  activities,
  allKPICombinations,
  onActivityCreated,
  onViewActivity,
  onEditActivity,
  showSearchAndFilter = true,
  fiscalYear,
}: ActivityListSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingActivity, setViewingActivity] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [expandedKPIs, setExpandedKPIs] = useState<Set<string>>(new Set())
  const [selectedKPIForTargets, setSelectedKPIForTargets] = useState<{
    name: string
    fiscalYear: number
    annualTarget?: number
  } | null>(null)
  const [kpiQuarterlyTargets, setKpiQuarterlyTargets] = useState<
    Record<string, Record<string, number>>
  >({})
  const itemsPerPage = 10

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch = activity.kpi
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [activities, searchTerm])

  const missingActivities = useMemo(() => {
    return allKPICombinations.filter((combination) => {
      const matchesSearch = combination.kpi
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      return (
        !activities.some(
          (activity) =>
            activity.kpi === combination.kpi &&
            activity.dimension === combination.dimension,
        ) && matchesSearch
      )
    })
  }, [activities, allKPICombinations, searchTerm])

  const allActivityItems = useMemo(() => {
    const combined = [
      ...filteredActivities.map((activity) => ({
        ...activity,
        isConfigured: true,
      })),
      ...missingActivities.map((missing) => ({
        kpi: missing.kpi,
        dimension: missing.dimension,
        isConfigured: false,
      })),
    ]
    return combined.sort((a, b) => a.kpi.localeCompare(b.kpi))
  }, [filteredActivities, missingActivities])

  const groupedByKPI = useMemo(() => {
    const groups: { [key: string]: typeof allActivityItems } = {}
    allActivityItems.forEach((item) => {
      if (!groups[item.kpi]) {
        groups[item.kpi] = []
      }
      groups[item.kpi].push(item)
    })
    return Object.entries(groups).map(([kpiName, items]) => ({
      kpiName,
      items: items.sort((a, b) => a.dimension.localeCompare(b.dimension)),
    }))
  }, [allActivityItems])

  const toggleKPIExpanded = (kpiName: string) => {
    const newExpanded = new Set(expandedKPIs)
    if (newExpanded.has(kpiName)) {
      newExpanded.delete(kpiName)
    } else {
      newExpanded.add(kpiName)
    }
    setExpandedKPIs(newExpanded)
  }

  const totalPages = Math.ceil(groupedByKPI.length / itemsPerPage)

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return groupedByKPI.slice(startIndex, endIndex)
  }, [groupedByKPI, currentPage])

  const getDimensionIconConfig = (indicator: string) => {
    switch (indicator) {
      case 'Quality':
        return {
          color: 'bg-green-50',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200',
          icon: BarChart3,
        }
      case 'Efficiency':
        return {
          color: 'bg-blue-50',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          icon: BarChart3,
        }
      case 'Timeliness':
        return {
          color: 'bg-purple-50',
          iconColor: 'text-purple-600',
          borderColor: 'border-purple-200',
          icon: BarChart3,
        }
      default:
        return {
          color: 'bg-gray-50',
          iconColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          icon: BarChart3,
        }
    }
  }

  const handleViewActivity = (activity: any) => {
    setViewingActivity(activity)
    setViewDialogOpen(true)
  }

  const handleEditActivity = (activity: any) => {
    setEditingActivity(activity)
    setEditDialogOpen(true)
  }

  const handleActivityUpdated = (updatedActivity: any) => {
    onEditActivity(updatedActivity)
  }

  const handleOpenTargetsDialog = (
    kpiName: string,
    fiscalYear: number,
    annualTarget?: number,
  ) => {
    setSelectedKPIForTargets({ name: kpiName, fiscalYear, annualTarget })
  }

  const getAnnualTargetForKPI = (kpiName: string): number | undefined => {
    const kpiData = allKPICombinations.find((combo) => combo.kpi === kpiName)
    return kpiData?.annualTarget
  }

  const handleSaveQuarterlyTargets = (
    quarterlyTargets: Record<string, number>,
  ) => {
    if (selectedKPIForTargets) {
      const key = `${selectedKPIForTargets.name}-${selectedKPIForTargets.fiscalYear}`
      setKpiQuarterlyTargets((prev) => ({
        ...prev,
        [key]: quarterlyTargets,
      }))
      setSelectedKPIForTargets(null)
    }
  }

  const getStoredQuarterlyTargets = (kpiName: string, fiscalYear: number) => {
    const key = `${kpiName}-${fiscalYear}`
    return kpiQuarterlyTargets[key] || {}
  }

  const completionStatus = useMemo(() => {
    const allParentKpisConfigured = groupedByKPI.every((kpiGroup) => {
      return kpiGroup.items.every((item) => item.isConfigured)
    })

    const totalKpis = groupedByKPI.length
    const completedKpis = groupedByKPI.filter((kpiGroup) =>
      kpiGroup.items.every((item) => item.isConfigured),
    ).length

    return {
      isComplete: allParentKpisConfigured,
      completedKpis,
      totalKpis,
      incompleteKpis: groupedByKPI.filter(
        (kpiGroup) => !kpiGroup.items.every((item) => item.isConfigured),
      ),
    }
  }, [groupedByKPI])

  return (
    <>
      {viewDialogOpen && viewingActivity ? (
        <ActivityDetailPage
          item={viewingActivity}
          onBack={() => {
            setViewDialogOpen(false)
            setViewingActivity(null)
          }}
        />
      ) : (
        <>
          <EditActivityDialog
            activity={editingActivity}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onActivityUpdated={handleActivityUpdated}
          />

          {selectedKPIForTargets && (
            <KPITargetsDialog
              open={!!selectedKPIForTargets}
              kpiName={selectedKPIForTargets.name}
              fiscalYear={selectedKPIForTargets.fiscalYear}
              annualTarget={selectedKPIForTargets.annualTarget ?? null}
              existingQuarterlyTargets={getStoredQuarterlyTargets(
                selectedKPIForTargets.name,
                selectedKPIForTargets.fiscalYear,
              )}
              onClose={() => setSelectedKPIForTargets(null)}
              onSave={handleSaveQuarterlyTargets}
            />
          )}

          <div className="space-y-6">
            {/* Completion Status Header Card */}
            <div
              className={`rounded-xl border-2 p-6 transition-all ${
                completionStatus.isComplete
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                  : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {completionStatus.isComplete ? (
                  <div className="bg-green-100 rounded-full p-3 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                ) : (
                  <div className="bg-amber-100 rounded-full p-3 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h3
                    className={`font-bold text-lg ${completionStatus.isComplete ? 'text-green-900' : 'text-amber-900'}`}
                  >
                    {completionStatus.isComplete
                      ? '✓ OPCR Ready for Submission'
                      : '⚠ OPCR Incomplete'}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${completionStatus.isComplete ? 'text-green-800' : 'text-amber-800'}`}
                  >
                    {completionStatus.completedKpis} of{' '}
                    {completionStatus.totalKpis} KPIs have activities and
                    quarterly targets configured
                  </p>

                  {!completionStatus.isComplete &&
                    completionStatus.incompleteKpis.length > 0 && (
                      <div className="mt-4 space-y-2 bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                          Required Actions:
                        </p>
                        <ul className="text-xs text-amber-800 space-y-1.5">
                          {completionStatus.incompleteKpis.map((kpi) => {
                            const missingCount = kpi.items.filter(
                              (item) => !item.isConfigured,
                            ).length
                            return (
                              <li
                                key={kpi.kpiName}
                                className="flex items-start gap-2"
                              >
                                <span className="text-amber-400 font-bold mt-0.5">
                                  ●
                                </span>
                                <span>
                                  <strong>{kpi.kpiName}:</strong> Add activities
                                  for {missingCount} sub-KPI
                                  {missingCount !== 1 ? 's' : ''}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                </div>
              </div>

              {completionStatus.isComplete && (
                <div className="mt-4 flex justify-end">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                    onClick={() => {
                      alert('OPCR submitted successfully!')
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Submit OPCR
                  </Button>
                </div>
              )}
            </div>

            {/* Toolbar */}
            {showSearchAndFilter && (
              <div className="flex items-center w-full gap-4 flex-wrap">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <DebouncedInput
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                    className="w-full pl-10"
                  />
                </div>
              </div>
            )}

            {/* KPIs Accordion List */}
            {paginatedData.length > 0 ? (
              <div className="space-y-4">
                {paginatedData.map((kpiGroup) => {
                  const isExpanded = expandedKPIs.has(kpiGroup.kpiName)
                  const configuredCount = kpiGroup.items.filter(
                    (item) => item.isConfigured,
                  ).length
                  const totalCount = kpiGroup.items.length
                  const hasQuarterlyTargets = !!getStoredQuarterlyTargets(
                    kpiGroup.kpiName,
                    fiscalYear || 0,
                  ).Q1

                  return (
                    <div
                      key={kpiGroup.kpiName}
                      className="border-2 border-gray-200 hover:border-primary-300 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md bg-white"
                    >
                      {/* KPI Header - Accordion Trigger */}
                      <button
                        onClick={() => toggleKPIExpanded(kpiGroup.kpiName)}
                        className="w-full hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-50/50 transition-all p-5 flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                          {/* Status Indicator Badge */}
                          <div className="flex-shrink-0">
                            {configuredCount === totalCount &&
                            hasQuarterlyTargets ? (
                              <div className="bg-green-100 border-2 border-green-500 rounded-full p-2.5 flex items-center justify-center">
                                <CheckCircle2 className="text-green-600 w-5 h-5" />
                              </div>
                            ) : (
                              <div className="bg-amber-100 border-2 border-amber-500 rounded-full p-2.5 flex items-center justify-center">
                                <Clock className="text-amber-600 w-5 h-5" />
                              </div>
                            )}
                          </div>

                          {/* KPI Name and Progress */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-gray-900 mb-2">
                              {kpiGroup.kpiName}
                            </h3>

                            {/* Step Indicators */}
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              {/* Step 1: Activity */}
                              <div
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${
                                  configuredCount === totalCount
                                    ? 'bg-green-50 border-green-300 text-green-700'
                                    : 'bg-amber-50 border-amber-300 text-amber-700'
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    configuredCount === totalCount
                                      ? 'bg-green-500'
                                      : 'bg-amber-500'
                                  }`}
                                ></div>
                                Step 1: Activity
                              </div>

                              {/* Arrow */}
                              <div className="text-gray-300">→</div>

                              {/* Step 2: Quarterly Targets */}
                              <div
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${
                                  hasQuarterlyTargets
                                    ? 'bg-green-50 border-green-300 text-green-700'
                                    : 'bg-gray-100 border-gray-300 text-gray-600'
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    hasQuarterlyTargets
                                      ? 'bg-green-500'
                                      : 'bg-gray-400'
                                  }`}
                                ></div>
                                Step 2: Targets
                              </div>
                            </div>

                            <p className="text-xs text-gray-600 font-medium">
                              {configuredCount} of {totalCount} activities
                              configured{' '}
                              {hasQuarterlyTargets && '• Quarterly targets set'}
                            </p>
                          </div>
                        </div>

                        {/* Right Section - Actions and Chevron */}
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                          {configuredCount > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                >
                                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer"
                                  onClick={() =>
                                    handleViewActivity(kpiGroup.items[0])
                                  }
                                >
                                  <Eye className="w-4 h-4" />
                                  View Activity
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer"
                                  onClick={() =>
                                    handleEditActivity(kpiGroup.items[0])
                                  }
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit Activity
                                </DropdownMenuItem>
                                {fiscalYear && (
                                  <DropdownMenuItem
                                    className="gap-2 cursor-pointer"
                                    onClick={() =>
                                      handleOpenTargetsDialog(
                                        kpiGroup.kpiName,
                                        fiscalYear,
                                        getAnnualTargetForKPI(kpiGroup.kpiName),
                                      )
                                    }
                                  >
                                    <Target className="w-4 h-4" />
                                    {hasQuarterlyTargets ? 'Edit' : 'Set'}{' '}
                                    Quarterly Targets
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </button>

                      {/* KPI Details - Accordion Content */}
                      {isExpanded && (
                        <div className="bg-gradient-to-b from-gray-50 to-white border-t-2 border-gray-200 p-5 space-y-4">
                          <div className="space-y-3">
                            {kpiGroup.items.map((item, idx) => {
                              const iconConfig = getDimensionIconConfig(
                                item.dimension,
                              )
                              const IconComponent = iconConfig.icon
                              const subKpiData = (
                                KPI_SUB_KPIS[kpiGroup.kpiName] || []
                              ).find((sk) => sk.dimension === item.dimension)
                              const subKpiName =
                                subKpiData?.name || item.dimension

                              return (
                                <div
                                  key={`${kpiGroup.kpiName}-${idx}`}
                                  className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-all"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    {/* Left Section - Icon and Sub-KPI Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start gap-3">
                                        <div
                                          className={`${iconConfig.color} border-2 ${iconConfig.borderColor} rounded-lg p-2 flex items-center justify-center flex-shrink-0 mt-0.5`}
                                        >
                                          <IconComponent
                                            className={`${iconConfig.iconColor} w-4 h-4`}
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-gray-900 text-sm">
                                            {subKpiName}
                                          </h4>
                                          <p className="text-xs text-gray-500 mt-0.5 font-medium uppercase tracking-wide">
                                            {item.dimension} Dimension
                                          </p>
                                        </div>
                                      </div>

                                      {/* Step Progress Indicators for Sub-KPI */}
                                      <div className="mt-3 flex items-center gap-2">
                                        {/* Activity Status */}
                                        <div
                                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${
                                            item.isConfigured
                                              ? 'bg-green-50 text-green-700 border-green-200'
                                              : 'bg-amber-50 text-amber-700 border-amber-200'
                                          }`}
                                        >
                                          <div
                                            className={`w-1.5 h-1.5 rounded-full ${
                                              item.isConfigured
                                                ? 'bg-green-500'
                                                : 'bg-amber-500'
                                            }`}
                                          ></div>
                                          {item.isConfigured
                                            ? 'Activity ✓'
                                            : 'No Activity'}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right Section - Actions */}
                                    {item.isConfigured && (
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0 hover:bg-gray-100"
                                            >
                                              <MoreHorizontal className="w-4 h-4 text-gray-600" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                              className="gap-2 cursor-pointer"
                                              onClick={() =>
                                                handleViewActivity(item)
                                              }
                                            >
                                              <Eye className="w-4 h-4" />
                                              View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              className="gap-2 cursor-pointer"
                                              onClick={() =>
                                                handleEditActivity(item)
                                              }
                                            >
                                              <Edit className="w-4 h-4" />
                                              Edit Activity
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    )}

                                    {/* Add Activity Button if Missing */}
                                    {!item.isConfigured && (
                                      <CreateActivityDialog
                                        triggerClassName="text-amber-600 border-amber-300 hover:bg-amber-50 font-semibold h-8"
                                        triggerVariant="outline"
                                        triggerSize="sm"
                                        defaultKpi={item.kpi}
                                        defaultDimension={item.dimension}
                                        onActivityCreated={onActivityCreated}
                                      />
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Set Quarterly Targets CTA - Only show if all activities are configured */}
                          {configuredCount === totalCount &&
                            !hasQuarterlyTargets && (
                              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-start justify-between gap-4 mt-4">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-blue-900 text-sm">
                                    Step 2: Set Quarterly Targets
                                  </h4>
                                  <p className="text-xs text-blue-800 mt-1">
                                    All activities are configured. Now set the
                                    quarterly targets for {kpiGroup.kpiName}.
                                  </p>
                                </div>
                                {fiscalYear && (
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex-shrink-0"
                                    onClick={() =>
                                      handleOpenTargetsDialog(
                                        kpiGroup.kpiName,
                                        fiscalYear,
                                        getAnnualTargetForKPI(kpiGroup.kpiName),
                                      )
                                    }
                                  >
                                    <Target className="w-3.5 h-3.5 mr-2" />
                                    Set Targets
                                  </Button>
                                )}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No KPIs found</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? 'Try adjusting your search'
                    : 'No KPIs available'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing{' '}
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    groupedByKPI.length,
                  )}{' '}
                  to {Math.min(currentPage * itemsPerPage, groupedByKPI.length)}{' '}
                  of {groupedByKPI.length} KPIs
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
