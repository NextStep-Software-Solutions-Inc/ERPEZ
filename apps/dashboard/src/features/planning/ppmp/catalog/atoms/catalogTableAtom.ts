/**
 * Catalog Table State Atoms
 * Manages row selection, pagination, sorting, and column visibility.
 */

import { atom } from 'jotai'
import type {
  SortingState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table'

// ─── Row Selection ─────────────────────────────────────────────────────────────

/** Set of selected item IDs (multi-select state) */
export const catalogRowSelectionAtom = atom<RowSelectionState>({})

/** Derived: number of selected rows */
export const selectedCountAtom = atom((get) => {
  const rowSelection = get(catalogRowSelectionAtom)
  return Object.values(rowSelection).filter((isSelected) => isSelected).length
})

/** Derived: true when at least one row is selected (shows bulk toolbar) */
export const hasSelectionAtom = atom((get) => {
  const rowSelection = get(catalogRowSelectionAtom)
  return Object.values(rowSelection).some((isSelected) => isSelected)
})

// ─── Pagination ────────────────────────────────────────────────────────────────

export const catalogPaginationAtom = atom({
  pageIndex: 0,
  pageSize: 50,
})

export const catalogTotalItemsAtom = atom(0)

// ─── Sorting ───────────────────────────────────────────────────────────────────

export const catalogSortingAtom = atom<SortingState>([
  { id: 'name', desc: false },
])

// ─── Column Visibility ─────────────────────────────────────────────────────────

export const catalogColumnVisibilityAtom = atom<VisibilityState>({
  select: true,
  itemCode: false,
  name: true,
  category: true,
  currentPrice: true,
  lastSurveyDate: true,
  status: true,
  supplier: false,
})

// ─── Search & Filter ───────────────────────────────────────────────────────────

export const catalogSearchAtom = atom('')
export const catalogCategoryFilterAtom = atom<string | null>(null)
export const catalogStatusFilterAtom = atom<'all' | 'active' | 'inactive'>(
  'all',
)
