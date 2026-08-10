import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Storage key for KPI table states
const KPI_TABLE_STORAGE_KEY = 'delivery_unit_kpi_table_states'

// Table state types
export interface KpiTableStates {
    selectedRows: Array<string>
    columnVisibility: Record<string, boolean>
    sorting: Array<{ id: string; desc: boolean }>
    columnFilters: Array<{ id: string; value: unknown }>
    globalFilter: string
    pagination: {
        pageIndex: number
        pageSize: number
    }
}

// Default table states
export const defaultKpiTableStates: KpiTableStates = {
    selectedRows: [],
    columnVisibility: {},
    sorting: [],
    columnFilters: [],
    globalFilter: '',
    pagination: {
        pageIndex: 0,
        pageSize: 10,
    },
}

// Persisted table state atom
export const kpiTableStatesAtom = atomWithStorage<KpiTableStates>(
    KPI_TABLE_STORAGE_KEY,
    defaultKpiTableStates,
)

// Loading state atoms (in-memory)
export const kpiLoadingAtom = atom<boolean>(false)
export const kpiErrorAtom = atom<string | null>(null)

// Derived atoms for table state
export const kpiTableSelectedRowsAtom = atom(
    (get) => get(kpiTableStatesAtom).selectedRows,
    (get, set, selectedRows: Array<string>) => {
        const current = get(kpiTableStatesAtom)
        set(kpiTableStatesAtom, {
            ...current,
            selectedRows,
        })
    },
)

export const kpiTablePaginationAtom = atom(
    (get) => get(kpiTableStatesAtom).pagination,
    (get, set, pagination: Partial<KpiTableStates['pagination']>) => {
        const current = get(kpiTableStatesAtom)
        set(kpiTableStatesAtom, {
            ...current,
            pagination: { ...current.pagination, ...pagination },
        })
    },
)

export const kpiTableSortingAtom = atom(
    (get) => get(kpiTableStatesAtom).sorting,
    (get, set, sorting: KpiTableStates['sorting']) => {
        const current = get(kpiTableStatesAtom)
        set(kpiTableStatesAtom, {
            ...current,
            sorting,
        })
    },
)

export const kpiTableColumnFiltersAtom = atom(
    (get) => get(kpiTableStatesAtom).columnFilters,
    (get, set, columnFilters: KpiTableStates['columnFilters']) => {
        const current = get(kpiTableStatesAtom)
        set(kpiTableStatesAtom, {
            ...current,
            columnFilters,
        })
    },
)

export const kpiTableGlobalFilterAtom = atom(
    (get) => get(kpiTableStatesAtom).globalFilter,
    (get, set, globalFilter: string) => {
        const current = get(kpiTableStatesAtom)
        set(kpiTableStatesAtom, {
            ...current,
            globalFilter,
        })
    },
)

export const kpiTableColumnVisibilityAtom = atom(
    (get) => get(kpiTableStatesAtom).columnVisibility,
    (get, set, columnVisibility: Record<string, boolean>) => {
        const current = get(kpiTableStatesAtom)
        set(kpiTableStatesAtom, {
            ...current,
            columnVisibility,
        })
    },
)

// Utility atoms for computed states
export const kpiSelectedRowCountAtom = atom(
    (get) => get(kpiTableSelectedRowsAtom).length,
)

// Reset table states
export const resetKpiTableStatesAtom = atom(null, (_get, set) => {
    set(kpiTableStatesAtom, defaultKpiTableStates)
})

// Cleanup function to remove localStorage entry
export const cleanupKpiStorage = () => {
    localStorage.removeItem(KPI_TABLE_STORAGE_KEY)
}
