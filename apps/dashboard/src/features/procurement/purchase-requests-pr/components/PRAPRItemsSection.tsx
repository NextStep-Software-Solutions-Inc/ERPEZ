import React from 'react'
import { ChevronDown, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PRItem } from '../types'

const ORDERED_MONTHS = [
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
] as const

interface PRAPRItemsSectionProps {
  groupedAPRs: PRItem[]
  expandedPPMPs: Set<string>
  toggleExpandPPMP: (aprId: string) => void
  isEditable: boolean
  canAddItems: boolean
  defaultOfficeName?: string
  onUpdateMonthlyQuantity: (groupItemId: string, innerItem: PRItem, month: string, value: number) => void
  onDeleteItem: (groupItemId: string, innerItem: PRItem) => void
  onDeleteAPRGroup: (aprNumber: string, displayName: string, items: PRItem[]) => void
}

export const PRAPRItemsSection: React.FC<PRAPRItemsSectionProps> = ({
  groupedAPRs,
  expandedPPMPs,
  toggleExpandPPMP,
  isEditable,
  canAddItems,
  defaultOfficeName = 'General Administration',
  onUpdateMonthlyQuantity,
  onDeleteItem,
  onDeleteAPRGroup,
}) => {
  return (
    <div className="space-y-3">
      <div className="space-y-4">
        {groupedAPRs.map((groupItem) => {
          const aprId = groupItem.aprGroup?.id || groupItem.aprGroup?.aprId || groupItem.aprId || groupItem.id || ''
          const isExpanded = expandedPPMPs.has(aprId)
          const nested: PRItem[] = (groupItem.aprGroup?.items || [groupItem]) as PRItem[]
          const aprTotal =
            groupItem.aprGroup?.totalAmount ??
            groupItem.totalAmount ??
            nested.reduce(
              (s: number, ni: PRItem) => s + (ni.totalAmount || 0),
              0,
            )
          const aprNumber = groupItem.aprGroup?.aprNumber || groupItem.aprNumber || 'APR'
          const officeName = groupItem.aprGroup?.officeName || groupItem.aprOffice || defaultOfficeName

          return (
            <div
              key={groupItem.id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow my-3"
            >
              <div
                className="px-6 py-4 min-h-[68px] flex items-center gap-3 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 cursor-pointer transition bg-gradient-to-r from-slate-50/30 to-slate-100/30"
                onClick={() => toggleExpandPPMP(aprId)}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {aprNumber} • {officeName}
                  </div>
                  <div className="text-xs truncate text-slate-600">
                    {nested.length} item(s)
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-3">
                  <Badge
                    color="default"
                    className="text-sm font-semibold"
                  >
                    ₱{aprTotal.toLocaleString()}
                  </Badge>
                  {canAddItems && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-0 text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteAPRGroup(
                          aprNumber,
                          `${aprNumber} • ${officeName}`,
                          nested,
                        )
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t bg-muted/10 overflow-x-auto">
                  <Table style={{ minWidth: '1600px' }}>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="min-w-[150px] sticky left-0 bg-muted/40 z-10">Item Name</TableHead>
                        <TableHead className="min-w-[140px]">Category</TableHead>
                        <TableHead className="min-w-[110px]">Fund</TableHead>
                        {ORDERED_MONTHS.map((m: string) => (
                          <TableHead key={m} className="text-center min-w-[80px]">
                            <span className="flex flex-col items-center gap-0.5">
                              <span>{m.slice(0, 3)}</span>
                              {isEditable && (
                                <span className="text-[9px] font-normal text-primary/60 leading-none">editable</span>
                              )}
                            </span>
                          </TableHead>
                        ))}
                        <TableHead className="text-center min-w-[110px]">
                          Total Qty
                        </TableHead>
                        <TableHead className="min-w-[110px]">Unit Price</TableHead>
                        <TableHead className="text-right min-w-[120px]">
                          Total Amount
                        </TableHead>
                        {isEditable && (
                          <TableHead className="text-center w-20">Actions</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nested.map((ni) => {
                        const unitPrice = ni.unitPrice || 0

                        const monthlyQty =
                          ni.monthlyQuantities &&
                          Object.keys(ni.monthlyQuantities).length > 0
                            ? ni.monthlyQuantities
                            : ni.month
                              ? { [ni.month]: ni.quantity }
                              : {}

                        const monthlySum = ORDERED_MONTHS.reduce(
                          (s: number, mm: string) =>
                            s + ((monthlyQty && (monthlyQty[mm] || 0)) || 0),
                          0,
                        )

                        const requiredTotal =
                          monthlySum > 0 ? monthlySum : (ni.originalNeeded || ni.quantity || 0)

                        const alreadyGot = ni.totalGot || 0
                        const deficitQty = Math.max(requiredTotal - alreadyGot, 0)
                        const lineTotal = deficitQty * unitPrice

                        return (
                          <TableRow key={ni.id}>
                            <TableCell className="font-medium">
                              {ni.itemName}
                            </TableCell>
                            <TableCell>{ni.category}</TableCell>
                            <TableCell>{ni.fund || '—'}</TableCell>

                            {ORDERED_MONTHS.map((m: string) => {
                              const currentVal =
                                ni.monthlyQuantities &&
                                typeof ni.monthlyQuantities[m] === 'number'
                                  ? ni.monthlyQuantities[m]
                                  : monthlyQty[m] || 0

                              return (
                                <TableCell
                                  key={`${ni.id}-${m}`}
                                  className="text-center px-2 py-2 group/cell hover:bg-primary/5 transition-colors rounded"
                                >
                                  <div className="inline-flex items-center justify-center gap-1">
                                    <input
                                      type="number"
                                      min={0}
                                      value={currentVal}
                                      title="Click to edit"
                                      onChange={(e) => {
                                        const v = parseInt(e.target.value || '0', 10)
                                        const val = Number.isNaN(v) ? 0 : Math.max(0, v)
                                        onUpdateMonthlyQuantity(groupItem.id, ni, m, val)
                                      }}
                                      readOnly={!isEditable}
                                      disabled={!isEditable}
                                      className={`w-14 text-center tabular-nums text-sm py-1 px-1 rounded transition-colors ${
                                        isEditable
                                          ? 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs cursor-text'
                                          : 'border-transparent bg-transparent cursor-default opacity-80'
                                      }`}
                                    />
                                    <span className="text-xs text-slate-500 dark:text-slate-400 pointer-events-none">
                                      {ni.unitOfMeasure || 'pcs'}
                                    </span>
                                  </div>
                                </TableCell>
                              )
                            })}

                            <TableCell className="text-center">
                              <Badge color="default" className="tabular-nums">
                                {ORDERED_MONTHS.reduce((s: number, m: string) => {
                                  const cellVal =
                                    ni.monthlyQuantities &&
                                    typeof ni.monthlyQuantities[m] === 'number'
                                      ? ni.monthlyQuantities[m]
                                      : monthlyQty[m] || 0
                                  return s + cellVal
                                }, 0)} {ni.unitOfMeasure || 'pcs'}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              ₱{unitPrice.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              ₱{(lineTotal || 0).toLocaleString()}
                            </TableCell>
                            {isEditable && (
                              <TableCell className="text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                  title={`Delete ${ni.itemName}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteItem(groupItem.id, ni)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
