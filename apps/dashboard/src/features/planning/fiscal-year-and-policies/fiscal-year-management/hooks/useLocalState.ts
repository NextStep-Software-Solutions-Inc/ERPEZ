import { useState, useCallback } from 'react'
import type { FiscalYear } from '../types/types.ts'

interface CreateYearState {
  isDialogOpen: boolean
  year: number
  description: string
  error: string | null
}

interface StatusChangeState {
  isConfirmOpen: boolean
  pendingChange: {
    fiscalYear: FiscalYear
    newStatus: FiscalYear['status']
  } | null
  error: string | null
}

/**
 * Custom hook for managing fiscal year creation state
 */
export function useCreateFiscalYearState() {
  const [state, setState] = useState<CreateYearState>({
    isDialogOpen: false,
    year: new Date().getFullYear() + 1,
    description: '',
    error: null,
  })

  const setDialogOpen = useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, isDialogOpen: open }))
  }, [])

  const setYear = useCallback((year: number) => {
    setState((prev) => ({ ...prev, year }))
  }, [])

  const setDescription = useCallback((description: string) => {
    setState((prev) => ({ ...prev, description }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }))
  }, [])

  const reset = useCallback(() => {
    setState({
      isDialogOpen: false,
      year: new Date().getFullYear() + 1,
      description: '',
      error: null,
    })
  }, [])

  return { ...state, setDialogOpen, setYear, setDescription, setError, reset }
}

/**
 * Custom hook for managing status change confirmation state
 */
export function useStatusChangeState() {
  const [state, setState] = useState<StatusChangeState>({
    isConfirmOpen: false,
    pendingChange: null,
    error: null,
  })

  const initiate = useCallback(
    (fiscalYear: FiscalYear, newStatus: FiscalYear['status']) => {
      setState((prev) => ({
        ...prev,
        isConfirmOpen: true,
        pendingChange: { fiscalYear, newStatus },
      }))
    },
    [],
  )

  const confirm = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConfirmOpen: false,
    }))
  }, [])

  const cancel = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConfirmOpen: false,
      pendingChange: null,
    }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }))
  }, [])

  return { ...state, initiate, confirm, cancel, setError }
}

/**
 * Custom hook for managing expanded/collapsed state of fiscal years
 */
export function useExpandedYearState() {
  const [expandedYearId, setExpandedYearId] = useState<string | null>(null)
  const [loadingYearIds, setLoadingYearIds] = useState<Set<string>>(new Set())
  const [loadedYearIds, setLoadedYearIds] = useState<Set<string>>(new Set())

  const toggle = useCallback((yearId: string) => {
    setExpandedYearId((current) => (current === yearId ? null : yearId))
  }, [])

  const setLoading = useCallback((yearId: string, isLoading: boolean) => {
    if (isLoading) {
      setLoadingYearIds((prev) => new Set(prev).add(yearId))
    } else {
      setLoadingYearIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(yearId)
        return newSet
      })
    }
  }, [])

  const setLoaded = useCallback((yearId: string) => {
    setLoadedYearIds((prev) => new Set(prev).add(yearId))
  }, [])

  return {
    expandedYearId,
    loadingYearIds,
    loadedYearIds,
    toggle,
    setLoading,
    setLoaded,
  }
}
