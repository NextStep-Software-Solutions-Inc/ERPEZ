import { useState, useMemo, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
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
import { useToast } from '@/components/ui/use-toast'

// Sub-KPI examples for each KPI (real sub-KPI names with their dimensions)
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
  onViewDetailStatusChange?: (isOpen: boolean) => void
}

export default function ActivityListSection({
  activities,
  allKPICombinations,
  onActivityCreated,
  onEditActivity,
  showSearchAndFilter = true,
  fiscalYear,
  onViewDetailStatusChange,
}: ActivityListSectionProps) {
  const { toast } = useToast()
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
    dimension?: string
  } | null>(null)
  const [kpiQuarterlyTargets, setKpiQuarterlyTargets] = useState<
    Record<string, Record<string, number>>
  >({})
  const itemsPerPage = 10

  // Notify parent when detail view status changes
  useEffect(() => {
    if (onViewDetailStatusChange) {
      onViewDetailStatusChange(viewDialogOpen)
    }
  }, [viewDialogOpen, onViewDetailStatusChange])

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch = activity.kpi
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [activities, searchTerm])

  // Get activities that don't exist (no activity for that combination)
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

  // Combine configured activities and missing activities into one sorted list
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

  // Group activities by KPI name
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
    // This will be handled by parent
    onEditActivity(updatedActivity)
  }

  const handleOpenTargetsDialog = (
    kpiName: string,
    fiscalYear: number,
    annualTarget?: number,
    dimension?: string,
  ) => {
    setSelectedKPIForTargets({
      name: kpiName,
      fiscalYear,
      annualTarget,
      dimension,
    })
  }

  const getAnnualTargetForKPI = (kpiName: string): number | undefined => {
    const kpiData = allKPICombinations.find((combo) => combo.kpi === kpiName)
    return kpiData?.annualTarget
  }

  const handleSaveQuarterlyTargets = (
    quarterlyTargets: Record<string, number>,
  ) => {
    if (selectedKPIForTargets) {
      // Use dimension if available (per sub-KPI), otherwise use KPI name only
      const key = selectedKPIForTargets.dimension
        ? `${selectedKPIForTargets.name}-${selectedKPIForTargets.dimension}-${selectedKPIForTargets.fiscalYear}`
        : `${selectedKPIForTargets.name}-${selectedKPIForTargets.fiscalYear}`
      setKpiQuarterlyTargets((prev) => ({
        ...prev,
        [key]: quarterlyTargets,
      }))
      setSelectedKPIForTargets(null)
    }
  }

  const getStoredQuarterlyTargets = (
    kpiName: string,
    fiscalYear: number,
    dimension?: string,
  ) => {
    // Try to get dimension-specific targets first (sub-KPI level)
    if (dimension) {
      const dimensionKey = `${kpiName}-${dimension}-${fiscalYear}`
      if (kpiQuarterlyTargets[dimensionKey]) {
        return kpiQuarterlyTargets[dimensionKey]
      }
    }
    // Fall back to KPI-level targets
    const key = `${kpiName}-${fiscalYear}`
    return kpiQuarterlyTargets[key] || {}
  }

  // Calculate completion status with step indicators
  const completionStatus = useMemo(() => {
    const kpiGroups = groupedByKPI

    // Check activity completion for each KPI
    const kpiActivityStatus = kpiGroups.map((kpiGroup) => ({
      kpiName: kpiGroup.kpiName,
      hasActivity: kpiGroup.items.every((item) => item.isConfigured),
      activityCount: kpiGroup.items.filter((item) => item.isConfigured).length,
      totalCount: kpiGroup.items.length,
    }))

    // Check quarterly target completion
    const kpiTargetStatus = kpiGroups.map((kpiGroup) => {
      const key = `${kpiGroup.kpiName}-${fiscalYear}`
      const hasTargets = !!kpiQuarterlyTargets[key]
      return {
        kpiName: kpiGroup.kpiName,
        hasTargets,
      }
    })

    const allActivityComplete = kpiActivityStatus.every((k) => k.hasActivity)
    const allTargetsComplete = kpiTargetStatus.every((k) => k.hasTargets)
    const isComplete = allActivityComplete && allTargetsComplete

    const incompleteActivities = kpiActivityStatus.filter((k) => !k.hasActivity)
    const incompleteTargets = kpiTargetStatus.filter((k) => !k.hasTargets)

    return {
      isComplete,
      allActivityComplete,
      allTargetsComplete,
      totalKpis: kpiGroups.length,
      kpiActivityStatus,
      kpiTargetStatus,
      incompleteActivities,
      incompleteTargets,
    }
  }, [groupedByKPI, kpiQuarterlyTargets, fiscalYear])

  return (
    <>
      {/* Show detail page if viewing activity */}
      {viewDialogOpen && viewingActivity ? (
        <ActivityDetailPage
          item={viewingActivity}
          quarterlyTargets={
            fiscalYear
              ? getStoredQuarterlyTargets(
                  viewingActivity.kpi,
                  fiscalYear,
                  viewingActivity.dimension,
                )
              : {}
          }
          fiscalYear={fiscalYear}
          onBack={() => {
            setViewDialogOpen(false)
            setViewingActivity(null)
          }}
        />
      ) : (
        <>
          {/* Edit Dialog */}
          <EditActivityDialog
            activity={editingActivity}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onActivityUpdated={handleActivityUpdated}
          />

          {/* KPI Quarterly Targets Dialog */}
          {selectedKPIForTargets && (
            <KPITargetsDialog
              open={!!selectedKPIForTargets}
              kpiName={selectedKPIForTargets.name}
              fiscalYear={selectedKPIForTargets.fiscalYear}
              annualTarget={selectedKPIForTargets.annualTarget ?? null}
              existingQuarterlyTargets={getStoredQuarterlyTargets(
                selectedKPIForTargets.name,
                selectedKPIForTargets.fiscalYear,
                selectedKPIForTargets.dimension,
              )}
              onClose={() => setSelectedKPIForTargets(null)}
              onSave={handleSaveQuarterlyTargets}
            />
          )}

          <div className="space-y-6">
            {/* Completion Status Alert */}
            {!completionStatus.isComplete && (
              <div
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${'border-amber-200 bg-amber-50'}`}
              >
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">
                    ⚠ OPCR Incomplete
                  </p>
                </div>
              </div>
            )}

            {completionStatus.isComplete && (
              <div
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${'border-green-200 bg-green-50'}`}
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    ✓ OPCR Ready for Submission
                  </p>
                </div>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 h-auto"
                  onClick={() => {
                    toast({
                      title: 'Success',
                      description: 'OPCR has been submitted successfully!',
                      color: 'success',
                    })
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Submit
                </Button>
              </div>
            )}
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

                  // Each sub-KPI has its own target configuration
                  // Check which sub-KPIs have targets set
                  const configuredWithTargets = kpiGroup.items.filter(
                    (item) => {
                      const key = `${item.kpi}-${item.dimension}-${fiscalYear}`
                      return item.isConfigured && !!kpiQuarterlyTargets[key]
                    },
                  ).length

                  // KPI header status: shows progress (e.g., 2/3 configured, 1/3 with targets)
                  const allSubKpisConfigured = configuredCount === totalCount
                  const allSubKpisWithTargets =
                    configuredWithTargets === totalCount
                  const isKpiComplete =
                    allSubKpisConfigured && allSubKpisWithTargets

                  return (
                    <div
                      key={kpiGroup.kpiName}
                      className={`border-2 rounded-lg overflow-hidden transition-all ${
                        isKpiComplete
                          ? 'border-green-200 bg-green-50'
                          : 'border-amber-200 bg-amber-50'
                      }`}
                    >
                      {/* KPI Header - Accordion Trigger */}
                      <button
                        onClick={() => toggleKPIExpanded(kpiGroup.kpiName)}
                        className="w-full bg-opacity-50 hover:bg-opacity-70 transition-colors p-4 flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Left Indicator - Checkmark for completion, Clock for pending */}
                          <div className="flex-shrink-0">
                            {isKpiComplete ? (
                              <div className="bg-green-100 border-2 border-green-300 rounded-lg p-2 flex items-center justify-center">
                                <CheckCircle2 className="text-green-600 w-5 h-5" />
                              </div>
                            ) : (
                              <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-2 flex items-center justify-center">
                                <Clock className="text-amber-600 w-5 h-5" />
                              </div>
                            )}
                          </div>

                          {/* KPI Name and Step Indicators */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-base font-bold text-gray-900">
                                {kpiGroup.kpiName}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {configuredWithTargets} of {totalCount} sub-KPIs
                              </Badge>
                            </div>

                            {/* Step Indicators for this KPI - Removed for cleaner look */}
                            <div className="flex items-center gap-2">
                              {/* Status indicators hidden - see full details on expand */}
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Actions and Chevron */}
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          {/* Activity Configuration - Show Add or Edit button */}
                          {configuredCount === 0 ? (
                            <CreateActivityDialog
                              triggerClassName="text-amber-700 border-amber-300 hover:bg-amber-100"
                              triggerVariant="outline"
                              triggerSize="sm"
                              defaultKpi={kpiGroup.kpiName}
                              defaultDimension=""
                              onActivityCreated={onActivityCreated}
                            />
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleEditActivity(kpiGroup.items[0])
                              }
                              className="border-green-300 text-green-700 hover:bg-green-100"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit Activity
                            </Button>
                          )}

                          {/* Targets Configuration - Show Set or Edit button */}
                          {configuredCount > 0 &&
                            fiscalYear &&
                            (() => {
                              // Check if this KPI has any targets set (at KPI level, not per sub-KPI)
                              const kpiTargetKey = `${kpiGroup.kpiName}-${fiscalYear}`
                              const hasKPITargets =
                                !!kpiQuarterlyTargets[kpiTargetKey]

                              return hasKPITargets ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleOpenTargetsDialog(
                                      kpiGroup.kpiName,
                                      fiscalYear,
                                      getAnnualTargetForKPI(kpiGroup.kpiName),
                                    )
                                  }
                                  className="border-green-300 text-green-700 hover:bg-green-100"
                                >
                                  <Target className="w-3 h-3 mr-1" />
                                  Edit Targets
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleOpenTargetsDialog(
                                      kpiGroup.kpiName,
                                      fiscalYear,
                                      getAnnualTargetForKPI(kpiGroup.kpiName),
                                    )
                                  }
                                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                >
                                  <Target className="w-3 h-3 mr-1" />
                                  Set Targets
                                </Button>
                              )
                            })()}

                          {/* More Actions Dropdown - View Details */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="w-4 h-4" />
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
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </button>

                      {/* KPI Details - Accordion Content */}
                      {isExpanded && (
                        <div
                          className={`bg-white bg-opacity-70 border-t-2 p-4 space-y-3 ${
                            isKpiComplete
                              ? 'border-green-300'
                              : 'border-amber-300'
                          }`}
                        >
                          {kpiGroup.items.map((item, idx) => {
                            const iconConfig = getDimensionIconConfig(
                              item.dimension,
                            )
                            const IconComponent = iconConfig.icon
                            // Get sub-KPI name for this dimension
                            const subKpiData = (
                              KPI_SUB_KPIS[kpiGroup.kpiName] || []
                            ).find((sk) => sk.dimension === item.dimension)
                            const subKpiName =
                              subKpiData?.name || item.dimension

                            // Each sub-KPI has its own target configuration
                            const subKpiTargetKey = `${item.kpi}-${item.dimension}-${fiscalYear}`
                            const subKpiHasTargets =
                              !!kpiQuarterlyTargets[subKpiTargetKey]

                            return (
                              <div
                                key={`${kpiGroup.kpiName}-${idx}`}
                                className={`border-2 rounded-lg p-4 transition-all ${
                                  item.isConfigured
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-amber-200 bg-amber-50'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  {/* Left Section - Icon and Sub-KPI Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-3 mb-3">
                                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-2 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <IconComponent className="text-blue-600 w-4 h-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm">
                                          {subKpiName}
                                        </h4>
                                      </div>
                                    </div>

                                    {/* Activity Status with Step Indicator */}
                                    <div
                                      className={`border-2 rounded-lg p-3 mb-3 ${
                                        item.isConfigured
                                          ? 'border-green-300 bg-green-100 bg-opacity-40'
                                          : 'border-amber-300 bg-amber-100 bg-opacity-40'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1">
                                          <span
                                            className={`text-sm font-semibold ${
                                              item.isConfigured
                                                ? 'text-green-800'
                                                : 'text-amber-800'
                                            }`}
                                          >
                                            {item.isConfigured
                                              ? '✓ Activity Configured'
                                              : 'No activity configured'}
                                          </span>
                                        </div>
                                        {!item.isConfigured && (
                                          <CreateActivityDialog
                                            triggerClassName={
                                              item.isConfigured
                                                ? ''
                                                : 'text-amber-700 border-amber-300 hover:bg-amber-100'
                                            }
                                            triggerVariant="outline"
                                            triggerSize="sm"
                                            defaultKpi={item.kpi}
                                            defaultDimension={item.dimension}
                                            onActivityCreated={
                                              onActivityCreated
                                            }
                                          />
                                        )}
                                        {item.isConfigured && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleEditActivity(item)
                                            }
                                            className="border-green-300 text-green-700 hover:bg-green-100"
                                          >
                                            <Edit className="w-3 h-3 mr-1" />
                                            Edit Activity
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Target Status with Step Indicator */}
                                    <div
                                      className={`border-2 rounded-lg p-3 ${
                                        !item.isConfigured
                                          ? 'border-gray-300 bg-gray-100 bg-opacity-40 opacity-50'
                                          : subKpiHasTargets
                                            ? 'border-green-300 bg-green-100 bg-opacity-40'
                                            : 'border-blue-300 bg-blue-100 bg-opacity-40'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1">
                                          <span
                                            className={`text-sm font-semibold ${
                                              !item.isConfigured
                                                ? 'text-gray-600'
                                                : subKpiHasTargets
                                                  ? 'text-green-800'
                                                  : 'text-blue-800'
                                            }`}
                                          >
                                            {!item.isConfigured
                                              ? 'Locked (complete activity first)'
                                              : subKpiHasTargets
                                                ? '✓ Quarterly Targets Set'
                                                : 'Quarterly Targets Pending'}
                                          </span>
                                        </div>
                                        {item.isConfigured && fiscalYear && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleOpenTargetsDialog(
                                                item.kpi,
                                                fiscalYear,
                                                getAnnualTargetForKPI(item.kpi),
                                                item.dimension,
                                              )
                                            }
                                            className={
                                              subKpiHasTargets
                                                ? 'border-green-300 text-green-700 hover:bg-green-100'
                                                : 'border-blue-300 text-blue-700 hover:bg-blue-100'
                                            }
                                          >
                                            <Target className="w-3 h-3 mr-1" />
                                            {subKpiHasTargets
                                              ? 'Edit'
                                              : 'Set'}{' '}
                                            Targets
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Section - Actions */}
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                        >
                                          <MoreHorizontal className="w-4 h-4" />
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
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
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
