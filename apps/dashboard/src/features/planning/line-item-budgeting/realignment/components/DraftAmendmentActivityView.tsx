import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Search, Loader2 } from 'lucide-react'
import { calculateActivityTotal } from '../utils/realignmentExport'
import type {
  Activity,
  ChangeIndicator,
  ExpenditureType,
  ItemOfExpenditure,
  BudgetItem,
} from '../types/realignment.types'
import api from '@/services/api'
import { adaptApiActivitiesToFrontend } from '../utils/realignmentMapper'
import { ActivityRealignmentCard } from './ActivityRealignmentCard'
import { getOriginalBudgetItemTotal } from '../utils/diffEngine'
import { RealignmentAddActivityDialog } from '../dialogs/RealignmentAddActivityDialog'
import { RealignmentAddBudgetItemDialog } from '../dialogs/RealignmentAddBudgetItemDialog'
import {
  RealignmentDeleteConfirmDialog,
  type DeleteContext,
} from '../dialogs/RealignmentDeleteConfirmDialog'
import { Badge } from '@/components/ui/badge'
import type {
  LIBDetails,
  LIBActivity,
} from '../../line-item-budget/types'
import type { Details } from '../../line-item-budget/types/type.lib-activity'
import type { OPCRDetails } from '@/features/planning/opcr'
import type { WFPDetails } from '@/components/features/planning/wfp'
import { LineItemBudgetDetails } from '../../line-item-budget-details/types/types'

interface DraftAmendmentActivityViewProps {
  draftLibId: string
  draftLib: LIBDetails
  approvedActivities: Activity[]
  opcrData: OPCRDetails | null
  wfpData: WFPDetails | null
  readOnly?: boolean
}

