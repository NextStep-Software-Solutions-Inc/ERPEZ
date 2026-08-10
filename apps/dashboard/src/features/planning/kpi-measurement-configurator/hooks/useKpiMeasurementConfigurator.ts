import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { createMeasurementDialogOpenAtom } from '../atoms'
import { KpiLibrarySearchParams } from '@/routes/v2/kpi-library/constants'

export function useKpiMeasurementConfigurator() {
  const navigate = useNavigate({ from: '/v2/kpi-library' })
  const search = useSearch({
    from: '/v2/kpi-library/',
  }) as KpiLibrarySearchParams

  const {
    kpi: kpiParam,
    search: searchFilterParam,
    page: currentPageParam = 1,
    limit: pageSizeParam = 12,
    dimension: dimensionParam,
  } = search

  const [, setCreateDialogOpen] = useAtom(createMeasurementDialogOpenAtom)

  /**
   * Helper to update search params and keep URL in sync
   */
  const updateQueryParams = (params: Partial<KpiLibrarySearchParams>) => {
    navigate({
      to: '/v2/kpi-library',
      search: (prev) => ({
        ...prev,
        ...params,
      }),
      replace: true,
    })
  }

  // Effect to automatically open dialog if requested via URL (Configure Definition jump)
  useEffect(() => {
    if (kpiParam === 'new') {
      setCreateDialogOpen(true)
    }
  }, [kpiParam, setCreateDialogOpen])

  const handlePageChange = (page: number) => {
    updateQueryParams({ page })
  }

  const handlePageSizeChange = (limit: number) => {
    updateQueryParams({ page: 1, limit })
  }

  const handleSearchChange = (val: string) => {
    updateQueryParams({ search: val || undefined, page: 1 })
  }

  const handleKpiChange = (kpiId: string) => {
    updateQueryParams({ kpi: kpiId === 'all' ? undefined : kpiId, page: 1 })
  }

  const handleDimensionChange = (dimension: string) => {
    updateQueryParams({ dimension: dimension === 'all' ? undefined : dimension, page: 1 })
  }

  const handleClearFilters = () => {
    updateQueryParams({ search: undefined, kpi: undefined, dimension: undefined, page: 1 })
  }

  return {
    kpiParam,
    searchFilter: searchFilterParam || '',
    dimensionFilter: dimensionParam || 'all',
    currentPage: currentPageParam,
    pageSize: pageSizeParam,
    isFiltered:
      !!searchFilterParam ||
      (!!kpiParam && kpiParam !== 'all') ||
      (!!dimensionParam && dimensionParam !== 'all'),
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
    handleKpiChange,
    handleDimensionChange,
    handleClearFilters,
    setCreateDialogOpen,
  }
}
