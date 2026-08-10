import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Loader2, History, Info, Layers, CheckCircle } from 'lucide-react'
import { useRealignmentStore } from '../store/realignmentStore'
import { useLIBHistory } from '@/features/planning/line-item-budgeting/line-item-budget/hooks/useLIBActions'
import type { LIBActivity } from '@/features/planning/line-item-budgeting/line-item-budget/types'
import type {
  Activity,
  ObjectGroup,
} from '../types/realignment.types'
import { calculateActivityTotal } from '../utils/realignmentExport'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { adaptApiActivitiesToFrontend, adaptApiOrphansToProjectGroups } from '../utils/realignmentMapper'
import { diffActivities, diffProjectGroups } from '../utils/diffEngine'
import type { ActivityDiff, ObjectGroupDiff } from '../utils/diffEngine'
import { useLIB, useLIBActivities } from '../hooks/useLIBQueries'
import { getLineItemBudgetDetailsRequest } from '../../line-item-budget-details/hooks/getLineItemBudgetDetailsRequest'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import type { LineItemBudgetDetails } from '../../line-item-budget-details/types/types'

export type VersionListItem = {
  id: string
  version: number
  status: string
  updatedAt: string
  totalAmount: number
  isDraft: boolean
}

interface VersionHistoryPanelProps {
  onClose: () => void
  libId?: string | null
  proposedLibId?: string | null
  proposedTotalAmount?: number
  hideHeader?: boolean
}

interface FetchedDetailItem {
  scope: string
  totalAmount: number
  libNumber?: string
  status?: string
  updatedAt?: string
  activities?: Activity[]
  objectGroups?: ObjectGroup[]
}

const useLineItemBudgetDetails = createQueryHookFromTemplate(getLineItemBudgetDetailsRequest)

const EMPTY_ACTIVITIES: LIBActivity[] = []
const EMPTY_DETAILS: LineItemBudgetDetails[] = []

function useBudgetTree(budgetId: string | null | undefined) {
  const { data: libRes, isLoading: isLibLoading, isError: isLibError } = useLIB({
    pathParams: { id: budgetId || '' },
    queryParams: {},
    enabled: !!budgetId,
  })
  const libData = libRes?.data

  const scope = libData?.scope || 'Activity'

  const { data: activitiesRes, isLoading: isActivitiesLoading } = useLIBActivities({
    pathParams: {},
    queryParams: {
      filters: `lineItemBudgetId==${budgetId}`,
      pageSize: 1000,
      pageNumber: 1,
    },
    enabled: !!budgetId && !!libData && scope === 'Activity',
  })
  const activitiesData = activitiesRes?.data || EMPTY_ACTIVITIES

  const { data: detailsRes, isLoading: isDetailsLoading } = useLineItemBudgetDetails({
    pathParams: {},
    queryParams: {
      filters: `lineItemBudgetId==${budgetId}`,
      pageSize: 1000,
      pageNumber: 1,
    },
    enabled: !!budgetId && !!libData && scope === 'Activity',
  })
  const detailsData = detailsRes?.data || EMPTY_DETAILS

  const isLoading = isLibLoading || (scope === 'Activity' && (isActivitiesLoading || isDetailsLoading))

  const tree = useMemo<FetchedDetailItem | null>(() => {
    if (!budgetId || !libData) return null

    if (scope === 'Project') {
      const orphansData = libData.orphanDetails || []
      const objectGroups = adaptApiOrphansToProjectGroups(orphansData)
      return {
        scope,
        objectGroups,
        totalAmount: libData.totalAmount || 0,
        libNumber: libData.libNumber,
        status: libData.status || 'Approved',
        updatedAt: libData.updatedAt || libData.createdAt || '',
      }
    } else {
      const clonedActivities = activitiesData.map((act) => ({
        ...act,
        details: detailsData.filter((d) => d.lineItemBudgetActivityId === act.id),
      }))

      const activities = adaptApiActivitiesToFrontend(clonedActivities)
      return {
        scope,
        activities,
        totalAmount: libData.totalAmount || 0,
        libNumber: libData.libNumber,
        status: libData.status || 'Approved',
        updatedAt: libData.updatedAt || libData.createdAt || '',
      }
    }
  }, [budgetId, libData, scope, activitiesData, detailsData])

  return {
    data: tree,
    isLoading,
    isError: isLibError,
  }
}

