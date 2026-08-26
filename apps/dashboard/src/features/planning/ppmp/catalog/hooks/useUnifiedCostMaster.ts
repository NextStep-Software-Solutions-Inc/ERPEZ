/**
 * useUnifiedCostMaster
 * Unifies predefined/manual cost items with live approved Non-CSE catalog items.
 */

import { useMemo, useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  costMasterItemsAtom,
  toggleCostItemActiveAtom,
  nonCseOverridesAtom,
  toggleNonCseActiveAtom,
} from '../../atoms/costMasterAtoms'
import { useNonCSEItems } from './useNonCSEItemQueries'
import type { CostItemMaster } from '../../types'
import type { NONCSEItem } from '@/features/planning/non-cse-item/types/non-cse.type'

export function mapNonCSEItemToCostItem(
  item: NONCSEItem,
  overrides?: { isActive?: boolean },
): CostItemMaster {
  const isItemActive =
    overrides?.isActive !== undefined ? overrides.isActive : true

  return {
    id: item.id,
    costItemName: item.name || 'Unnamed Non-CSE Item',
    category: item.procurementCategoryName || item.type || 'Goods',
    subcategory: item.remarks || 'Approved Non-CSE',
    standardUnitCost: item.currentPrice ?? 0,
    unitOfMeasure: item.uomName || 'Unit',
    description: item.description || 'Approved Non-CSE Item',
    uacsCode: item.productCode || null,
    isActive: isItemActive,
    isCSE: false,
    source: 'non-cse',
    itemRequestId: item.itemRequestId || null,
    createdDate: item.createdAt ? new Date(item.createdAt) : new Date(),
    lastModified: item.createdAt ? new Date(item.createdAt) : new Date(),
  }
}

export function useUnifiedCostMaster() {
  const predefinedItems = useAtomValue(costMasterItemsAtom)
  const nonCseOverrides = useAtomValue(nonCseOverridesAtom)
  const togglePredefined = useSetAtom(toggleCostItemActiveAtom)
  const toggleNonCse = useSetAtom(toggleNonCseActiveAtom)

  const { data: nonCseResponse, isLoading, refetch } = useNonCSEItems({
    pageSize: 200,
  })

  const nonCseItems: CostItemMaster[] = useMemo(() => {
    const rawItems: NONCSEItem[] = nonCseResponse?.data || []
    return rawItems.map((item) =>
      mapNonCSEItemToCostItem(item, nonCseOverrides[item.id]),
    )
  }, [nonCseResponse?.data, nonCseOverrides])

  const allItems = useMemo(() => {
    // Map with deduplication by item id
    const itemsMap = new Map<string, CostItemMaster>()

    // 1. Add predefined items
    for (const item of predefinedItems) {
      itemsMap.set(item.id, item)
    }

    // 2. Add approved Non-CSE items
    for (const item of nonCseItems) {
      itemsMap.set(item.id, item)
    }

    return Array.from(itemsMap.values())
  }, [predefinedItems, nonCseItems])

  const activeItems = useMemo(
    () => allItems.filter((item) => item.isActive),
    [allItems],
  )

  const inactiveItems = useMemo(
    () => allItems.filter((item) => !item.isActive),
    [allItems],
  )

  const toggleActive = useCallback(
    (item: CostItemMaster) => {
      if (item.source === 'non-cse') {
        toggleNonCse(item.id)
      } else {
        togglePredefined(item.id)
      }
    },
    [toggleNonCse, togglePredefined],
  )

  return {
    items: allItems,
    activeItems,
    inactiveItems,
    isLoading,
    toggleActive,
    refetch,
  }
}
