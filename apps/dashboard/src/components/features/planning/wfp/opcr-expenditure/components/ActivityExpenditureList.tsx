import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrencyPHP } from '@/utils/formatters'
import type { Expenditure, ExpenditureItem } from '../atoms'

interface ActivityExpenditureListProps {
  expenditures: Expenditure[]
  budgetAllocation: number
  onAddExpenditure: () => void
  onEditExpenditure?: (expenditure: Expenditure) => void
  onDeleteExpenditure?: (expenditureId: string) => void
}

export function ActivityExpenditureList({
  expenditures = [],
  budgetAllocation,
  onAddExpenditure,
  onEditExpenditure,
  onDeleteExpenditure,
}: ActivityExpenditureListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const totalExpended = expenditures.reduce((sum, exp) => sum + exp.amount, 0)
  const remaining = budgetAllocation - totalExpended
  const utilizationPercent = budgetAllocation > 0 ? (totalExpended / budgetAllocation) * 100 : 0

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedIds(newSet)
  }

  return (
    <div className="space-y-4">
      {/* Budget Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
          <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Budget Allocation</p>
          <p className="text-lg font-bold text-green-700">{formatCurrencyPHP(budgetAllocation)}</p>
          <p className="text-xs text-green-600">Total budget</p>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
          <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Total Expended</p>
          <p className="text-lg font-bold text-green-700">{formatCurrencyPHP(totalExpended)}</p>
          <p className="text-xs text-green-600">{expenditures.length} expenditures</p>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
          <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Remaining</p>
          <p className={`text-lg font-bold ${remaining >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrencyPHP(remaining)}
          </p>
          <p className="text-xs text-green-600">Budget available</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-green-600 mt-1 text-center">
          {utilizationPercent.toFixed(1)}% of allocated budget utilized
        </p>
      </div>

      {/* Expenditures List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h6 className="text-xs font-semibold text-green-700 uppercase tracking-wide">
            Expenditure Records
          </h6>
          <Button
            size="sm"
            variant="outline"
            className="text-green-700 border-green-300 hover:bg-green-100 h-7"
            onClick={onAddExpenditure}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Expenditure
          </Button>
        </div>

        {expenditures.length === 0 ? (
          <div className="bg-white rounded-lg border border-green-200 p-6 text-center">
            <p className="text-gray-500 text-sm">No expenditures recorded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenditures.map((expenditure) => {
              const isExpanded = expandedIds.has(expenditure.id)
              const itemsTotal = expenditure.items.reduce(
                (sum, item) => sum + item.quantity * item.unitCost,
                0
              )

              return (
                <div
                  key={expenditure.id}
                  className="bg-white rounded-lg border border-green-200 overflow-hidden"
                >
                  {/* Header Row */}
                  <button
                    onClick={() => toggleExpanded(expenditure.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-green-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      {expenditure.items.length > 0 && (
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">{expenditure.date}</span>
                          <span className="text-xs text-gray-500">—</span>
                          <span className="text-sm text-gray-700">{expenditure.description}</span>
                        </div>
                        {expenditure.items.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {expenditure.items.length} item{expenditure.items.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold text-green-700 min-w-24 text-right">
                        {formatCurrencyPHP(expenditure.amount)}
                      </span>
                      <div className="flex gap-1">
                        {onEditExpenditure && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditExpenditure(expenditure)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {onDeleteExpenditure && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteExpenditure(expenditure.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Items Section */}
                  {isExpanded && expenditure.items.length > 0 && (
                    <div className="bg-gray-50 border-t border-green-200 p-4">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left pb-2 font-semibold text-gray-700">Item Description</th>
                            <th className="text-center pb-2 font-semibold text-gray-700">Qty</th>
                            <th className="text-right pb-2 font-semibold text-gray-700">Unit Cost</th>
                            <th className="text-right pb-2 font-semibold text-gray-700">Total</th>
                          </tr>
                        </thead>
                        <tbody className="space-y-1">
                          {expenditure.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                              <td className="py-2 text-gray-700">{item.description}</td>
                              <td className="text-center py-2 text-gray-700">{item.quantity}</td>
                              <td className="text-right py-2 text-gray-700">
                                {formatCurrencyPHP(item.unitCost)}
                              </td>
                              <td className="text-right py-2 font-semibold text-green-700">
                                {formatCurrencyPHP(item.quantity * item.unitCost)}
                              </td>
                            </tr>
                          ))}
                          <tr className="font-semibold bg-green-50">
                            <td colSpan={3} className="py-2 text-right pr-2">
                              Subtotal:
                            </td>
                            <td className="text-right py-2 text-green-700">
                              {formatCurrencyPHP(itemsTotal)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Summary Table */}
      {expenditures.length > 0 && (
        <div className="mt-4 pt-4 border-t border-green-200">
          <h6 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">
            All Expenditure Items
          </h6>
          <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-green-50 border-b border-green-200">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-green-800">Expenditure Date</th>
                  <th className="px-4 py-2 text-left font-semibold text-green-800">Item Description</th>
                  <th className="px-4 py-2 text-center font-semibold text-green-800">Qty</th>
                  <th className="px-4 py-2 text-right font-semibold text-green-800">Unit Cost</th>
                  <th className="px-4 py-2 text-right font-semibold text-green-800">Total</th>
                </tr>
              </thead>
              <tbody>
                {expenditures.flatMap((exp) =>
                  exp.items.map((item, idx) => (
                    <tr key={`${exp.id}-${idx}`} className="border-b border-green-100 hover:bg-green-50">
                      <td className="px-4 py-2 text-gray-700">{exp.date}</td>
                      <td className="px-4 py-2 text-gray-700">{item.description}</td>
                      <td className="px-4 py-2 text-center text-gray-700">{item.quantity}</td>
                      <td className="px-4 py-2 text-right text-gray-700">
                        {formatCurrencyPHP(item.unitCost)}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-green-700">
                        {formatCurrencyPHP(item.quantity * item.unitCost)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
