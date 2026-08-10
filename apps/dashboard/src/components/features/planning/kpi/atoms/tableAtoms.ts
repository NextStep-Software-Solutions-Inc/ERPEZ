import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Storage key for table states
const TABLE_STORAGE_KEY = 'kpi_table_states'

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
    functionTypeFilter?: string
}

// Default table states
export const defaultTableStates: KpiTableStates = {
    selectedRows: [],
    columnVisibility: {},
    sorting: [],
    columnFilters: [],
    globalFilter: '',
    pagination: {
        pageIndex: 0,
        pageSize: 10,
    },
    functionTypeFilter: undefined,
}

// Persisted table state atom
export const kpiTableStatesAtom = atomWithStorage<KpiTableStates>(
    TABLE_STORAGE_KEY,
    defaultTableStates,
)

// Loading state atoms (in-memory)
export const kpiLoadingAtom = atom<boolean>(false)
export const kpiErrorAtom = atom<string | null>(null)

// Derived atoms for table state
export const tableSelectedRowsAtom = atom(
    (get) => get(kpiTableStatesAtom).selectedRows,
    (get, set, selectedRows: Array<string>) => {
        const current = get(kpiTableStatesAtom)
        set(kpiTableStatesAtom, {
            ...current,
            selectedRows,
        })
    },
)

export const tablePaginationAtom = atom(
    (get) => get(kpiTableStatesAtom).pagination,
    (get, set, pagination: Partial<KpiTableStates['pagination']>) => {
        const current = get(kpiTableStatesAtom)
        set(kpiTableStatesAtom, {
            ...current,
            pagination: { ...current.pagination, ...pagination },
        })
    },
)

export const tableSortingAtom = atom(
    (get) => get(kpiTableStatesAtom).sorting,
    (get, set, sorting: KpiTableStates['sorting']) => {
        const current = get(kpiTableStatesAtom)
        set(kpiTableStatesAtom, {
            ...current,
            sorting,
        })
    },
)

export const tableColumnFiltersAtom = atom(
    (get) => get(kpiTableStatesAtom).columnFilters,
    (get, set, columnFilters: KpiTableStates['columnFilters']) => {
        const current = get(kpiTableStatesAtom)
        set(kpiTableStatesAtom, {
            ...current,
            columnFilters,
        })
    },
)

export const tableGlobalFilterAtom = atom(
    (get) => get(kpiTableStatesAtom).globalFilter,
    (get, set, globalFilter: string) => {
        const current = get(kpiTableStatesAtom)
        set(kpiTableStatesAtom, {
            ...current,
            globalFilter,
        })
    },
)

export const tableColumnVisibilityAtom = atom(
    (get) => get(kpiTableStatesAtom).columnVisibility,
    (get, set, columnVisibility: Record<string, boolean>) => {
        const current = get(kpiTableStatesAtom)
        set(kpiTableStatesAtom, {
            ...current,
            columnVisibility,
        })
    },
)

export const tableFunctionTypeFilterAtom = atom(
    (get) => get(kpiTableStatesAtom).functionTypeFilter,
    (get, set, functionTypeFilter: string | undefined) => {
        const current = get(kpiTableStatesAtom)
        set(kpiTableStatesAtom, {
            ...current,
            functionTypeFilter,
        })
    },
)

// Utility atoms for computed states
export const selectedRowCountAtom = atom(
    (get) => get(tableSelectedRowsAtom).length,
)

export const canDeleteMultipleAtom = atom(
    (get) => get(selectedRowCountAtom) > 0,
)

// Reset table states
export const resetTableStatesAtom = atom(null, (_get, set) => {
    set(kpiTableStatesAtom, defaultTableStates)
})
