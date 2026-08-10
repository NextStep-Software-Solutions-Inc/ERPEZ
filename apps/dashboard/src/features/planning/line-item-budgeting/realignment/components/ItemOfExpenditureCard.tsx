import React from 'react'
import { ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ItemOfExpenditure, BudgetItem, ChangeIndicator } from '../types/realignment.types'
import { BudgetItemInlineForm } from '../forms/BudgetItemInlineForm'

interface ItemOfExpenditureCardProps {
  activityId: string
  expTypeId: string
  ioe: ItemOfExpenditure
  editMode: boolean
  readOnly?: boolean
  getOriginalBudgetItemTotal?: (budgetItemId: string) => number | undefined
  isExpanded: boolean
  toggleItem: () => void
  itemChangeIndicator: ChangeIndicator
  getBudgetItemChangeIndicator: (budgetItemId: string) => ChangeIndicator
  getChangeColor: (indicator: ChangeIndicator) => string
  getChangeIndicatorBadge: (indicator: ChangeIndicator) => React.ReactNode
  calculateItemTotal: (ioe: ItemOfExpenditure) => number
  editingItemId: string | null
  handleStartItemEdit: (bItem: BudgetItem) => void
  handleCancelItemEdit: () => void
  onDeleteRequest: (bItem: BudgetItem) => void
  subItemsToRender: BudgetItem[]
  reloadActivities: () => Promise<void>
}

export function ItemOfExpenditureCard({
  activityId: _activityId,
  expTypeId: _expTypeId,
  ioe,
  editMode,
  readOnly = false,
  getOriginalBudgetItemTotal,
  isExpanded,
  toggleItem,
  itemChangeIndicator,
  getBudgetItemChangeIndicator,
  getChangeColor,
  getChangeIndicatorBadge,
  calculateItemTotal,
  editingItemId,
  handleStartItemEdit,
  handleCancelItemEdit,
  onDeleteRequest,
  subItemsToRender,
  reloadActivities,
}: ItemOfExpenditureCardProps) {
  return (
    <div
      className={`border border-slate-200 rounded bg-white overflow-hidden ${getChangeColor(itemChangeIndicator)}`}
    >
      <div
        className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50"
        onClick={toggleItem}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span
            className={`font-semibold text-slate-700 text-xs ${itemChangeIndicator === 'deleted' ? 'line-through opacity-60 text-red-750 font-bold' : ''}`}
          >
            {ioe.name}
          </span>
          {getChangeIndicatorBadge(itemChangeIndicator)}
        </div>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-bold text-slate-800 text-xs">
            ₱
            {calculateItemTotal(ioe).toLocaleString('en-US', {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/10">
          <table className="w-full text-xs text-left text-slate-500">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2">Sub-Item Description</th>
                <th className="py-2 text-right">Q1</th>
                <th className="py-2 text-right">Q2</th>
                <th className="py-2 text-right">Q3</th>
                <th className="py-2 text-right">Q4</th>
                <th className="py-2 text-right">Total</th>
                {editMode && !readOnly && <th className="py-2 text-center w-12">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subItemsToRender.map((bItem) => {
                const bChangeIndicator = getBudgetItemChangeIndicator(bItem.id)
                const isRowEditing = editMode && editingItemId === bItem.id

                return (
                  <tr
                    key={bItem.id}
                    className={`hover:bg-slate-50/40 ${getChangeColor(bChangeIndicator)}`}
                  >
                    {isRowEditing ? (
                      <BudgetItemInlineForm
                        bItem={bItem}
                        onSuccess={async () => {
                          handleCancelItemEdit()
                          await reloadActivities()
                        }}
                        onCancel={handleCancelItemEdit}
                      />
                    ) : (
                      <>
                        <td className="py-2 font-medium text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={
                                bChangeIndicator === 'deleted'
                                  ? 'line-through opacity-60 text-red-750 font-semibold'
                                  : ''
                              }
                            >
                              {bItem.description}
                            </span>
                            {getChangeIndicatorBadge(bChangeIndicator)}
                          </div>
                        </td>
                        <td className="py-2 text-right w-20">
                          <span className={bChangeIndicator === 'deleted' ? 'line-through opacity-60 text-slate-400' : ''}>
                            {bItem.q1.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-2 text-right w-20">
                          <span className={bChangeIndicator === 'deleted' ? 'line-through opacity-60 text-slate-400' : ''}>
                            {bItem.q2.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-2 text-right w-20">
                          <span className={bChangeIndicator === 'deleted' ? 'line-through opacity-60 text-slate-400' : ''}>
                            {bItem.q3.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-2 text-right w-20">
                          <span className={bChangeIndicator === 'deleted' ? 'line-through opacity-60 text-slate-400' : ''}>
                            {bItem.q4.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-2 text-right font-bold text-slate-900 w-24 font-mono">
                          <span className={bChangeIndicator === 'deleted' ? 'line-through opacity-60 text-red-750' : ''}>
                            {bChangeIndicator === 'edited' && getOriginalBudgetItemTotal && getOriginalBudgetItemTotal(bItem.id) !== undefined && (
                              <span className="text-[10px] text-slate-400 block font-normal line-through">
                                ₱{getOriginalBudgetItemTotal(bItem.id)?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                            ₱{bItem.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        {editMode && !readOnly && (
                          <td className="py-2 text-center">
                            {bChangeIndicator === 'deleted' ? (
                              <Badge
                                variant="outline"
                                className="bg-red-50 text-red-700 border-red-200 text-[10px]"
                              >
                                Deleted
                              </Badge>
                            ) : (
                              <div className="flex justify-center gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-blue-600 hover:text-blue-800"
                                  onClick={() => handleStartItemEdit(bItem)}
                                  title="Edit item"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-red-600 hover:text-red-800"
                                  onClick={() => onDeleteRequest(bItem)}
                                  title="Delete sub-item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
