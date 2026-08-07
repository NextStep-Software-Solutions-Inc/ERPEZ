import { Card, CardContent } from '@/components/ui/card'
import { OrphanLineItemDetail } from '../../line-item-budget/types'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface OrphanLineItemsViewProps {
  data: OrphanLineItemDetail[]
  onDeleteItem?: (item: OrphanLineItemDetail) => void
  isDeletingItemId?: string
}

interface GroupedByObjectAndDescription {
  objectName: string
  objectCode?: string
  descriptionGroups: {
    description: string
    items: OrphanLineItemDetail[]
  }[]
}

const groupItemsByObjectAndDescription = (
  data: OrphanLineItemDetail[],
): GroupedByObjectAndDescription[] => {
  // Group by object name first
  const objectMap = new Map<string, Map<string, OrphanLineItemDetail[]>>()

  data.forEach((item) => {
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

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-PH')
  } catch {
    return 'N/A'
  }
}

export default function OrphanLineItemsView({
  data,
  onDeleteItem,
  isDeletingItemId,
}: OrphanLineItemsViewProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center py-12">
          <p className="text-gray-500 font-medium">
            No orphan line items found
          </p>
          <p className="text-sm text-gray-400 mt-1">
            All line items are properly linked to activities
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
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
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
                  <p className="text-lg font-semibold text-amber-600">
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
                    <div className="bg-amber-100 px-4 py-3 border-b flex justify-between items-center">
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
                              Item Description
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
                              Timeline Type
                            </th>
                            <th className="text-center px-4 py-2 font-medium text-gray-700">
                              Start Date
                            </th>
                            <th className="text-center px-4 py-2 font-medium text-gray-700">
                              End Date
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
                                  <p className="font-medium">
                                    {item.description || 'N/A'}
                                  </p>
                                  {item.wfpObjectiveActivityExpenditure
                                    ?.itemDescription && (
                                    <p className="text-xs text-gray-500">
                                      Source:{' '}
                                      {
                                        item.wfpObjectiveActivityExpenditure
                                          .itemDescription
                                      }
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-gray-900">
                                {item.unitQuantity || 0}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-900">
                                ₱{formatCurrency(item.unitCost || 0)}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                ₱{formatCurrency(item.budget || 0)}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-900">
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {item.timelineType || 'N/A'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center text-gray-900 text-xs">
                                {formatDate(item.startDate)}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-900 text-xs">
                                {formatDate(item.endDate)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDeleteItem?.(item)}
                                  disabled={isDeletingItemId === item.id}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
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
