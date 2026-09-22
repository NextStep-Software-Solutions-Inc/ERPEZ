import { useState, useCallback, useMemo } from 'react'
import { SortingState, PaginationState, Updater } from '@tanstack/react-table'

export interface SieveFilterRule {
  field: string
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | '@=' | '_=' | '@=*' | '_=*'
  value: string | number | boolean | undefined | null
}

export interface UseServerTableStateOptions {
  /** Initial page size (default: 10) */
  initialPageSize?: number
  /** Initial page index (0-based, default: 0) */
  initialPageIndex?: number
  /** Initial search query */
  initialSearch?: string
  /** Initial sorting state */
  initialSorting?: SortingState
  /** External navigation callback to sync with router if desired */
  onStateChange?: (state: {
    pageNumber: number
    pageSize: number
    searchQuery?: string
    sorts?: string
    filters?: string
  }) => void
}

/**
 * Converts TanStack table SortingState to Sieve sort string
 * e.g. [{ id: 'name', desc: true }, { id: 'code', desc: false }] -> "-name,code"
 */
export function formatSieveSorts(sorting: SortingState): string | undefined {
  if (!sorting || sorting.length === 0) return undefined
  return sorting
    .map((s) => `${s.desc ? '-' : ''}${s.id}`)
    .join(',')
}

/**
 * Parses a Sieve sort string into TanStack table SortingState
 * e.g. "-name,code" -> [{ id: 'name', desc: true }, { id: 'code', desc: false }]
 */
export function parseSieveSorts(sorts?: string): SortingState {
  if (!sorts || !sorts.trim()) return []
  return sorts.split(',').map((part) => {
    const trimmed = part.trim()
    if (trimmed.startsWith('-')) {
      return { id: trimmed.substring(1), desc: true }
    }
    return { id: trimmed, desc: false }
  })
}

/**
 * Combines multiple Sieve filter strings or rules with comma (AND)
 */
export function combineSieveFilters(
  ...parts: (string | undefined | null | false)[]
): string | undefined {
  const valid = parts.filter((p): p is string => Boolean(p && p.trim()))
  return valid.length > 0 ? valid.join(',') : undefined
}

export function useServerTableState(options: UseServerTableStateOptions = {}) {
  const {
    initialPageSize = 10,
    initialPageIndex = 0,
    initialSearch = '',
    initialSorting = [],
    onStateChange,
  } = options

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  })

  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch)

  // 1-based page number for backend APIs (e.g. Sieve)
  const pageNumber = pagination.pageIndex + 1
  const pageSize = pagination.pageSize

  const sortsString = useMemo(() => formatSieveSorts(sorting), [sorting])

  const handlePaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      setPagination((old) => {
        const next = typeof updater === 'function' ? updater(old) : updater
        onStateChange?.({
          pageNumber: next.pageIndex + 1,
          pageSize: next.pageSize,
          searchQuery: searchQuery || undefined,
          sorts: sortsString,
        })
        return next
      })
    },
    [onStateChange, searchQuery, sortsString],
  )

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      setSorting((old) => {
        const next = typeof updater === 'function' ? updater(old) : updater
        const nextSorts = formatSieveSorts(next)
        // Reset to page 1 on sort change
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        onStateChange?.({
          pageNumber: 1,
          pageSize,
          searchQuery: searchQuery || undefined,
          sorts: nextSorts,
        })
        return next
      })
    },
    [onStateChange, pageSize, searchQuery],
  )

  const handleSearchChange = useCallback(
    (newSearch: string) => {
      setSearchQuery(newSearch)
      // Reset to page 1 on search change
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
      onStateChange?.({
        pageNumber: 1,
        pageSize,
        searchQuery: newSearch || undefined,
        sorts: sortsString,
      })
    },
    [onStateChange, pageSize, sortsString],
  )

  const setPage = useCallback(
    (newPageNumber: number) => {
      const nextIndex = Math.max(0, newPageNumber - 1)
      setPagination((prev) => ({ ...prev, pageIndex: nextIndex }))
      onStateChange?.({
        pageNumber: newPageNumber,
        pageSize,
        searchQuery: searchQuery || undefined,
        sorts: sortsString,
      })
    },
    [onStateChange, pageSize, searchQuery, sortsString],
  )

  const setPageSize = useCallback(
    (newPageSize: number) => {
      setPagination({ pageIndex: 0, pageSize: newPageSize })
      onStateChange?.({
        pageNumber: 1,
        pageSize: newPageSize,
        searchQuery: searchQuery || undefined,
        sorts: sortsString,
      })
    },
    [onStateChange, searchQuery, sortsString],
  )

  const resetFiltersAndSearch = useCallback(() => {
    setSearchQuery('')
    setSorting([])
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    onStateChange?.({
      pageNumber: 1,
      pageSize,
      searchQuery: undefined,
      sorts: undefined,
    })
  }, [onStateChange, pageSize])

  return {
    // Pagination (0-based for TanStack, 1-based for API)
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    pageNumber,
    pagination,
    onPaginationChange: handlePaginationChange,
    setPage,
    setPageSize,

    // Sorting
    sorting,
    sortsString,
    onSortingChange: handleSortingChange,
    setSorting,

    // Search
    searchQuery,
    onSearchChange: handleSearchChange,
    setSearchQuery,

    // Reset
    resetFiltersAndSearch,
  }
}
