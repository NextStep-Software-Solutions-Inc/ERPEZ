import type {
  PriceCatalogueItem,
  PriceHistory,
} from '@/components/features/planning/procurement-library/types'
import type { ItemPriceListItem } from './types'

const normalizeYear = (value: string | null, fallbackDate: string): number => {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isNaN(parsed)) {
    return parsed
  }

  const dateYear = new Date(fallbackDate).getFullYear()
  return Number.isNaN(dateYear) ? 0 : dateYear
}

const getPriceHistoryEntry = (
  current: ItemPriceListItem,
  previous: ItemPriceListItem | undefined,
): PriceHistory[] | undefined => {
  if (!previous || previous.unitPrice === 0) {
    return undefined
  }

  const percentageChange =
    ((current.unitPrice - previous.unitPrice) / previous.unitPrice) * 100

  return [
    {
      id: `${current.id}-comparison`,
      previousPrice: previous.unitPrice,
      currentPrice: current.unitPrice,
      changedAt: current.updatedAt ?? current.createdAt,
      percentageChange,
    },
  ]
}

export const mapItemPricesToPriceCatalogueItems = (
  items:
    | Array<ItemPriceListItem>
    | { data?: Array<ItemPriceListItem> }
    | null
    | undefined,
): Array<PriceCatalogueItem> => {
  const normalizedItems = Array.isArray(items)
    ? items
    : Array.isArray(items?.data)
      ? items.data
      : []

  const grouped = new Map<string, Array<ItemPriceListItem>>()

  for (const item of normalizedItems) {
    const group = grouped.get(item.procurementItemId) ?? []
    group.push(item)
    grouped.set(item.procurementItemId, group)
  }

  const mappedItems: Array<PriceCatalogueItem> = []

  for (const group of grouped.values()) {
    const sortedGroup = [...group].sort((left, right) => {
      const leftYear = normalizeYear(left.fiscalYearYear, left.createdAt)
      const rightYear = normalizeYear(right.fiscalYearYear, right.createdAt)

      if (leftYear !== rightYear) {
        return leftYear - rightYear
      }

      return left.createdAt.localeCompare(right.createdAt)
    })

    sortedGroup.forEach((current, index) => {
      const previous = sortedGroup[index - 1]
      mappedItems.push({
        id: current.id,
        itemId: current.procurementItemId,
        itemName: current.procurementItemName ?? 'Unknown item',
        unitPrice: current.unitPrice,
        createdAt: current.createdAt,
        lastUpdated: current.updatedAt ?? current.createdAt,
        updatedAt: current.updatedAt,
        fiscalYear: normalizeYear(current.fiscalYearYear, current.createdAt),
        fiscalYearId: current.fiscalYearId,
        procurementItemId: current.procurementItemId,
        procurementItemName: current.procurementItemName,
        fiscalYearYear: current.fiscalYearYear,
        priceHistory: getPriceHistoryEntry(current, previous),
        deletedAt: null,
      })
    })
  }

  return mappedItems.sort((left, right) => {
    if (left.fiscalYear !== right.fiscalYear) {
      return right.fiscalYear - left.fiscalYear
    }

    return left.itemName.localeCompare(right.itemName)
  })
}
