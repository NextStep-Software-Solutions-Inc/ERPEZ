/**
 * Handler: Get paginated Non-CSE Catalog Items (master list)
 * Supports server-side-style pagination, search, sorting, and filtering.
 */

import { getMockNonCseItems } from '../utils/catalogMockData'
import type {
  NonCseCatalogItem,
  CatalogQueryParams,
  CatalogPaginatedResult,
} from '../types'

type HandlerParams = {
  finalUrl: string
  params: Partial<CatalogQueryParams>
}

export const getCatalogMasterItemsRequest = {
  endpoint: '/catalog/master/items',
  key: ({ params }: { params: Partial<CatalogQueryParams> }) =>
    ['catalog-master', params] as const,
  fetcher: async ({
    params,
  }: HandlerParams): Promise<CatalogPaginatedResult> => {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 350))

    const {
      page = 1,
      pageSize = 50,
      search = '',
      sortBy = 'name',
      sortDir = 'asc',
      categoryFilter = null,
      statusFilter = 'all',
    } = params

    let items: NonCseCatalogItem[] = getMockNonCseItems()

    // ── Filter by search ──────────────────────────────────────────────────────
    const q = search.trim().toLowerCase()
    if (q) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.itemCode.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.toLowerCase().includes(q)),
      )
    }

    // ── Filter by category ────────────────────────────────────────────────────
    if (categoryFilter) {
      items = items.filter((item) => item.category === categoryFilter)
    }

    // ── Filter by status ──────────────────────────────────────────────────────
    if (statusFilter !== 'all') {
      items = items.filter((item) => item.status === statusFilter)
    }

    // ── Sort ──────────────────────────────────────────────────────────────────
    items = [...items].sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'category':
          cmp = a.category.localeCompare(b.category)
          break
        case 'currentPrice':
          cmp = a.currentPrice - b.currentPrice
          break
        case 'lastSurveyDate':
          cmp =
            new Date(a.lastSurveyDate).getTime() -
            new Date(b.lastSurveyDate).getTime()
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    // ── Paginate ──────────────────────────────────────────────────────────────
    const total = items.length
    const pageCount = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const data = items.slice(start, start + pageSize)

    return { data, total, page, pageSize, pageCount }
  },
}
