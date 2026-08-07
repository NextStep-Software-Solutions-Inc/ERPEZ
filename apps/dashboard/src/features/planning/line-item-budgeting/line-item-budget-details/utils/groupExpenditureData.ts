import type { LineItemBudgetDetails } from '../types/types'

export interface GroupedLineItem {
  item: LineItemBudgetDetails
  totalBudget: number
}

export interface GroupedExpenditureData {
  groupName: string
  groupCode: string
  groupColor: string
  items: GroupedLineItem[]
  groupTotal: number
}

const COLOR_PALETTE = [
  'bg-blue-50 border-l-blue-500',
  'bg-emerald-50 border-l-emerald-500',
  'bg-amber-50 border-l-amber-500',
  'bg-purple-50 border-l-purple-500',
  'bg-pink-50 border-l-pink-500',
  'bg-cyan-50 border-l-cyan-500',
  'bg-indigo-50 border-l-indigo-500',
  'bg-green-50 border-l-green-500',
]

/**
 * Group line items by expenditure type (object name)
 */
export function groupExpenditureItems(
  items: LineItemBudgetDetails[],
): GroupedExpenditureData[] {
  const groupsMap = new Map<string, GroupedLineItem[]>()
  const groupMetadata = new Map<string, { code: string; index: number }>()

  // Group items by object name
  items.forEach((item) => {
    const groupKey = item.object?.name || 'Ungrouped'
    const code = item.object?.code || ''

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, [])
      groupMetadata.set(groupKey, {
        code,
        index: groupMetadata.size,
      })
    }

    groupsMap.get(groupKey)!.push({
      item,
      totalBudget: item.budget,
    })
  })

  // Transform to grouped data structure
  const grouped: GroupedExpenditureData[] = Array.from(groupsMap.entries()).map(
    ([groupName, groupItems]) => {
      const metadata = groupMetadata.get(groupName)!
      const groupTotal = groupItems.reduce((sum, g) => sum + g.totalBudget, 0)

      return {
        groupName,
        groupCode: metadata.code,
        groupColor: COLOR_PALETTE[metadata.index % COLOR_PALETTE.length],
        items: groupItems,
        groupTotal,
      }
    },
  )

  return grouped
}
