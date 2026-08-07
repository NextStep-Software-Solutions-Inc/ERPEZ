import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ExpenditureType, ChangeIndicator, ItemOfExpenditure, BudgetItem } from '../types/realignment.types'
import { ItemOfExpenditureCard } from './ItemOfExpenditureCard'

interface ExpenditureTypeCardProps {
  activityId: string
  exp: ExpenditureType
  isExpanded: boolean
  toggleExpType: () => void
  expChangeIndicator: ChangeIndicator
  getChangeColor: (indicator: ChangeIndicator) => string
  getChangeIndicatorBadge: (indicator: ChangeIndicator) => React.ReactNode
  calculateExpTypeTotal: (exp: ExpenditureType) => number
  colors: {
    bg: string
    border: string
    badge: string
    text: string
    icon: string
    header: string
  }
  
  // Drilling down props
  expandedItems: string[]
  toggleItem: (id: string) => void
  getItemChangeIndicator: (activityId: string, expTypeId: string, itemId: string) => ChangeIndicator
  getBudgetItemChangeIndicator: (activityId: string, expTypeId: string, itemId: string, budgetItemId: string) => ChangeIndicator
  calculateItemTotal: (ioe: ItemOfExpenditure) => number
  editMode: boolean
  readOnly?: boolean
  getOriginalBudgetItemTotal?: (budgetItemId: string) => number | undefined
  editingItemId: string | null
  handleStartItemEdit: (id: string, bItem: BudgetItem) => void
  handleCancelItemEdit: () => void
  onDeleteRequest: (itemId: string, bItem: BudgetItem) => void
  getSubItemsToRender: (activityId: string, expTypeId: string, ioeId: string, currentItems: BudgetItem[]) => BudgetItem[]
  reloadActivities: () => Promise<void>
}

export function ExpenditureTypeCard({
  activityId,
  exp,
  isExpanded,
  toggleExpType,
  expChangeIndicator,
  getChangeColor,
  getChangeIndicatorBadge,
  calculateExpTypeTotal,
  colors,
  
  expandedItems,
  toggleItem,
  getItemChangeIndicator,
  getBudgetItemChangeIndicator,
  calculateItemTotal,
  editMode,
  readOnly = false,
  getOriginalBudgetItemTotal,
  editingItemId,
  handleStartItemEdit,
  handleCancelItemEdit,
  onDeleteRequest,
  getSubItemsToRender,
  reloadActivities,
}: ExpenditureTypeCardProps) {
  return (
    <div
      className={`border rounded-lg overflow-hidden ${colors.border} ${colors.bg} ${getChangeColor(expChangeIndicator)}`}
    >
      <div
        className={`p-3 flex items-center justify-between cursor-pointer border-b ${colors.border} ${colors.header}`}
        onClick={toggleExpType}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
          <Badge className={colors.badge}>{exp.type}</Badge>
          <span
            className={`font-semibold text-xs ${colors.text} ${expChangeIndicator === 'deleted' ? 'line-through opacity-60 text-red-750 font-bold' : ''}`}
          >
            {exp.name}
          </span>
          {getChangeIndicatorBadge(expChangeIndicator)}
        </div>
        <div
          className="flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <span className={`font-bold text-xs ${colors.text}`}>
            ₱
            {calculateExpTypeTotal(exp).toLocaleString('en-US', {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3 bg-white/70">
          {exp.itemsOfExpenditure.map((ioe) => {
            const itemChangeIndicator = getItemChangeIndicator(
              activityId,
              exp.id,
              ioe.id,
            )
            const isItemExpanded = expandedItems.includes(ioe.id)
            const subItemsToRender = getSubItemsToRender(activityId, exp.id, ioe.id, ioe.items)

            return (
              <ItemOfExpenditureCard
                key={ioe.id}
                activityId={activityId}
                expTypeId={exp.id}
                ioe={ioe}
                editMode={editMode && !readOnly}
                readOnly={readOnly}
                getOriginalBudgetItemTotal={getOriginalBudgetItemTotal}
                isExpanded={isItemExpanded}
                toggleItem={() => toggleItem(ioe.id)}
                itemChangeIndicator={itemChangeIndicator}
                getBudgetItemChangeIndicator={(budgetItemId) => getBudgetItemChangeIndicator(activityId, exp.id, ioe.id, budgetItemId)}
                getChangeColor={getChangeColor}
                getChangeIndicatorBadge={getChangeIndicatorBadge}
                calculateItemTotal={calculateItemTotal}
                editingItemId={editingItemId}
                handleStartItemEdit={(bItem) => handleStartItemEdit(bItem.id, bItem)}
                handleCancelItemEdit={handleCancelItemEdit}
                onDeleteRequest={(bItem) => onDeleteRequest(ioe.id, bItem)}
                subItemsToRender={subItemsToRender}
                reloadActivities={reloadActivities}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
