import { LineItemBudgetDetails } from '../types/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, Eye } from 'lucide-react'
import { GroupedExpenditureData } from '../utils/groupExpenditureData'

interface WFPLineItemsViewProps {
  data: GroupedExpenditureData[]
  isDeletingItemId?: string
  onViewItem: (item: LineItemBudgetDetails) => void
  onEditItem: (item: LineItemBudgetDetails) => void
  onDeleteItem: (item: LineItemBudgetDetails) => void
  readOnly?: boolean
}

interface GroupedByObjectAndDescription {
  objectName: string
  objectCode?: string
  descriptionGroups: {
    description: string
    items: LineItemBudgetDetails[]
  }[]
}

const groupItemsByObjectAndDescription = (
  data: GroupedExpenditureData[],
): GroupedByObjectAndDescription[] => {
  const allItems = data.flatMap((group) =>
    group.items.map((groupedItem) => groupedItem.item),
  )

  // Group by object name first
  const objectMap = new Map<string, Map<string, LineItemBudgetDetails[]>>()

  allItems.forEach((item) => {
    const objectName = item.object.name || 'Unnamed'
    const description = item.description || 'No Description'

    if (!objectMap.has(objectName)) {
      objectMap.set(objectName, new Map())
    }

    const descMap = objectMap.get(objectName)!
    if (!descMap.has(description)) {
      descMap.set(description, [])
    }

    descMap.get(description)!.push(item)
  })

  // Convert to array structure
  const grouped: GroupedByObjectAndDescription[] = []

  objectMap.forEach((descMap, objectName) => {
    // Find first item to get object code
    let objectCode: string | undefined
    descMap.forEach((items) => {
      if (items.length > 0 && !objectCode) {
        objectCode = items[0].object.code
      }
    })

    const descriptionGroups = Array.from(descMap.entries()).map(
      ([description, items]) => ({
        description,
        items,
      }),
    )

    grouped.push({
      objectName,
      objectCode,
      descriptionGroups,
    })
  })

  return grouped
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function WFPLineItemsView({
  data,
  onViewItem,
  onEditItem,
  onDeleteItem,
  isDeletingItemId,
  readOnly = false,
}: WFPLineItemsViewProps) {
  const allItems = data.flatMap((group) =>
    group.items.map((groupedItem) => groupedItem.item),
  )

  if (allItems.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center py-12">
          <p className="text-gray-500 font-medium">No line items found</p>
          <p className="text-sm text-gray-400 mt-1">
            Click "Add Line Items" to add items
          </p>
        </CardContent>
      </Card>
    )
  }

  const groupedData = groupItemsByObjectAndDescription(data)

  return (
    <div className="space-y-6">
      {groupedData.map((objectGroup) => {
        const objectTotalBudget = objectGroup.descriptionGroups.reduce(
          (sum, descGroup) =>
            sum + descGroup.items.reduce((dSum, item) => dSum + item.budget, 0),
          0,
        )
        const objectItemCount = objectGroup.descriptionGroups.reduce(
          (sum, descGroup) => sum + descGroup.items.length,
          0,
        )

        return (
          <div key={objectGroup.objectName} className="space-y-3">
            {/* Object Name Header */}
            <div className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {objectGroup.objectName}
                  </h2>
                  {objectGroup.objectCode && (
                    <p className="text-sm text-gray-600 mt-1">
                      Code: {objectGroup.objectCode}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 mb-1">
                    {objectItemCount} item{objectItemCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-lg font-semibold text-blue-600">
                    ₱{formatCurrency(objectTotalBudget)}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Groups */}
            <div className="space-y-2 ml-4">
              {objectGroup.descriptionGroups.map((descGroup) => {
                const descTotalBudget = descGroup.items.reduce(
                  (sum, item) => sum + item.budget,
                  0,
                )

                return (
                  <div
                    key={descGroup.description}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Description Subheader */}
                    <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-900">
                        {descGroup.description}
                      </h3>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">
                          {descGroup.items.length} item
                          {descGroup.items.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          ₱{formatCurrency(descTotalBudget)}
                        </p>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left px-4 py-2 font-medium text-gray-700">
                              Item Name
                            </th>
                            <th className="text-center px-4 py-2 font-medium text-gray-700">
                              Qty
                            </th>
                            <th className="text-right px-4 py-2 font-medium text-gray-700">
                              Unit Cost
                            </th>
                            <th className="text-right px-4 py-2 font-medium text-gray-700">
                              Budget
                            </th>
                            <th className="text-center px-4 py-2 font-medium text-gray-700">
                              Timeline
                            </th>
                            <th className="text-center px-4 py-2 font-medium text-gray-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {descGroup.items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-gray-900">
                                <div>
                                  <p className="font-medium line-clamp-1">
                                    {item.object.name}
                                  </p>
                                  {item.object.code && (
                                    <p className="text-xs text-gray-500">
                                      {item.object.code}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-gray-900">
                                {item.unitQuantity || '-'}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-900">
                                {item.unitCost !== null &&
                                item.unitCost !== undefined ? (
                                  <>₱{formatCurrency(item.unitCost)}</>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-blue-600">
                                ₱{formatCurrency(item.budget)}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-900">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {item.timelineType}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex gap-1 justify-center">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onViewItem(item)}
                                    title="View details"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {!readOnly && (
                                    <>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onEditItem(item)}
                                        title="Edit item"
                                        className="h-8 w-8 p-0"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onDeleteItem(item)}
                                        disabled={isDeletingItemId === item.id}
                                        title="Delete item"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
