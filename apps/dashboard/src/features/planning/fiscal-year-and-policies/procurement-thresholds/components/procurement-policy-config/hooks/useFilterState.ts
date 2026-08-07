import { useState, useCallback } from 'react'

export interface ProcurementConfigFilterState {
  /** Selected procurement mode IDs (empty = show all) */
  modeIds: string[]
  /** Selected fiscal year ID (empty = show all) */
  fiscalYearId: string
  /** Minimum amount filter (undefined = no lower bound) */
  amountMin: number | undefined
  /** Maximum amount filter (undefined = no upper bound) */
  amountMax: number | undefined
}

const DEFAULT_FILTER_STATE: ProcurementConfigFilterState = {
  modeIds: [],
  fiscalYearId: '',
  amountMin: undefined,
  amountMax: undefined,
}

export function useFilterState() {
  const [filters, setFilters] =
    useState<ProcurementConfigFilterState>(DEFAULT_FILTER_STATE)

  const toggleModeFilter = useCallback((modeId: string) => {
    setFilters((prev) => ({
      ...prev,
      modeIds: prev.modeIds.includes(modeId)
        ? prev.modeIds.filter((id) => id !== modeId)
        : [...prev.modeIds, modeId],
    }))
  }, [])

  const setFiscalYearFilter = useCallback((fiscalYearId: string) => {
    setFilters((prev) => ({ ...prev, fiscalYearId }))
  }, [])

  const setAmountMinFilter = useCallback((value: number | undefined) => {
    setFilters((prev) => ({ ...prev, amountMin: value }))
  }, [])

  const setAmountMaxFilter = useCallback((value: number | undefined) => {
    setFilters((prev) => ({ ...prev, amountMax: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE)
  }, [])

  const hasActiveFilters =
    filters.modeIds.length > 0 ||
    filters.fiscalYearId !== '' ||
    filters.amountMin !== undefined ||
    filters.amountMax !== undefined

  return {
    filters,
    hasActiveFilters,
    toggleModeFilter,
    setFiscalYearFilter,
    setAmountMinFilter,
    setAmountMaxFilter,
    clearFilters,
  }
}
