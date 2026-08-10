import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Activity, ChangeIndicator, BudgetItem, ItemOfExpenditure, ExpenditureType } from '../types/realignment.types'
import { ExpenditureTypeCard } from './ExpenditureTypeCard'

interface ActivityRealignmentCardProps {
  activity: Activity
  isExpanded: boolean
  toggleActivity: () => void
  actChangeIndicator: ChangeIndicator
  getChangeColor: (indicator: ChangeIndicator) => string
  getChangeIndicatorBadge: (indicator: ChangeIndicator) => React.ReactNode
  calculateActivityTotal: (act: Activity) => number
  editMode: boolean
  readOnly?: boolean
  getOriginalBudgetItemTotal?: (budgetItemId: string) => number | undefined
  onAddLineItem: () => void
  onDeleteActivity: () => void

  // Drilling down props
  expandedExpTypes: string[]
  toggleExpType: (id: string) => void
  getExpTypeChangeIndicator: (activityId: string, expTypeId: string) => ChangeIndicator
  calculateExpTypeTotal: (exp: ExpenditureType) => number
  getExpTypeColorScheme: (type: 'PS' | 'MOOE' | 'CO') => any

  expandedItems: string[]
  toggleItem: (id: string) => void
  getItemChangeIndicator: (activityId: string, expTypeId: string, itemId: string) => ChangeIndicator
  getBudgetItemChangeIndicator: (activityId: string, expTypeId: string, itemId: string, budgetItemId: string) => ChangeIndicator
  calculateItemTotal: (ioe: ItemOfExpenditure) => number
  editingItemId: string | null
  handleStartItemEdit: (id: string, bItem: BudgetItem) => void
  handleCancelItemEdit: () => void
  onDeleteRequest: (expTypeId: string, itemId: string, bItem: BudgetItem) => void
  getSubItemsToRender: (activityId: string, expTypeId: string, ioeId: string, currentItems: BudgetItem[]) => BudgetItem[]
  reloadActivities: () => Promise<void>
}

export function ActivityRealignmentCard({
  activity,
  isExpanded,
  toggleActivity,
  actChangeIndicator,
  getChangeColor,
  getChangeIndicatorBadge,
  calculateActivityTotal,
  editMode,
  readOnly = false,
  getOriginalBudgetItemTotal,
  onAddLineItem,
  onDeleteActivity,

  expandedExpTypes,
  toggleExpType,
  getExpTypeChangeIndicator,
  calculateExpTypeTotal,
  getExpTypeColorScheme,

  expandedItems,
  toggleItem,
  getItemChangeIndicator,
  getBudgetItemChangeIndicator,
  calculateItemTotal,
  editingItemId,
  handleStartItemEdit,
  handleCancelItemEdit,
  onDeleteRequest,
  getSubItemsToRender,
  reloadActivities,
}: ActivityRealignmentCardProps) {
  return (
    <Card
      className={`shadow-sm overflow-hidden border ${getChangeColor(actChangeIndicator)}`}
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50"
        onClick={toggleActivity}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
          <div className="flex items-center gap-2">
            <span
              className={`font-bold text-slate-900 text-sm ${actChangeIndicator === 'deleted' ? 'line-through opacity-60 text-red-750' : ''}`}
            >
              {activity.name}
            </span>
            {activity.id.includes('OPCR') ? (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold px-2 py-0.5"
              >
                OPCR
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 text-[10px] font-semibold px-2 py-0.5"
              >
                WFP - activity level
              </Badge>
            )}
            {getChangeIndicatorBadge(actChangeIndicator)}
          </div>
        </div>

        <div
          className="flex items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              Activity Budget
            </p>
            <p className="font-bold text-slate-900 text-sm">
              ₱
              {calculateActivityTotal(activity).toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          {editMode && !readOnly && actChangeIndicator !== 'deleted' && (
            <div className="flex gap-2 items-center">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-8 text-xs font-semibold"
                onClick={onAddLineItem}
              >
                <Plus className="w-3.5 h-3.5" /> Add Line Item
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-600 hover:bg-red-50"
                onClick={onDeleteActivity}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/35 p-4 space-y-4">
          {activity.expenditureTypes.map((exp) => {
            const expChangeIndicator = getExpTypeChangeIndicator(activity.id, exp.id)
            const isExpExpanded = expandedExpTypes.includes(exp.id)
            const colors = getExpTypeColorScheme(exp.type)

            return (
              <ExpenditureTypeCard
                key={exp.id}
                activityId={activity.id}
                exp={exp}
                isExpanded={isExpExpanded}
                toggleExpType={() => toggleExpType(exp.id)}
                expChangeIndicator={expChangeIndicator}
                getChangeColor={getChangeColor}
                getChangeIndicatorBadge={getChangeIndicatorBadge}
                calculateExpTypeTotal={calculateExpTypeTotal}
                colors={colors}

                expandedItems={expandedItems}
                toggleItem={toggleItem}
                getItemChangeIndicator={getItemChangeIndicator}
                getBudgetItemChangeIndicator={getBudgetItemChangeIndicator}
                calculateItemTotal={calculateItemTotal}
                editMode={editMode && !readOnly}
                readOnly={readOnly}
                getOriginalBudgetItemTotal={getOriginalBudgetItemTotal}
                editingItemId={editingItemId}
                handleStartItemEdit={handleStartItemEdit}
                handleCancelItemEdit={handleCancelItemEdit}
                onDeleteRequest={(itemId, bItem) => onDeleteRequest(exp.id, itemId, bItem)}
                getSubItemsToRender={getSubItemsToRender}
                reloadActivities={reloadActivities}
              />
            )
          })}
        </div>
      )}
    </Card>
  )
}
