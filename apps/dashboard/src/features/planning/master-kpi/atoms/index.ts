/**
 * Master KPI Jotai Atoms for State Management
 */

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { MasterKPI, MasterKPIFormValues } from '../types'

/**
 * Dialog state atoms
 */
export const kpiDialogOpenAtom = atom(false)
export const kpiDialogModeAtom = atom<'create' | 'edit'>('create')
export const createKpiDialogOpenAtom = atom(false) // Deprecated
export const editKpiDialogOpenAtom = atom(false) // Deprecated
export const deleteKpiDialogOpenAtom = atom(false)
export const deleteMultipleKpisDialogOpenAtom = atom(false)

/**
 * Selected KPI for editing/deletion
 */
export const selectedKpiForEditAtom = atom<MasterKPI>()
export const selectedKpiForDeleteAtom = atom<MasterKPI>()
export const selectedKpiIdsAtom = atom<Record<string, boolean>>({})

/**
 * Form data persistence
 */
export const createKpiFormDataAtom = atomWithStorage<
  Partial<MasterKPIFormValues>
>('master-kpi-create-form-draft', {})

/**
 * Filter state
 */
export const kpiSearchFilterAtom = atom('')
export const kpiFunctionCategoryFilterAtom = atom<string>('all')
export const kpiMfoFilterAtom = atom<string>('')
export const kpiHierarchyFilterAtom = atom<'all' | 'parent' | 'sub'>('all')

/**
 * View mode for KPI display (card, table)
 */
export const kpiViewModeAtom = atomWithStorage<'card' | 'table'>(
  'master-kpi-view-mode',
  'card',
)

/**
 * Pagination & table state
 */
export const kpiTablePageAtom = atom(1)
export const kpiTablePageSizeAtom = atom(10)
export const kpiTableSortingAtom = atom<{ id: string; desc: boolean }[]>([])

/**
 * Table column filters state (for faceted filters)
 */
export const kpiTableColumnFiltersAtom = atom<{ id: string; value: unknown }[]>(
  [],
)

/**
 * Table column visibility state (persisted to localStorage)
 */
export const kpiTableColumnVisibilityAtom = atomWithStorage<
  Record<string, boolean>
>('master-kpi-column-visibility-v2', {
  select: true,
  code: false,
  name: true, // Performance Indicator
  monitoringFrequency: true,
  measurementUnit: false,
  isGAD: false,
  functionCategory: true,
  complianceTags: true,
  developmentGoals: true, // Unit SDG
  targetDistributionBehavior: false,
  isOptIn: true,
  isActive: true, // Status
  actions: true,
})

/**
 * Parent KPI selection (for creating sub-KPIs)
 */
export const selectedParentKpiAtom = atom<MasterKPI | null>(null)

/**
 * Card view display preferences
 */
export const kpiCardGridColumnsAtom = atomWithStorage<1 | 2 | 3 | 4>(
  'master-kpi-card-grid-columns',
  3,
)

export const kpiCardSortByAtom = atomWithStorage<
  'name' | 'code' | 'category' | 'status' | 'dateAdded'
>('master-kpi-card-sort-by', 'dateAdded')
