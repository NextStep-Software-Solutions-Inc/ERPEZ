import React, { useEffect, useState } from 'react'
import {
  User,
  Briefcase,
  Landmark,
  DollarSign,
  Layers,
  Folder,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { ExpenditureLineItemActionMenu } from './ExpenditureLineItemActionMenu'
import {
  getQuarterFromItem,
  getYearAwareQuarterFromItem,
  type GroupedExpenditureData,
} from '../utils/groupExpenditureData'
import type { LineItemBudgetDetails } from '../types/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyPHP, formatDisplayDate } from '@/utils/formatters'

interface GroupedExpenditureItemsViewProps {
  data: Array<GroupedExpenditureData>
  onViewItem?: (item: LineItemBudgetDetails) => void
  onEditItem?: (item: LineItemBudgetDetails) => void
  onDeleteItem?: (item: LineItemBudgetDetails) => void
  isDeletingItemId?: string
  itemsPerPage?: number
  readOnly?: boolean
}

export default function GroupedExpenditureItemsView({
  data,
  onViewItem,
  onEditItem,
  onDeleteItem,
  isDeletingItemId,
  itemsPerPage = 10,
  readOnly = false,
}: GroupedExpenditureItemsViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(
    new Set(),
  )
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set())

  const totalGroups = data.length
  const totalPages = Math.ceil(totalGroups / itemsPerPage)
  const safeCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedGroups = data.slice(startIndex, endIndex)

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage)
    }
  }, [currentPage, safeCurrentPage])

  const toggleCategoryCollapsed = (typeId: string) => {
    setCollapsedGroupIds((prev) => {
      const next = new Set(prev)
      if (next.has(typeId)) {
        next.delete(typeId)
      } else {
        next.add(typeId)
      }
      return next
    })
  }

  const toggleRowExpanded = (rowId: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      return next
    })
  }

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'user':
        return <User className="h-5 w-5" />
      case 'briefcase':
        return <Briefcase className="h-5 w-5" />
      case 'landmark':
        return <Landmark className="h-5 w-5" />
      case 'dollar':
        return <DollarSign className="h-5 w-5" />
      case 'layers':
        return <Layers className="h-5 w-5" />
      default:
        return <Folder className="h-5 w-5" />
    }
  }

  if (data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center py-12">
          <p className="text-gray-500 font-medium">No line items found</p>
          <p className="text-sm text-gray-400 mt-1">
            Click "Add Line Item" to add items
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Groups Display */}
      <div className="space-y-6">
        {paginatedGroups.map((group) => {
          const isCollapsed = collapsedGroupIds.has(group.typeId)

          return (
            <div
              key={group.typeId || group.typeName}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs"
            >
              {/* Level 1 — Type of Expenditure Banner Header */}
              <div
                className={`px-5 py-4 flex items-center justify-between border-l-4 ${group.categoryTheme.bg} ${group.categoryTheme.border} cursor-pointer select-none transition-colors hover:brightness-98`}
                onClick={() => toggleCategoryCollapsed(group.typeId)}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${group.categoryTheme.iconBg} ${group.categoryTheme.iconColor} shrink-0`}
                  >
                    {renderCategoryIcon(group.categoryTheme.iconName)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-gray-900 tracking-wide uppercase truncate">
                      {group.typeName}
                    </h2>
                    {group.typeCode && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Code: {group.typeCode}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">
                      {group.itemCount} item{group.itemCount !== 1 ? 's' : ''} •{' '}
                      {group.allocationCount} allocation
                      {group.allocationCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-medium mb-0.5">
                      Group Total
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-emerald-600">
                      {formatCurrencyPHP(group.typeTotal)}
                    </p>
                  </div>
                  <div className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                    {isCollapsed ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronUp className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </div>
              {!isCollapsed && (() => {
                const defaultCols = [
                  {
                    key: '2026-Q1',
                    year: 2026,
                    quarterNumber: 1,
                    quarterLabel: 'Q1',
                    dateRangeLabel: 'Jan – Mar',
                    fullLabel: '2026 Q1',
                  },
                  {
                    key: '2026-Q2',
                    year: 2026,
                    quarterNumber: 2,
                    quarterLabel: 'Q2',
                    dateRangeLabel: 'Apr – Jun',
                    fullLabel: '2026 Q2',
                  },
                  {
                    key: '2026-Q3',
                    year: 2026,
                    quarterNumber: 3,
                    quarterLabel: 'Q3',
                    dateRangeLabel: 'Jul – Sep',
                    fullLabel: '2026 Q3',
                  },
                  {
                    key: '2026-Q4',
                    year: 2026,
                    quarterNumber: 4,
                    quarterLabel: 'Q4',
                    dateRangeLabel: 'Oct – Dec',
                    fullLabel: '2026 Q4',
                  },
                ]
                const columns =
                  group.columns && group.columns.length > 0
                    ? group.columns
                    : defaultCols

                const yearGroups: Array<{
                  year: number
                  cols: typeof columns
                }> = []
                columns.forEach((col) => {
                  const last = yearGroups[yearGroups.length - 1]
                  if (last && last.year === col.year) {
                    last.cols.push(col)
                  } else {
                    yearGroups.push({ year: col.year, cols: [col] })
                  }
                })
                const isMultiYear = yearGroups.length > 1
                const showActions =
                  onViewItem || (!readOnly && (onEditItem || onDeleteItem))
                const totalColSpan =
                  1 + columns.length + 1 + (showActions ? 1 : 0)

                return (
                  <div className="overflow-x-auto border-t border-gray-200">
                    <table className="w-full text-xs sm:text-sm min-w-[820px]">
                      <thead className="bg-gray-50/70 border-b border-gray-200 text-gray-600">
                        {isMultiYear ? (
                          <>
                            <tr>
                              <th
                                rowSpan={2}
                                className="text-left px-5 py-3 text-xs sm:text-sm font-semibold text-gray-700 min-w-[280px] align-middle"
                              >
                                Item of Expenditure
                              </th>
                              {yearGroups.map((yg) => (
                                <th
                                  key={yg.year}
                                  colSpan={yg.cols.length}
                                  className="text-center px-3 py-1.5 text-xs sm:text-sm font-bold text-gray-800 bg-gray-100/90 border-b border-gray-200"
                                >
                                  {yg.year}
                                </th>
                              ))}
                              <th
                                rowSpan={2}
                                className="text-right px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700 w-32 min-w-[110px] shrink-0 whitespace-nowrap align-middle"
                              >
                                Total
                              </th>
                              {showActions && (
                                <th
                                  rowSpan={2}
                                  className="text-center px-2 py-3 text-xs sm:text-sm font-semibold text-gray-700 w-14 shrink-0 align-middle"
                                >
                                  Actions
                                </th>
                              )}
                            </tr>
                            <tr className="bg-gray-50/70 border-b border-gray-200">
                              {columns.map((col) => (
                                <th
                                  key={col.key}
                                  className="text-right px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 w-28 min-w-[105px] shrink-0 whitespace-nowrap"
                                >
                                  <div>{col.quarterLabel}</div>
                                  <div className="text-[11px] text-gray-500 font-normal mt-0.5 whitespace-nowrap">
                                    {col.dateRangeLabel}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </>
                        ) : (
                          <tr>
                            <th className="text-left px-5 py-3 text-xs sm:text-sm font-semibold text-gray-700 min-w-[280px]">
                              Item of Expenditure
                            </th>
                            {columns.map((col) => (
                              <th
                                key={col.key}
                                className="text-right px-3 py-3 text-xs sm:text-sm font-semibold text-gray-700 w-28 min-w-[105px] shrink-0 whitespace-nowrap"
                              >
                                <div>{col.quarterLabel}</div>
                                <div className="text-[11px] text-gray-500 font-normal mt-0.5 whitespace-nowrap">
                                  {col.dateRangeLabel}
                                </div>
                              </th>
                            ))}
                            <th className="text-right px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700 w-32 min-w-[110px] shrink-0 whitespace-nowrap">
                              Total
                            </th>
                            {showActions && (
                              <th className="text-center px-2 py-3 text-xs sm:text-sm font-semibold text-gray-700 w-14 shrink-0">
                                Actions
                              </th>
                            )}
                          </tr>
                        )}
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {group.items.map((row) => {
                          const isRowExpanded = expandedRowIds.has(row.itemId)
                          const hasMultipleAllocations =
                            row.allocations.length > 1

                          return (
                            <React.Fragment key={row.itemId}>
                              <tr className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-5 py-3 text-gray-900 min-w-[280px]">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sm text-gray-900 leading-snug">
                                      {row.itemName}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className={`text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-medium px-2 py-0.5 ${
                                        hasMultipleAllocations
                                          ? 'cursor-pointer hover:bg-blue-100'
                                          : ''
                                      }`}
                                      onClick={
                                        hasMultipleAllocations
                                          ? () => toggleRowExpanded(row.itemId)
                                          : undefined
                                      }
                                    >
                                      {row.allocationCount} allocation
                                      {row.allocationCount !== 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                  <p
                                    className="text-xs text-gray-600 mt-1 font-normal leading-relaxed break-words"
                                    title={row.groupName}
                                  >
                                    {row.groupName}
                                  </p>
                                </td>
                                {columns.map((col) => {
                                  const cell =
                                    row.periodAmounts?.[col.key] ||
                                    (col.quarterNumber === 1
                                      ? row.q1
                                      : col.quarterNumber === 2
                                        ? row.q2
                                        : col.quarterNumber === 3
                                          ? row.q3
                                          : row.q4)
                                  const budget = cell?.budget
                                  return (
                                    <td
                                      key={col.key}
                                      className="px-3 py-3 text-right text-xs sm:text-sm w-28 min-w-[105px] shrink-0 whitespace-nowrap"
                                    >
                                      {budget !== null &&
                                      budget !== undefined &&
                                      budget > 0 ? (
                                        <span className="font-semibold text-blue-600">
                                          {formatCurrencyPHP(budget)}
                                        </span>
                                      ) : (
                                        <span className="text-gray-300">—</span>
                                      )}
                                    </td>
                                  )
                                })}
                                <td className="px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-900 w-32 min-w-[110px] shrink-0 whitespace-nowrap">
                                  {formatCurrencyPHP(row.total)}
                                </td>
                                {showActions && (
                                  <td className="px-2 py-3 text-center shrink-0">
                                    {row.allocations.length === 1 ? (
                                      <ExpenditureLineItemActionMenu
                                        item={row.allocations[0]}
                                        onView={
                                          onViewItem
                                            ? () =>
                                                onViewItem?.(row.allocations[0])
                                            : undefined
                                        }
                                        onEdit={
                                          !readOnly && onEditItem
                                            ? () =>
                                                onEditItem?.(row.allocations[0])
                                            : undefined
                                        }
                                        onDelete={
                                          !readOnly && onDeleteItem
                                            ? () =>
                                                onDeleteItem?.(
                                                  row.allocations[0],
                                                )
                                            : undefined
                                        }
                                        isDeleting={
                                          isDeletingItemId ===
                                          row.allocations[0].id
                                        }
                                      />
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          toggleRowExpanded(row.itemId)
                                        }
                                        className="h-8 px-2 text-xs text-gray-500 hover:text-blue-600"
                                      >
                                        {isRowExpanded ? 'Hide' : 'Details'}
                                      </Button>
                                    )}
                                  </td>
                                )}
                              </tr>

                              {/* Expandable breakdown for multi-allocation items */}
                              {isRowExpanded && hasMultipleAllocations && (
                                <tr className="bg-blue-50/20">
                                  <td
                                    colSpan={totalColSpan}
                                    className="px-8 py-3 border-t border-b border-blue-100"
                                  >
                                    <div className="rounded-lg border border-blue-100 bg-white p-3 space-y-2">
                                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Quarterly Breakdown (
                                        {row.allocations.length} allocations)
                                      </div>
                                      <div className="divide-y divide-gray-100 text-xs">
                                        {row.allocations.map((alloc) => {
                                          const periodInfo =
                                            getYearAwareQuarterFromItem(alloc)
                                          const timelineLabel = periodInfo
                                            ? `${periodInfo.key}`
                                            : getQuarterFromItem(
                                                alloc,
                                              )?.toUpperCase() ||
                                              alloc.timelineType ||
                                              'Quarterly'
                                          return (
                                            <div
                                              key={alloc.id}
                                              className="py-2 px-2 flex items-center justify-between gap-4 hover:bg-gray-50 rounded"
                                            >
                                              <div className="flex items-center gap-3">
                                                <Badge
                                                  variant="outline"
                                                  className="text-[11px] font-semibold text-blue-700 bg-blue-50 border-blue-200"
                                                >
                                                  {timelineLabel}
                                                </Badge>
                                                <span className="text-gray-800 font-medium text-sm">
                                                  {alloc.description ||
                                                    alloc.object?.name ||
                                                    '—'}
                                                </span>
                                                {alloc.startDate && (
                                                  <span className="text-gray-500 text-xs">
                                                    {formatDisplayDate(
                                                      alloc.startDate,
                                                    )}
                                                    {alloc.endDate
                                                      ? ` – ${formatDisplayDate(alloc.endDate)}`
                                                      : ''}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-4">
                                                <span className="font-semibold text-gray-900 text-sm">
                                                  {formatCurrencyPHP(
                                                    alloc.budget,
                                                  )}
                                                </span>
                                                <ExpenditureLineItemActionMenu
                                                  item={alloc}
                                                  onView={
                                                    onViewItem
                                                      ? () =>
                                                          onViewItem?.(alloc)
                                                      : undefined
                                                  }
                                                  onEdit={
                                                    !readOnly && onEditItem
                                                      ? () =>
                                                          onEditItem?.(alloc)
                                                      : undefined
                                                  }
                                                  onDelete={
                                                    !readOnly && onDeleteItem
                                                      ? () =>
                                                          onDeleteItem?.(alloc)
                                                      : undefined
                                                  }
                                                  isDeleting={
                                                    isDeletingItemId ===
                                                    alloc.id
                                                  }
                                                />
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </tbody>
                      {/* Category Total Footer */}
                      <tfoot className="bg-gray-50/50 border-t border-gray-200">
                        <tr>
                          <td
                            colSpan={1 + columns.length}
                            className="px-5 py-3.5 text-right text-xs text-gray-600 font-medium"
                          >
                            Category Total
                          </td>
                          <td className="px-4 py-3.5 text-right text-xs sm:text-sm font-semibold text-emerald-600 shrink-0">
                            {formatCurrencyPHP(group.typeTotal)}
                          </td>
                          {showActions && (
                            <td className="px-2 py-3.5 text-center shrink-0" />
                          )}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-semibold">
              {totalGroups === 0 ? 0 : startIndex + 1}
            </span>
            {' to '}
            <span className="font-semibold">
              {Math.min(endIndex, totalGroups)}
            </span>
            {' of '}
            <span className="font-semibold">{totalGroups}</span>
            {' groups'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safeCurrentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded border border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                {safeCurrentPage}
              </span>
              <span className="text-sm text-gray-500">of</span>
              <span className="text-sm font-medium text-gray-700">
                {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={safeCurrentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


