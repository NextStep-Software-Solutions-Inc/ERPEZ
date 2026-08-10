/**
 * useCatalogItems
 * Fetches paginated Non-CSE catalog items using the mock handler.
 * Wraps the handler in React Query for caching and loading state.
 */

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { getCatalogMasterItemsRequest } from '../handlers/getCatalogMasterItemsRequest'
import {
  catalogPaginationAtom,
  catalogSortingAtom,
  catalogSearchAtom,
  catalogCategoryFilterAtom,
  catalogStatusFilterAtom,
} from '../atoms/catalogTableAtom'
import type { CatalogQueryParams } from '../types'

export function useCatalogItems() {
  const pagination = useAtomValue(catalogPaginationAtom)
  const sorting = useAtomValue(catalogSortingAtom)
  const search = useAtomValue(catalogSearchAtom)
  const categoryFilter = useAtomValue(catalogCategoryFilterAtom)
  const statusFilter = useAtomValue(catalogStatusFilterAtom)

  const params: Partial<CatalogQueryParams> = {
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    search,
    sortBy: (sorting[0]?.id as CatalogQueryParams['sortBy']) ?? 'name',
    sortDir: sorting[0]?.desc ? 'desc' : 'asc',
    categoryFilter,
    statusFilter,
  }

  return useQuery({
    queryKey: getCatalogMasterItemsRequest.key({ params }),
    queryFn: () =>
      getCatalogMasterItemsRequest.fetcher({
        finalUrl: getCatalogMasterItemsRequest.endpoint,
        params,
      }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (prev) => prev,
  })
}
