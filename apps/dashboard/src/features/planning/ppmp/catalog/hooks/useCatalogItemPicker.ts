/**
 * useCatalogItemPicker
 * Simplified hook for the PPMP Builder — returns only active items with optional
 * search and category filtering. Does not use pagination.
 */

import { useQuery } from '@tanstack/react-query'
import { getMockNonCseItems } from '../utils/catalogMockData'
import type { NonCseCatalogItem } from '../types'

interface UseCatalogItemPickerParams {
  search?: string
  category?: string | null
  enabled?: boolean
}

async function fetchActiveItems(
  search: string,
  category: string | null,
): Promise<NonCseCatalogItem[]> {
  await new Promise((r) => setTimeout(r, 200))
  let items = getMockNonCseItems().filter((i) => i.status === 'active')
  if (category) items = items.filter((i) => i.category === category)
  const q = search.trim().toLowerCase()
  if (q)
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.itemCode.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q),
    )
  return items.slice(0, 200) // cap for picker performance
}

export function useCatalogItemPicker({
  search = '',
  category = null,
  enabled = true,
}: UseCatalogItemPickerParams = {}) {
  return useQuery({
    queryKey: ['catalog-picker', search, category],
    queryFn: () => fetchActiveItems(search, category),
    enabled,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  })
}
