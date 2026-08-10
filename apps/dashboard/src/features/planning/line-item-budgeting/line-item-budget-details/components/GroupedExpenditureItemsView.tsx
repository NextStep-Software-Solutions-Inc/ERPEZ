import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ExpenditureLineItemActionMenu } from './ExpenditureLineItemActionMenu'
import type {
  GroupedExpenditureData,
  GroupedLineItem,
} from '../utils/groupExpenditureData'
import type { LineItemBudgetDetails } from '../types/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyPHP } from '@/utils/formatters'

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

  // Flatten all items from all groups
  const allItems = useMemo(() => {
    return data.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        groupName: group.groupName,
        groupCode: group.groupCode,
        groupColor: group.groupColor,
        groupTotal: group.groupTotal,
      })),
    )
  }, [data])

  // Calculate pagination
  const totalItems = allItems.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const safeCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = allItems.slice(startIndex, endIndex)

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage)
    }
  }, [currentPage, safeCurrentPage])

  if (data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center py-12">
          <p className="text-gray-500 font-medium">No line items found</p>
          <p className="text-sm text-gray-400 mt-1">
            Click "Create Line Item" to add items
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Items Display */}
      <div className="space-y-8">
        {paginatedItems.map((item, index) => {
          const groupItem = item as GroupedLineItem & {
            groupName: string
            groupCode: string
            groupColor: string
            groupTotal: number
          }
          const timelineTotal = groupItem.groupTotal
          const timelineType = (groupItem.item.timelineType ?? '').toLowerCase()

          return (
            <div key={`${groupItem.groupName}-${index}`} className="space-y-4">
              {/* Group Header Card */}
              <div
                className={`rounded-lg ${groupItem.groupColor} border-l-4 p-5 shadow-sm hover:shadow-md transition-shadow`}
                style={{
                  borderLeftColor: groupItem.groupColor.includes('blue')
                    ? '#3b82f6'
                    : groupItem.groupColor.includes('emerald')
                      ? '#10b981'
                      : groupItem.groupColor.includes('amber')
                        ? '#f59e0b'
                        : groupItem.groupColor.includes('purple')
                          ? '#a855f7'
                          : groupItem.groupColor.includes('pink')
                            ? '#ec4899'
                            : groupItem.groupColor.includes('cyan')
                              ? '#06b6d4'
                              : groupItem.groupColor.includes('indigo')
                                ? '#6366f1'
                                : '#22c55e',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {groupItem.groupName}
                    </h3>
                    {groupItem.groupCode && (
                      <p className="text-xs text-gray-600 mt-1">
                        Code: {groupItem.groupCode}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-2 capitalize font-medium">
                      Timeline: {groupItem.item.timelineType || 'Unspecified'}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <div className="text-right">
                      <Badge className="gap-2 bg-green-100 text-green-700 px-3 py-1.5 font-semibold">
                        {formatCurrencyPHP(timelineTotal)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Details Card */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Budget Badge */}
                        <Badge className="gap-1 bg-blue-100 text-blue-700 font-semibold">
                          {formatCurrencyPHP(groupItem.item.budget)}
                        </Badge>
                        {/* Description */}
                        {groupItem.item.description && (
                          <span className="text-sm text-gray-600">
                            {groupItem.item.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 text-right">
                        {groupItem.item.startDate && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">
                              {timelineType === 'monthly'
                                ? 'Month'
                                : 'Quarter'}
                            </p>
                            <p className="text-sm font-bold text-gray-700 mt-1">
                              {timelineType === 'monthly'
                                ? new Date(
                                    groupItem.item.startDate,
                                  ).toLocaleDateString('en-US', {
                                    month: 'short',
                                  })
                                : `Q${Math.floor(new Date(groupItem.item.startDate).getMonth() / 3) + 1}`}
                            </p>
                          </div>
                        )}
                      </div>
                      {(onViewItem || (!readOnly && (onEditItem || onDeleteItem))) && (
                        <ExpenditureLineItemActionMenu
                          item={groupItem.item}
                          onView={onViewItem ? () => onViewItem?.(groupItem.item) : undefined}
                          onEdit={!readOnly && onEditItem ? () => onEditItem?.(groupItem.item) : undefined}
                          onDelete={!readOnly && onDeleteItem ? () => onDeleteItem?.(groupItem.item) : undefined}
                          isDeleting={isDeletingItemId === groupItem.item.id}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
              {totalItems === 0 ? 0 : startIndex + 1}
            </span>
            {' to '}
            <span className="font-semibold">
              {Math.min(endIndex, totalItems)}
            </span>
            {' of '}
            <span className="font-semibold">{totalItems}</span>
            {' items'}
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
