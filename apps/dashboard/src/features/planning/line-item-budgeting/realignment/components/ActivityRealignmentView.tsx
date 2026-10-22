import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import { useRealignmentStore } from '../store/realignmentStore'
import { calculateActivityTotal } from '../utils/realignmentExport'
import type { ChangeIndicator, ExpenditureType, ItemOfExpenditure, BudgetItem } from '../types/realignment.types'
import api from '@/services/api'
import { adaptApiActivitiesToFrontend } from '../utils/realignmentMapper'
import { ActivityRealignmentCard } from './ActivityRealignmentCard'
import { RealignmentAddActivityDialog } from '../dialogs/RealignmentAddActivityDialog'
import { RealignmentAddBudgetItemDialog } from '../dialogs/RealignmentAddBudgetItemDialog'
import { RealignmentDeleteConfirmDialog, type DeleteContext } from '../dialogs/RealignmentDeleteConfirmDialog'
import { Badge } from '@/components/ui/badge'
import type { LIBActivity } from '../../line-item-budget/types'
import type { Details } from '../../line-item-budget/types/type.lib-activity'

export function ActivityRealignmentView() {
  const {
    editMode,
    selectedFiscalYear,
    selectedWfpId,
    selectedSource,
    viewingVersion,
    compareWithVersion,
    editingItemId,
    activitiesByWfpYear,
    opcrActivitiesByYear,
    activitiesVersions,
    opcrVersions,
    activeLibId,
    activeLib,
    activities,
    handleStartItemEdit,
    handleCancelItemEdit,
    setActivities,
    activeOpcrData,
    activeWfpData,
  } = useRealignmentStore()


  const reloadActivities = async () => {
    if (!activeLibId) return
    try {
      const res = await api.get<{ data: LIBActivity[] }>(`/lib-activities`, {
        params: { filters: `lineItemBudgetId==${activeLibId}` },
      })
      const activitiesData = res.data?.data || []

      await Promise.all(
        activitiesData.map(async (act) => {
          const detailsRes = await api.get<{ data: Details[] }>(`/line-item-budget-details`, {
            params: {
              filters: `lineItemBudgetId==${activeLibId},lineItemBudgetActivityId==${act.id}`,
            },
          })
          act.details = detailsRes.data?.data || []
        })
      )

      const mapped = adaptApiActivitiesToFrontend(activitiesData)
      setActivities(mapped)
    } catch (err) {
      console.error('Failed to reload activities:', err)
    }
  }

  // Local UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedActivities, setExpandedActivities] = useState<string[]>([])
  const [expandedExpTypes, setExpandedExpTypes] = useState<string[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Dialog Controls
  const [showAddActivityDialog, setShowAddActivityDialog] = useState(false)
  const [showAddBudgetItemDialog, setShowAddBudgetItemDialog] = useState(false)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)

  // Contexts for adding/deleting
  const [addContext, setAddContext] = useState<{
    activityId: string
  } | null>(null)
  const [deleteContext, setDeleteContext] = useState<DeleteContext | null>(null)

  // Resolve current active activities tree based on versioning
  const versions = activeLibId !== null
    ? (activeLib?.sourceType === 'OPCR'
      ? opcrVersions[selectedFiscalYear] || []
      : activitiesVersions[selectedFiscalYear]?.[activeLibId] || [])
    : (selectedSource === 'opcr'
      ? opcrVersions[selectedFiscalYear] || []
      : activitiesVersions[selectedFiscalYear]?.[selectedWfpId] || [])

  const activeActivities = activeLibId !== null
    ? activities
    : (selectedSource === 'opcr'
      ? opcrActivitiesByYear[selectedFiscalYear] || []
      : activitiesByWfpYear[selectedFiscalYear]?.[selectedWfpId] || [])

  const currentActivities = viewingVersion !== null
    ? versions.find((v) => v.version === viewingVersion)?.activities || []
    : activeActivities

  // Filter activities based on search query
  const displayedActivities = currentActivities.filter((act) => {
    if (!searchQuery.trim()) return true
    return (
      act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.expenditureTypes.some((exp) =>
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
    return ioe.items.reduce((sum, item) => sum + (item.isDeleted ? 0 : item.total), 0)
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

  // Change detection indicators
  const getActivityChangeIndicator = (activityId: string): ChangeIndicator => {
    if (!compareWithVersion || !viewingVersion) return 'unchanged'
    const curV = versions.find((v) => v.version === Math.max(viewingVersion, compareWithVersion))
    const prevV = versions.find((v) => v.version === Math.min(viewingVersion, compareWithVersion))
    if (!curV || !prevV) return 'unchanged'

    const curAct = curV.activities.find((a) => a.id === activityId)
    const prevAct = prevV.activities.find((a) => a.id === activityId)

    if (!prevAct && curAct) return 'added'
    if (!curAct && prevAct) return 'deleted'
    if (curAct && prevAct) {
      return calculateActivityTotal(curAct) !== calculateActivityTotal(prevAct)
        ? 'edited'
        : 'unchanged'
    }
    return 'unchanged'
  }

  const getExpTypeChangeIndicator = (activityId: string, expTypeId: string): ChangeIndicator => {
    if (!compareWithVersion || !viewingVersion) return 'unchanged'
    const curV = versions.find((v) => v.version === Math.max(viewingVersion, compareWithVersion))
    const prevV = versions.find((v) => v.version === Math.min(viewingVersion, compareWithVersion))
    if (!curV || !prevV) return 'unchanged'

    const curAct = curV.activities.find((a) => a.id === activityId)
    const prevAct = prevV.activities.find((a) => a.id === activityId)
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
    if (!compareWithVersion || !viewingVersion) return 'unchanged'
    const curV = versions.find((v) => v.version === Math.max(viewingVersion, compareWithVersion))
    const prevV = versions.find((v) => v.version === Math.min(viewingVersion, compareWithVersion))
    if (!curV || !prevV) return 'unchanged'

    const curAct = curV.activities.find((a) => a.id === activityId)
    const prevAct = prevV.activities.find((a) => a.id === activityId)
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
    if (!compareWithVersion || !viewingVersion) return 'unchanged'
    const curV = versions.find((v) => v.version === Math.max(viewingVersion, compareWithVersion))
    const prevV = versions.find((v) => v.version === Math.min(viewingVersion, compareWithVersion))
    if (!curV || !prevV) return 'unchanged'

    const curAct = curV.activities.find((a) => a.id === activityId)
    const prevAct = prevV.activities.find((a) => a.id === activityId)
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
    if (compareWithVersion && viewingVersion) {
      const curV = versions.find((v) => v.version === Math.max(viewingVersion, compareWithVersion))
      const prevV = versions.find((v) => v.version === Math.min(viewingVersion, compareWithVersion))
      if (curV && prevV) {
        const prevAct = prevV.activities.find((a) => a.id === activityId)
        const prevExp = prevAct?.expenditureTypes.find((e) => e.id === expTypeId)
        const prevIoe = prevExp?.itemsOfExpenditure.find((i) => i.id === ioeId)
        if (prevIoe) {
          prevIoe.items.forEach((prevSubItem) => {
            if (!subItemsToRender.some((bItem) => bItem.id === prevSubItem.id)) {
              subItemsToRender.push(prevSubItem)
            }
          })
        }
      }
    }
    return subItemsToRender
  }

  const getChangeColor = (indicator: ChangeIndicator) => {
    switch (indicator) {
      case 'added':
        return 'bg-green-50/40 border-l-4 border-l-green-500 border border-green-200 shadow-sm'
      case 'deleted':
        return 'bg-red-50/40 border-l-4 border-l-red-500 border border-red-200 shadow-sm'
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
      added: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓', label: 'Added' },
      deleted: { bg: 'bg-red-100', text: 'text-red-700', icon: '✕', label: 'Deleted' },
      edited: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '◆', label: 'Edited' },
      unchanged: { bg: 'bg-slate-100', text: 'text-slate-600', icon: '○', label: 'Unchanged' },
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

  return (
    <div className="space-y-4">
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
          {editMode && (
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
              editMode={editMode}
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
              handleStartItemEdit={handleStartItemEdit}
              handleCancelItemEdit={handleCancelItemEdit}
              onDeleteRequest={(_expTypeId, _itemId, bItem) => {
                setDeleteContext({
                  type: 'budget',
                  activityId: activity.id,
                  budgetId: bItem.id,
                  detailIds: bItem.detailIds,
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
      {showAddActivityDialog && activeLibId && (
        <RealignmentAddActivityDialog
          open={showAddActivityDialog}
          onOpenChange={setShowAddActivityDialog}
          activeLibId={activeLibId}
          sourceType={activeLib?.sourceType as 'OPCR' | 'WFP'}
          activeOpcrData={activeOpcrData || undefined}
          activeWfpData={activeWfpData || undefined}
          onSuccess={reloadActivities}
        />
      )}

      {showAddBudgetItemDialog && addContext?.activityId && (
        <RealignmentAddBudgetItemDialog
          open={showAddBudgetItemDialog}
          onOpenChange={setShowAddBudgetItemDialog}
          activeLibId={activeLibId!}
          activityId={addContext.activityId}
          wfpObjectiveActivityId={activities.find((a) => a.id === addContext.activityId)?.wfpObjectiveActivityId}
          sourceType={activeLib?.sourceType as 'OPCR' | 'WFP'}
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
