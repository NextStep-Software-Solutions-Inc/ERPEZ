import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Storage key for table states
const TABLE_STORAGE_KEY = 'subkpi_table_states'

// Table state types
export interface SubKpiTableStates {
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
export const defaultTableStates: SubKpiTableStates = {
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
export const subKpiTableStatesAtom = atomWithStorage<SubKpiTableStates>(
    TABLE_STORAGE_KEY,
    defaultTableStates,
)

// Loading state atoms (in-memory)
export const subKpiLoadingAtom = atom<boolean>(false)
export const subKpiErrorAtom = atom<string | null>(null)

// Derived atoms for table state
export const tableSelectedRowsAtom = atom(
    (get) => get(subKpiTableStatesAtom).selectedRows,
    (get, set, selectedRows: Array<string>) => {
        const current = get(subKpiTableStatesAtom)
        set(subKpiTableStatesAtom, {
            ...current,
            selectedRows,
        })
    },
)

export const tablePaginationAtom = atom(
    (get) => get(subKpiTableStatesAtom).pagination,
    (get, set, pagination: Partial<SubKpiTableStates['pagination']>) => {
        const current = get(subKpiTableStatesAtom)
        set(subKpiTableStatesAtom, {
            ...current,
            pagination: { ...current.pagination, ...pagination },
        })
    },
)

export const tableSortingAtom = atom(
    (get) => get(subKpiTableStatesAtom).sorting,
    (get, set, sorting: SubKpiTableStates['sorting']) => {
        const current = get(subKpiTableStatesAtom)
        set(subKpiTableStatesAtom, {
            ...current,
            sorting,
        })
    },
)

export const tableColumnFiltersAtom = atom(
    (get) => get(subKpiTableStatesAtom).columnFilters,
    (get, set, columnFilters: SubKpiTableStates['columnFilters']) => {
        const current = get(subKpiTableStatesAtom)
        set(subKpiTableStatesAtom, {
            ...current,
            columnFilters,
        })
    },
)

export const tableGlobalFilterAtom = atom(
    (get) => get(subKpiTableStatesAtom).globalFilter,
    (get, set, globalFilter: string) => {
        const current = get(subKpiTableStatesAtom)
        set(subKpiTableStatesAtom, {
            ...current,
            globalFilter,
        })
    },
)

export const tableColumnVisibilityAtom = atom(
    (get) => get(subKpiTableStatesAtom).columnVisibility,
    (get, set, columnVisibility: Record<string, boolean>) => {
        const current = get(subKpiTableStatesAtom)
        set(subKpiTableStatesAtom, {
            ...current,
            columnVisibility,
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
    set(subKpiTableStatesAtom, defaultTableStates)
})