export function DraftAmendmentActivityView({
  draftLibId,
  draftLib,
  approvedActivities,
  opcrData,
  wfpData,
  readOnly = false,
}: DraftAmendmentActivityViewProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Local UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedActivities, setExpandedActivities] = useState<string[]>([])
  const [expandedExpTypes, setExpandedExpTypes] = useState<string[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  // Dialog Controls
  const [showAddActivityDialog, setShowAddActivityDialog] = useState(false)
  const [showAddBudgetItemDialog, setShowAddBudgetItemDialog] = useState(false)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)

  // Contexts for adding/deleting
  const [addContext, setAddContext] = useState<{
    activityId: string
  } | null>(null)
  const [deleteContext, setDeleteContext] = useState<DeleteContext | null>(null)

  const reloadActivities = async () => {
    setIsLoading(true)
    try {
      const res = await api.get<{ data: LIBActivity[] }>(`/lib-activities`, {
        params: { filters: `lineItemBudgetId==${draftLibId}` },
      })
      const activitiesData = res.data?.data || []

      await Promise.all(
        activitiesData.map(async (act) => {
          const detailsRes = await api.get<{ data: LineItemBudgetDetails[] }>(
            `/line-item-budget-details`,
            {
              params: {
                filters: `lineItemBudgetId==${draftLibId},lineItemBudgetActivityId==${act.id}`,
              },
            },
          )
          act.details = detailsRes.data?.data || []
        }),
      )

      const mapped = adaptApiActivitiesToFrontend(activitiesData)
      setActivities(mapped)
    } catch (err) {
      console.error('Failed to reload draft activities:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    reloadActivities()
  }, [draftLibId])

  // Filter activities based on search query
  const displayedActivities = activities.filter((act) => {
    if (!searchQuery.trim()) return true
    return (
      act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.expenditureTypes.some(
        (exp) =>
          exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.itemsOfExpenditure.some((ioe) =>
            ioe.name.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      )
    )
  })

  // Calculation helpers
  const calculateExpTypeTotal = (exp: ExpenditureType): number => {
    return exp.itemsOfExpenditure.reduce(
      (sum, ioe) => sum + calculateItemTotal(ioe),
      0,
    )
  }

  const calculateItemTotal = (ioe: ItemOfExpenditure): number => {
    return ioe.items.reduce(
      (sum, item) => sum + (item.isDeleted ? 0 : item.total),
      0,
    )
  }

  // Toggles
  const toggleActivity = (id: string) => {
    setExpandedActivities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const toggleExpType = (id: string) => {
    setExpandedExpTypes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const toggleItem = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  // Change detection indicators relative to approvedActivities
  const getActivityChangeIndicator = (activityId: string): ChangeIndicator => {
    const curAct = activities.find((a) => a.id === activityId)
    const prevAct = approvedActivities.find((a) => a.id === activityId)

    if (!prevAct && curAct) return 'added'
    if (!curAct && prevAct) return 'deleted'
    if (curAct && prevAct) {
      return calculateActivityTotal(curAct) !== calculateActivityTotal(prevAct)
        ? 'edited'
        : 'unchanged'
    }
    return 'unchanged'
  }

  const getExpTypeChangeIndicator = (
    activityId: string,
    expTypeId: string,
  ): ChangeIndicator => {
    const curAct = activities.find((a) => a.id === activityId)
    const prevAct = approvedActivities.find((a) => a.id === activityId)
    if (!prevAct || !curAct) return 'unchanged'

    const curExp = curAct.expenditureTypes.find((e) => e.id === expTypeId)
    const prevExp = prevAct.expenditureTypes.find((e) => e.id === expTypeId)

    if (!prevExp && curExp) return 'added'
    if (!curExp && prevExp) return 'deleted'
    if (!curExp || !prevExp) return 'unchanged'

    return calculateExpTypeTotal(curExp) !== calculateExpTypeTotal(prevExp)
      ? 'edited'
      : 'unchanged'
  }

  const getItemChangeIndicator = (
    activityId: string,
    expTypeId: string,
    itemId: string,
  ): ChangeIndicator => {
    const curAct = activities.find((a) => a.id === activityId)
    const prevAct = approvedActivities.find((a) => a.id === activityId)
    if (!prevAct || !curAct) return 'unchanged'

    const curExp = curAct.expenditureTypes.find((e) => e.id === expTypeId)
    const prevExp = prevAct.expenditureTypes.find((e) => e.id === expTypeId)
    if (!prevExp || !curExp) return 'unchanged'

    const curItem = curExp.itemsOfExpenditure.find((i) => i.id === itemId)
    const prevItem = prevExp.itemsOfExpenditure.find((i) => i.id === itemId)

    if (!prevItem && curItem) return 'added'
    if (!curItem && prevItem) return 'deleted'
    if (!curItem || !prevItem) return 'unchanged'

    return calculateItemTotal(curItem) !== calculateItemTotal(prevItem)
      ? 'edited'
      : 'unchanged'
  }

  const getBudgetItemChangeIndicator = (
    activityId: string,
    expTypeId: string,
    itemId: string,
    budgetItemId: string,
  ): ChangeIndicator => {
    const curAct = activities.find((a) => a.id === activityId)
    const prevAct = approvedActivities.find((a) => a.id === activityId)
    if (!prevAct || !curAct) return 'unchanged'

    const curExp = curAct.expenditureTypes.find((e) => e.id === expTypeId)
    const prevExp = prevAct.expenditureTypes.find((e) => e.id === expTypeId)
    if (!prevExp || !curExp) return 'unchanged'

    const curItem = curExp.itemsOfExpenditure.find((i) => i.id === itemId)
    const prevItem = prevExp.itemsOfExpenditure.find((i) => i.id === itemId)
    if (!prevItem || !curItem) return 'unchanged'

    const curB = curItem.items.find((b) => b.id === budgetItemId)
    const prevB = prevItem.items.find((b) => b.id === budgetItemId)

    if (!prevB && curB) return 'added'
    if (!curB && prevB) return 'deleted'
    if (!curB || !prevB) return 'unchanged'

    return curB.total !== prevB.total || curB.description !== prevB.description
      ? 'edited'
      : 'unchanged'
  }

  const getSubItemsToRender = (
    activityId: string,
    expTypeId: string,
    ioeId: string,
    currentItems: BudgetItem[],
  ): BudgetItem[] => {
    const subItemsToRender = [...currentItems]
    const prevAct = approvedActivities.find((a) => a.id === activityId)
    const prevExp = prevAct?.expenditureTypes.find((e) => e.id === expTypeId)
    const prevIoe = prevExp?.itemsOfExpenditure.find((i) => i.id === ioeId)
    if (prevIoe) {
      prevIoe.items.forEach((prevSubItem) => {
        if (!subItemsToRender.some((bItem) => bItem.id === prevSubItem.id)) {
          subItemsToRender.push(prevSubItem)
        }
      })
    }
    return subItemsToRender
  }

  const getChangeColor = (indicator: ChangeIndicator) => {
    switch (indicator) {
      case 'added':
        return 'bg-green-50/40 border-l-4 border-l-green-500 border border-green-200 shadow-sm'
      case 'deleted':
        return 'bg-red-50/40 border-l-4 border-l-red-500 border border-red-200 shadow-sm animate-pulse'
      case 'edited':
        return 'bg-yellow-50/40 border-l-4 border-l-yellow-500 border border-yellow-200 shadow-sm'
      default:
        return ''
    }
  }

  const getChangeIndicatorBadge = (indicator: ChangeIndicator) => {
    if (indicator === 'unchanged') return null
    const badges: Record<
      ChangeIndicator,
      { bg: string; text: string; icon: string; label: string }
    > = {
      added: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: '✓',
        label: 'Added',
      },
      deleted: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: '✕',
        label: 'Deleted',
      },
      edited: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: '◆',
        label: 'Edited',
      },
      unchanged: {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        icon: '○',
        label: 'Unchanged',
      },
    }
    const badge = badges[indicator]
    if (!badge) return null
    return (
      <Badge
        variant="outline"
        className={`${badge.bg} ${badge.text} border border-current text-[10px] font-semibold px-1.5 py-0.5 gap-1`}
      >
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </Badge>
    )
  }

  const getExpTypeColorScheme = (type: 'PS' | 'MOOE' | 'CO') => {
    const schemes = {
      PS: {
        bg: 'bg-green-50/50',
        border: 'border-green-200',
        badge: 'bg-green-100 text-green-700 border-green-200',
        text: 'text-green-900',
        icon: 'text-green-600',
        header: 'hover:bg-green-50',
      },
      MOOE: {
        bg: 'bg-blue-50/50',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-700 border-blue-200',
        text: 'text-blue-900',
        icon: 'text-blue-600',
        header: 'hover:bg-blue-50',
      },
      CO: {
        bg: 'bg-purple-50/50',
        border: 'border-purple-200',
        badge: 'bg-purple-100 text-purple-700 border-purple-200',
        text: 'text-purple-900',
        icon: 'text-purple-600',
        header: 'hover:bg-purple-50',
      },
    }
    return schemes[type] || schemes.MOOE
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-medium">
          Loading draft realignment...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4 border-t border-dashed border-slate-200">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h4 className="text-sm font-bold text-slate-800">
            {readOnly ? 'Baseline Approved Reference' : 'Active Realignment Proposal'}
          </h4>
          {!readOnly ? (
            <p className="text-[11px] text-slate-500">
              Make changes to this clone. Changes will take effect once submitted
              and approved.
            </p>
          ) : (
            <p className="text-[11px] text-slate-500">
              View the approved baseline budget allocation. This reference is read-only.
            </p>
          )}
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search operational entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-white"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
          {!readOnly && (
            <Button
              onClick={() => {
                setShowAddActivityDialog(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Activity
            </Button>
          )}
        </div>
      </div>

      {/* Main activities cards */}
      <div className="space-y-4">
        {displayedActivities.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-sm">
            No operational activities registered for this period
          </div>
        ) : (
          displayedActivities.map((activity) => (
            <ActivityRealignmentCard
              key={activity.id}
              activity={activity}
              isExpanded={expandedActivities.includes(activity.id)}
              toggleActivity={() => toggleActivity(activity.id)}
              actChangeIndicator={getActivityChangeIndicator(activity.id)}
              getChangeColor={getChangeColor}
              getChangeIndicatorBadge={getChangeIndicatorBadge}
              calculateActivityTotal={calculateActivityTotal}
              editMode={!readOnly}
              readOnly={readOnly}
              getOriginalBudgetItemTotal={(budgetItemId) =>
                getOriginalBudgetItemTotal(approvedActivities, budgetItemId, activities)
              }
              onAddLineItem={() => {
                setAddContext({ activityId: activity.id })
                setShowAddBudgetItemDialog(true)
              }}
              onDeleteActivity={() => {
                setDeleteContext({
                  type: 'activity',
                  activityId: activity.id,
                  name: activity.name,
                })
                setShowDeleteConfirmDialog(true)
              }}
              expandedExpTypes={expandedExpTypes}
              toggleExpType={toggleExpType}
              getExpTypeChangeIndicator={getExpTypeChangeIndicator}
              calculateExpTypeTotal={calculateExpTypeTotal}
              getExpTypeColorScheme={getExpTypeColorScheme}
              expandedItems={expandedItems}
              toggleItem={toggleItem}
              getItemChangeIndicator={getItemChangeIndicator}
              getBudgetItemChangeIndicator={getBudgetItemChangeIndicator}
              calculateItemTotal={calculateItemTotal}
              editingItemId={editingItemId}
              handleStartItemEdit={(_id, bItem) => setEditingItemId(bItem.id)}
              handleCancelItemEdit={() => setEditingItemId(null)}
              onDeleteRequest={(_expTypeId, _itemId, bItem) => {
                setDeleteContext({
                  type: 'budget',
                  activityId: activity.id,
                  budgetId: bItem.id,
                  name: bItem.description,
                })
                setShowDeleteConfirmDialog(true)
              }}
              getSubItemsToRender={getSubItemsToRender}
              reloadActivities={reloadActivities}
            />
          ))
        )}
      </div>

      {/* dialog wrappers */}
      {showAddActivityDialog && (
        <RealignmentAddActivityDialog
          open={showAddActivityDialog}
          onOpenChange={setShowAddActivityDialog}
          activeLibId={draftLibId}
          sourceType={draftLib.sourceType as 'OPCR' | 'WFP'}
          activeOpcrData={opcrData || undefined}
          activeWfpData={wfpData || undefined}
          onSuccess={reloadActivities}
        />
      )}

      {showAddBudgetItemDialog && addContext?.activityId && (
        <RealignmentAddBudgetItemDialog
          open={showAddBudgetItemDialog}
          onOpenChange={setShowAddBudgetItemDialog}
          activeLibId={draftLibId}
          activityId={addContext.activityId}
          wfpObjectiveActivityId={
            activities.find((a) => a.id === addContext.activityId)
              ?.wfpObjectiveActivityId
          }
          sourceType={draftLib.sourceType as 'OPCR' | 'WFP'}
          onSuccess={reloadActivities}
        />
      )}

      {showDeleteConfirmDialog && deleteContext && (
        <RealignmentDeleteConfirmDialog
          open={showDeleteConfirmDialog}
          onOpenChange={setShowDeleteConfirmDialog}
          deleteContext={deleteContext}
          onSuccess={reloadActivities}
        />
      )}
    </div>
  )
}
