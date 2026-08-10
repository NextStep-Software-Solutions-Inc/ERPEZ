/**
 * Handler: Get paginated Catalog Items with optional search & type filter
 */

import { mockCseCatalogItems, mockNonCseCatalogItems } from '../data/mockPpmpData'
import type { CatalogItem } from '../types'

interface GetCatalogParams {
  finalUrl: string
  type: 'cse' | 'non-cse'
  search?: string
  category?: string | null
  unitOfMeasure?: string | null
  minPrice?: number | null
  maxPrice?: number | null
  page?: number
  pageSize?: number
}

export const getCatalogItemsRequest = {
  endpoint: '/catalogs/items',
  key: ({
    type,
    search,
    category,
    unitOfMeasure,
    minPrice,
    maxPrice,
    page,
  }: {
    type: string
    search?: string
    category?: string | null
    unitOfMeasure?: string | null
    minPrice?: number | null
    maxPrice?: number | null
    page?: number
  }) =>
    ['catalog', type, search, category, unitOfMeasure, minPrice, maxPrice, page] as const,
  fetcher: async (
    params: GetCatalogParams,
  ): Promise<{ data: CatalogItem[]; total: number; page: number; pageSize: number }> => {
    await new Promise((r) => setTimeout(r, 400))

    const allItems =
      params.type === 'cse' ? mockCseCatalogItems : mockNonCseCatalogItems

    const query = params.search?.toLowerCase().trim() ?? ''
    const filtered = query
      ? allItems.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.itemCode.toLowerCase().includes(query),
        )
      : allItems

    const byCategory =
      params.category && params.category !== 'all'
        ? filtered.filter((item) => item.category === params.category)
        : filtered

    const byUom =
      params.unitOfMeasure && params.unitOfMeasure !== 'all'
        ? byCategory.filter((item) => item.unitOfMeasure === params.unitOfMeasure)
        : byCategory

    const byMinPrice =
      typeof params.minPrice === 'number'
        ? byUom.filter((item) => item.unitPrice >= params.minPrice!)
        : byUom

    const byMaxPrice =
      typeof params.maxPrice === 'number'
        ? byMinPrice.filter((item) => item.unitPrice <= params.maxPrice!)
        : byMinPrice

    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const start = (page - 1) * pageSize
    const data = byMaxPrice.slice(start, start + pageSize)

    return { data, total: byMaxPrice.length, page, pageSize }
  },
}
