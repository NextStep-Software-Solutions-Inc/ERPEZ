import { atom } from 'jotai'

/**
 * Fiscal Year Atom
 * Global state for selected fiscal year in UACS code segments
 * Filters which codes are displayed and available for editing
 */
export const fiscalYearAtom = atom<number>(new Date().getFullYear())

/**
 * Selected Codes Atom
 * Tracks which codes are selected for batch operations (e.g., deactivate)
 */
export const selectedCodesAtom = atom<Set<string>>(new Set())

/**
 * Batch Deactivate Loading Atom
 * Loading state for batch deactivate operations
 */
export const batchDeactivateLoadingAtom = atom<boolean>(false)