export function VersionHistoryPanel({ onClose, libId, proposedLibId, proposedTotalAmount, hideHeader }: VersionHistoryPanelProps) {
  const { activeLib } = useRealignmentStore()

  // Tabs selection
  const [activeTab, setActiveTab] = useState<'audit' | 'compare'>('audit')

  // Selected item in Left timeline list
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)

  // Compare Tab selections
  const [compareBaseId, setCompareBaseId] = useState<string>('')
  const [compareTargetId, setCompareTargetId] = useState<string>('draft')
  const [compareOnlyChanges, setCompareOnlyChanges] = useState(true)

  // Fetch version history list from API if libId is supplied
  const { data: apiHistoryResponse, isLoading: isHistoryLoading } = useLIBHistory({
    pathParams: { id: libId || '' },
    queryParams: {},
    enabled: !!libId,
  })

  const apiVersions = apiHistoryResponse?.data

  // Build the combined timeline list
  const combinedTimeline = useMemo<VersionListItem[]>(() => {
    const list: VersionListItem[] = []

    if (proposedLibId) {
      list.push({
        id: 'draft',
        version: 0, // Indicates draft/current proposed
        status: 'Draft',
        updatedAt: new Date().toISOString(),
        totalAmount: activeLib?.totalAmount ?? proposedTotalAmount ?? 0,
        isDraft: true,
      })
    }

    if (apiVersions) {
      apiVersions.forEach((v) => {
        list.push({
          id: v.id,
          version: v.version,
          status: v.status || 'Approved',
          updatedAt: v.updatedAt || v.createdAt,
          totalAmount: v.totalAmount,
          isDraft: false,
        })
      })
    }

    // Sort: Draft at top, then descending by version number
    return list.sort((a, b) => {
      if (a.isDraft) return -1
      if (b.isDraft) return 1
      return b.version - a.version
    })
  }, [apiVersions, proposedLibId, activeLib, proposedTotalAmount])

  // Default selection when timeline loads
  useEffect(() => {
    if (combinedTimeline.length > 0 && !selectedHistoryId) {
      setSelectedHistoryId(combinedTimeline[0].id)
    }
  }, [combinedTimeline, selectedHistoryId])

  // Set default Compare dropdown selections
  useEffect(() => {
    if (combinedTimeline.length > 1) {
      setCompareBaseId(combinedTimeline[1].id)
      setCompareTargetId(combinedTimeline[0].id)
    } else if (combinedTimeline.length === 1) {
      setCompareBaseId(combinedTimeline[0].id)
      setCompareTargetId(combinedTimeline[0].id)
    }
  }, [combinedTimeline])

  // Compute selected IDs to fetch
  const selectedHistoryFetchId = selectedHistoryId === 'draft' ? proposedLibId : selectedHistoryId
  const compareBaseFetchId = compareBaseId === 'draft' ? proposedLibId : compareBaseId
  const compareTargetFetchId = compareTargetId === 'draft' ? proposedLibId : compareTargetId

  // Reactive data fetching via TanStack Query composition hook
  const { data: selectedDetails, isLoading: isFetchingSelectedDetails } = useBudgetTree(
    activeTab === 'audit' ? selectedHistoryFetchId : null
  )

  const { data: baseDetails, isLoading: isFetchingBaseDetails } = useBudgetTree(
    activeTab === 'compare' ? compareBaseFetchId : null
  )

  const { data: targetDetails, isLoading: isFetchingTargetDetails } = useBudgetTree(
    activeTab === 'compare' ? compareTargetFetchId : null
  )

  const isFetchingDetail = isFetchingSelectedDetails || isFetchingBaseDetails || isFetchingTargetDetails

  // Compute differences for Compare tab
  const comparisonDiffs = useMemo(() => {
    if (!compareBaseId || !compareTargetId || !baseDetails || !targetDetails) return null

    if (baseDetails.scope === 'Project' && targetDetails.scope === 'Project') {
      const orig = baseDetails.objectGroups || []
      const prop = targetDetails.objectGroups || []
      return {
        scope: 'Project',
        diffs: diffProjectGroups(orig, prop) as ObjectGroupDiff[],
      }
    } else {
      const orig = baseDetails.activities || []
      const prop = targetDetails.activities || []
      return {
        scope: 'Activity',
        diffs: diffActivities(orig, prop) as ActivityDiff[],
      }
    }
  }, [compareBaseId, compareTargetId, baseDetails, targetDetails])

  // Left Column Render (Chronological Track)
  const renderTimelineTrack = () => {
    return (
      <div className="relative border-l border-slate-200 ml-3.5 pl-5 space-y-4 py-2 max-h-[58vh] overflow-y-auto pr-1">
        {combinedTimeline.map((item) => {
          const isSelected = selectedHistoryId === item.id
          const dotColor = item.isDraft
            ? 'bg-blue-600 ring-blue-100'
            : item.status === 'Approved'
              ? 'bg-emerald-500 ring-emerald-100'
              : 'bg-amber-500 ring-amber-100'

          return (
            <div key={item.id} className="relative group">
              <span
                className={`absolute w-3 h-3 rounded-full -left-[27px] mt-2.5 border-2 border-white ${dotColor} ${isSelected ? 'ring-4' : ''} z-10`}
              />
              <div
                onClick={() => setSelectedHistoryId(item.id)}
                className={`p-3 border rounded-xl shadow-xs hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer bg-white ${isSelected ? 'border-blue-500 border-l-4 border-l-blue-600 bg-slate-50/20' : 'border-slate-200'
                  }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge className={`${item.isDraft ? 'bg-blue-600 hover:bg-blue-600' : 'bg-slate-800 hover:bg-slate-900'} text-white font-extrabold text-[9px] px-1.5 py-0.2`}>
                      {item.isDraft ? 'Draft' : `v${item.version}`}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 font-bold uppercase ${item.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <span className="text-[9px] text-slate-400 flex items-center gap-0.5 font-bold">
                    <Calendar className="w-2.5 h-2.5" />
                    {item.isDraft
                      ? 'Present'
                      : new Date(item.updatedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Budget:</span>
                  <span className="text-[11px] font-extrabold text-slate-800 font-mono">
                    ₱{item.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Render Inspector tree structure (Activity level)
  const renderInspectorActivityTree = (activities: Activity[]) => {
    if (activities.length === 0) {
      return (
        <div className="text-center py-8 text-slate-400 text-xs border border-dashed rounded-xl bg-slate-50">
          No activities allocated in this version.
        </div>
      )
    }

    return (
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {activities.map((act) => (
          <div key={act.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 hover:bg-slate-50 transition-all">
            <div className="flex items-center justify-between border-b pb-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-slate-800">{act.name}</span>
                {act.wfpObjectiveActivityId && (
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-[8px] h-3.5 px-1 py-0">
                    WFP
                  </Badge>
                )}
              </div>
              <span className="text-[11px] text-slate-900 font-extrabold font-mono">
                ₱{calculateActivityTotal(act).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="space-y-3">
              {act.expenditureTypes.map((et) => {
                const totalItems = et.itemsOfExpenditure.flatMap((i) => i.items)
                if (totalItems.length === 0) return null

                return (
                  <div key={et.id} className="pl-2 space-y-1.5">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                      {et.name}
                    </span>
                    <div className="space-y-1">
                      {et.itemsOfExpenditure.map((ioe) =>
                        ioe.items.map((bi) => (
                          <div
                            key={bi.id}
                            className="flex justify-between items-center text-[11px] py-1 border-b border-slate-100 last:border-0 pl-2 hover:bg-slate-100/50 rounded px-1 transition-all"
                          >
                            <span className="text-slate-700 font-medium">{bi.description}</span>
                            <span className="text-slate-600 font-mono text-[10px]">
                              ₱{bi.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render Inspector tree structure (Project level)
  const renderInspectorProjectTree = (groups: ObjectGroup[]) => {
    if (groups.length === 0) {
      return (
        <div className="text-center py-8 text-slate-400 text-xs border border-dashed rounded-xl bg-slate-50">
          No project entries allocated in this version.
        </div>
      )
    }

    return (
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/55 hover:bg-slate-50 transition-all">
            <div className="flex items-center justify-between border-b pb-2 mb-2">
              <span className="font-extrabold text-xs text-slate-800">{group.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">Code: {group.code}</span>
            </div>
            <div className="space-y-3">
              {group.descriptionGroups.map((dg) => (
                <div key={dg.id} className="pl-2 space-y-1.5">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {dg.description}
                  </span>
                  <div className="space-y-1">
                    {dg.items.map((bi) => (
                      <div
                        key={bi.id}
                        className="flex justify-between items-center text-[11px] py-1 border-b border-slate-100 last:border-0 pl-2 hover:bg-slate-100/50 rounded px-1 transition-all"
                      >
                        <span className="text-slate-700 font-medium">{bi.description}</span>
                        <span className="text-slate-600 font-mono text-[10px]">
                          ₱{bi.budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render unified activity diff tree
  const renderCompareActivityTree = (diffs: ActivityDiff[]) => {
    const filteredDiffs = diffs.filter((act) => {
      if (!compareOnlyChanges) return true
      return act.status !== 'unchanged'
    })

    if (filteredDiffs.length === 0) {
      return (
        <div className="text-center py-16 text-slate-400 text-xs border border-dashed rounded-xl bg-slate-50 flex flex-col justify-center items-center gap-2">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
          <span className="font-bold text-slate-600">No budget differences found between these versions.</span>
        </div>
      )
    }

    return (
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {filteredDiffs.map((act) => {
          const actStatusColor =
            act.status === 'added'
              ? 'bg-emerald-50/30 border-emerald-200 text-emerald-955'
              : act.status === 'deleted'
                ? 'bg-rose-50/30 border-rose-200 text-rose-900 line-through'
                : 'bg-amber-50/20 border-amber-200 text-amber-955'

          return (
            <div key={act.id} className={`border rounded-xl p-3.5 hover:shadow-xs transition-all ${actStatusColor}`}>
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">{act.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[8px] font-extrabold uppercase px-1 py-0 h-3.5 ${act.status === 'added'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : act.status === 'deleted'
                        ? 'bg-rose-100 text-rose-800 border-rose-350 line-through'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                  >
                    {act.status}
                  </Badge>
                </div>
                <span className="text-[10px] font-mono font-semibold">
                  ₱{calculateActivityTotal(act).toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                {act.expenditureTypes.map((et) => {
                  const filteredIoe = et.itemsOfExpenditure.filter((ioe) => {
                    if (!compareOnlyChanges) return true
                    return ioe.status !== 'unchanged' || ioe.items.some((i) => i.status !== 'unchanged')
                  })

                  if (filteredIoe.length === 0 && compareOnlyChanges) return null

                  return (
                    <div key={et.id} className="pl-2 space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        {et.name}
                      </span>
                      {filteredIoe.map((ioe) => (
                        <div key={ioe.id} className="pl-2 space-y-1">
                          {ioe.items
                            .filter((item) => {
                              if (!compareOnlyChanges) return true
                              return item.status !== 'unchanged'
                            })
                            .map((item) => {
                              const itemColor =
                                item.status === 'added'
                                  ? 'text-emerald-700 font-semibold'
                                  : item.status === 'deleted'
                                    ? 'text-rose-600 line-through'
                                    : 'text-amber-700'

                              return (
                                <div
                                  key={item.id}
                                  className="flex justify-between items-center text-[11px] py-1 border-b border-slate-100 last:border-0 pl-2 hover:bg-slate-100/50 rounded px-1 transition-all"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span className={itemColor}>{item.description}</span>
                                    <Badge
                                      variant="outline"
                                      className={`text-[8px] h-3.5 px-1 font-bold uppercase ${item.status === 'added'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : item.status === 'deleted'
                                          ? 'bg-rose-50 text-rose-700 border-rose-200 line-through'
                                          : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}
                                    >
                                      {item.status}
                                    </Badge>
                                  </div>
                                  <div className="text-right font-mono text-[10px]">
                                    {item.status === 'modified' && item.originalValues ? (
                                      <span className="text-slate-400">
                                        ₱{item.originalValues.total.toLocaleString()} →{' '}
                                        <span className="text-amber-600 font-semibold">
                                          ₱{item.total.toLocaleString()}
                                        </span>
                                      </span>
                                    ) : (
                                      <span className={itemColor}>₱{item.total.toLocaleString()}</span>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Render unified project diff tree
  const renderCompareProjectTree = (diffs: ObjectGroupDiff[]) => {
    const filteredDiffs = diffs.filter((group) => {
      if (!compareOnlyChanges) return true
      return group.status !== 'unchanged'
    })

    if (filteredDiffs.length === 0) {
      return (
        <div className="text-center py-16 text-slate-400 text-xs border border-dashed rounded-xl bg-slate-50 flex flex-col justify-center items-center gap-2">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
          <span className="font-bold text-slate-600">No budget differences found between these versions.</span>
        </div>
      )
    }

    return (
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {filteredDiffs.map((group) => {
          const groupColor =
            group.status === 'added'
              ? 'bg-emerald-50/30 border-emerald-200 text-emerald-955'
              : group.status === 'deleted'
                ? 'bg-rose-50/30 border-rose-200 text-rose-900 line-through'
                : 'bg-amber-50/20 border-amber-200 text-amber-955'

          return (
            <div key={group.id} className={`border rounded-xl p-3.5 hover:shadow-xs transition-all ${groupColor}`}>
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">{group.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[8px] font-extrabold uppercase px-1 py-0 h-3.5 ${group.status === 'added'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : group.status === 'deleted'
                        ? 'bg-rose-100 text-rose-800 border-rose-350 line-through'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                  >
                    {group.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                {group.descriptionGroups.map((dg) => {
                  const filteredItems = dg.items.filter((item) => {
                    if (!compareOnlyChanges) return true
                    return item.status !== 'unchanged'
                  })

                  if (filteredItems.length === 0 && compareOnlyChanges) return null

                  return (
                    <div key={dg.id} className="pl-2 space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        {dg.description}
                      </span>
                      {filteredItems.map((item) => {
                        const itemColor =
                          item.status === 'added'
                            ? 'text-emerald-700 font-semibold'
                            : item.status === 'deleted'
                              ? 'text-rose-600 line-through'
                              : 'text-amber-700'

                        return (
                          <div
                            key={item.id}
                            className="flex justify-between items-center text-[11px] py-1 border-b border-slate-100 last:border-0 pl-2 hover:bg-slate-100/50 rounded px-1 transition-all"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className={itemColor}>{item.description}</span>
                              <Badge
                                variant="outline"
                                className={`text-[8px] h-3.5 px-1 font-bold uppercase ${item.status === 'added'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : item.status === 'deleted'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 line-through'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                              >
                                {item.status}
                              </Badge>
                            </div>
                            <div className="text-right font-mono text-[10px]">
                              {item.status === 'modified' && item.originalValues ? (
                                <span className="text-slate-400">
                                  ₱{item.originalValues.budget.toLocaleString()} →{' '}
                                  <span className="text-amber-600 font-semibold">
                                    ₱{item.budget.toLocaleString()}
                                  </span>
                                </span>
                              ) : (
                                <span className={itemColor}>₱{item.budget.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Display detail panel for Inspector (timeline selected item)
  const renderInspectorPanel = () => {
    if (!selectedHistoryId) return null
    const details = selectedDetails

    if (isFetchingDetail || !details) {
      return (
        <div className="flex flex-col items-center justify-center h-[52vh] gap-3 text-slate-505">
          <Loader2 className="h-6 w-6 animate-spin text-blue-650" />
          <span className="text-xs font-bold">Loading budget details...</span>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Version Summary Info */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Document ID</span>
              <span className="text-xs font-extrabold text-slate-800 font-mono">{details.libNumber || 'Draft'}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status</span>
              <Badge className="bg-slate-900 text-white font-extrabold text-[9px] uppercase">{details.status}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Updated</span>
              <span className="text-xs font-semibold text-slate-700">
                {new Date(details.updatedAt || '').toLocaleDateString()} at{' '}
                {new Date(details.updatedAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Allocation</span>
              <span className="text-xs font-extrabold text-slate-955 font-mono">
                ₱{details.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Tree Render based on Scope */}
        <div>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2.5 block flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-500" /> Allocated Line Items:
          </span>
          {details.scope === 'Project'
            ? renderInspectorProjectTree(details.objectGroups || [])
            : renderInspectorActivityTree(details.activities || [])}
        </div>
      </div>
    )
  }

  // Display detail panel for Compare Tab
  const renderComparePanel = () => {
    const base = baseDetails
    const target = targetDetails

    if (isFetchingDetail || !base || !target) {
      return (
        <div className="flex flex-col items-center justify-center h-[52vh] gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-blue-655" />
          <span className="text-xs font-bold">Fetching comparison versions...</span>
        </div>
      )
    }

    if (!comparisonDiffs) return null

    return (
      <div className="space-y-4">
        {/* Compare Sub-indicator */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs font-bold text-slate-700 shadow-xs">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Comparing Selected Versions:</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-100 text-slate-700 font-bold">
              {compareBaseId === 'draft' ? 'Draft' : `v${combinedTimeline.find(c => c.id === compareBaseId)?.version}`}
            </Badge>
            <span className="text-slate-400">vs</span>
            <Badge className="bg-indigo-600 text-white font-bold">
              {compareTargetId === 'draft' ? 'Draft' : `v${combinedTimeline.find(c => c.id === compareTargetId)?.version}`}
            </Badge>
          </div>
        </div>

        {/* Render tree diff */}
        <div>
          {comparisonDiffs.scope === 'Project'
            ? renderCompareProjectTree(comparisonDiffs.diffs as ObjectGroupDiff[])
            : renderCompareActivityTree(comparisonDiffs.diffs as ActivityDiff[])}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Panel Header */}
      {!hideHeader && (
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-600" /> Realignment Version Timeline
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
              Explore draft revisions, audit approvals, and run side-by-side split comparisons.
            </p>
          </div>
        </div>
      )}

      {isHistoryLoading ? (
        <div className="flex flex-col items-center justify-center flex-grow py-32 gap-3 text-slate-505">
          <Loader2 className="h-7 w-7 animate-spin text-blue-650" />
          <span className="text-xs font-semibold">Loading version logs...</span>
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'audit' | 'compare')}
          className="flex-grow flex flex-col min-h-0"
        >
          {/* Tabs bar */}
          <div className="px-5 border-b border-slate-100 py-2.5 bg-slate-50/30 flex justify-between items-center">
            <TabsList className="bg-slate-100/80 p-0.5 rounded-lg h-8">
              <TabsTrigger
                value="audit"
                className="text-xs font-bold px-4 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-800"
              >
                Timeline Audit Trail
              </TabsTrigger>
              <TabsTrigger
                value="compare"
                className="text-xs font-bold px-4 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-800"
              >
                Compare Versions
              </TabsTrigger>
            </TabsList>

            {/* Right side controls (contextual to tab) */}
            {activeTab === 'compare' && (
              <div className="flex items-center gap-2 select-none">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
                  Changes Only
                </span>
                <Switch
                  checked={compareOnlyChanges}
                  onCheckedChange={setCompareOnlyChanges}
                  className="scale-90"
                />
              </div>
            )}
          </div>

          {/* Audit tab */}
          <TabsContent value="audit" className="flex-grow flex min-h-0 mt-0">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-[320px_1fr] min-h-0 divide-x divide-slate-100">
              {/* Left timeline */}
              <div className="p-4 overflow-y-auto bg-slate-50/[0.15]">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-3.5 block">
                  Chronological Track
                </span>
                {renderTimelineTrack()}
              </div>

              {/* Right inspector */}
              <div className="p-4 overflow-y-auto bg-white min-h-0">
                {renderInspectorPanel()}
              </div>
            </div>
          </TabsContent>

          {/* Compare tab */}
          <TabsContent value="compare" className="flex-grow flex flex-col min-h-0 mt-0">
            {/* Version selectors */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/[0.1] grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">
                  Base Version (Old reference)
                </label>
                <Select value={compareBaseId} onValueChange={setCompareBaseId}>
                  <SelectTrigger className="h-8.5 w-full bg-white text-xs font-bold border-slate-200">
                    <SelectValue placeholder="Select base version" />
                  </SelectTrigger>
                  <SelectContent className="text-xs font-medium">
                    {combinedTimeline.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="cursor-pointer">
                        {c.isDraft ? 'Current Proposed Draft' : `Version ${c.version} (Total: ₱${c.totalAmount.toLocaleString()})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">
                  Target Version (New reference)
                </label>
                <Select value={compareTargetId} onValueChange={setCompareTargetId}>
                  <SelectTrigger className="h-8.5 w-full bg-white text-xs font-bold border-slate-200">
                    <SelectValue placeholder="Select target version" />
                  </SelectTrigger>
                  <SelectContent className="text-xs font-medium">
                    {combinedTimeline.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="cursor-pointer">
                        {c.isDraft ? 'Current Proposed Draft' : `Version ${c.version} (Total: ₱${c.totalAmount.toLocaleString()})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tree diff viewport */}
            <div className="p-5 overflow-y-auto flex-grow min-h-0 bg-white">
              {renderComparePanel()}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
