import { useState, useMemo, useCallback } from 'react'
import { Plus, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getPPMPExpenditureItemsRequest } from '../handlers/getPPMPExpenditureItemsRequest'
import { formatCurrency } from '../lib'
import { cn } from '@/lib/utils'
import type {
  PPMPDetails,
  PPMPExpenditureItem,
  PPMPItem,
} from '../types'
import type { LIBDetails } from '@/features/planning/line-item-budgeting/line-item-budget/types'

const usePPMPExpenditureItems = createQueryHookFromTemplate(
  getPPMPExpenditureItemsRequest,
)

interface ProjectLevelPPMPWorkspaceProps {
  ppmp: PPMPDetails
  lib?: LIBDetails | null
  isEditable: boolean
  ExpenditureItemGroupComponent?: React.ComponentType<any>
  onAddItem?: (groupId: string, papCode?: string) => void
  onEditItem?: (item: PPMPItem) => void
  onDeleteItem?: (item: PPMPItem) => void
  onAddGroup?: () => void
  onEditGroup?: (group: PPMPExpenditureItem) => void
  onDeleteGroup?: (group: PPMPExpenditureItem) => void
  onEditAllocations?: (item: PPMPItem) => void
}

export function ProjectLevelPPMPWorkspace({
  ppmp,
  lib,
  isEditable,
  ExpenditureItemGroupComponent,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onEditAllocations,
}: ProjectLevelPPMPWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'schedule'>('items')
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set())

  const toggleItem = useCallback((id: string) => {
    setExpandedItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Query expenditure items tied directly to this Project-level PPMP (PPMPActivityId is null)
  const { data: expenditureItemsResp, isLoading: isExpenditureLoading } =
    usePPMPExpenditureItems({
      pathParams: {},
      queryParams: ppmp?.id ? { filters: `ppmpId==${ppmp.id}` } : {},
      enabled: !!ppmp?.id,
    })

  const expenditureItems = expenditureItemsResp?.data ?? []
  const hasItems = expenditureItems.length > 0

  const serverFetchedCost = useMemo(() => {
    return expenditureItems.reduce((sum, g) => sum + (g.totalCost || 0), 0)
  }, [expenditureItems])

  const totalRegisteredItems = useMemo(() => {
    return ppmp.PPMPItems?.length || 0
  }, [ppmp.PPMPItems])

  const allocatedBudget = ppmp.totalEstimatedBudget || lib?.totalAmount || 0

  return (
    <div className="h-full flex flex-col bg-white border border-default-200 rounded-xl shadow-sm overflow-hidden">
      {/* Workspace Header */}
      <div className="sticky top-0 z-10 bg-white/95 px-5 py-4 border-b border-default-200 flex flex-col md:flex-row md:items-center justify-between gap-3 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-default-900 tracking-tight">
              {ppmp.libName || lib?.name || 'Project-Level Procurement Plan'}
            </h3>
            <span className="text-[10px] font-medium uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              Project Scope
            </span>
          </div>
          <p className="text-xs text-default-500 mt-0.5">
            Allocated Budget:{' '}
            <span className="font-semibold text-default-800">
              {formatCurrency(allocatedBudget)}
            </span>
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-default-100/80 p-0.5 rounded-lg border border-default-200 self-start md:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
              activeTab === 'items'
                ? 'bg-white text-default-900 shadow-sm font-semibold'
                : 'text-default-500 hover:text-default-700',
            )}
          >
            Expenditure Items
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
              activeTab === 'schedule'
                ? 'bg-white text-default-900 shadow-sm font-semibold'
                : 'text-default-500 hover:text-default-700',
            )}
          >
            Monthly Schedule
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 bg-default-50/10">
        {activeTab === 'items' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-default-200 shadow-sm flex-wrap gap-2">
              <div>
                <h4 className="text-xs font-bold text-default-700 uppercase tracking-wider">
                  Expenditure Items
                </h4>
                <p className="text-[10px] text-default-400">
                  Manage procurable and non-procurable items under this project
                </p>
              </div>
              {isEditable && onAddGroup && (
                <Button
                  type="button"
                  size="sm"
                  onClick={onAddGroup}
                  className="h-8 text-xs font-semibold bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5 rounded-lg shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Expenditure Item
                </Button>
              )}
            </div>

            {isExpenditureLoading && expenditureItems.length === 0 ? (
              <div className="flex h-40 items-center justify-center p-10 text-center text-sm text-default-400 bg-default-50 border border-dashed border-default-200 rounded-xl">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-default-300 border-t-primary mr-2" />
                Loading expenditure items...
              </div>
            ) : !hasItems ? (
              <div className="flex h-40 items-center justify-center p-10 text-center text-sm text-default-400 bg-default-50 border border-dashed border-default-200 rounded-xl">
                No expenditure items recorded for this project yet. Click &ldquo;Add Expenditure Item&rdquo; above to create one.
              </div>
            ) : (
              ExpenditureItemGroupComponent && expenditureItems.map((group) => {
                const GroupComp = ExpenditureItemGroupComponent
                return (
                  <GroupComp
                    key={group.id}
                    group={group}
                    expandedItemIds={expandedItemIds}
                    onToggleItem={toggleItem}
                    onAddItem={isEditable ? (groupId: string, papCode?: string) => onAddItem?.(groupId, papCode || lib?.lineItemBudgetActivities?.[0]?.papCode) : undefined}
                    onEditItem={isEditable ? onEditItem : undefined}
                    onDeleteItem={isEditable ? onDeleteItem : undefined}
                    onEditGroup={isEditable ? onEditGroup : undefined}
                    onDeleteGroup={isEditable ? onDeleteGroup : undefined}
                    onEditAllocations={isEditable ? onEditAllocations : undefined}
                  />
                )
              })
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-default-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-default-900">
                  Project Monthly Procurement Schedule
                </h4>
              </div>
              <p className="text-xs text-default-400 mb-4">
                Visual schedule of monthly allocations for this project.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                ].map((month) => {
                  const monthlyTotal = (ppmp.PPMPItemAllocations || [])
                    .filter((a) => a.allocationMonth === month)
                    .reduce((sum, a) => sum + (a.amount || 0), 0)
                  return (
                    <div
                      key={month}
                      className={cn(
                        'p-3 rounded-xl border text-left transition-all',
                        monthlyTotal > 0
                          ? 'border-primary/30 bg-primary/5 shadow-xs'
                          : 'border-default-150 bg-default-50/40 text-default-400',
                      )}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-default-500">
                        {month}
                      </div>
                      <div className="text-sm font-bold text-default-900 mt-1">
                        {formatCurrency(monthlyTotal)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
