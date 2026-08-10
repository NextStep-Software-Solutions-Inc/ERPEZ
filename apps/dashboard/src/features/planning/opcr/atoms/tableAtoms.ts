import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Storage key for table states
const TABLE_STORAGE_KEY = 'opcr_table_states'

// Table state types
export interface OpcrTableStates {
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
export const defaultTableStates: OpcrTableStates = {
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
export const opcrTableStatesAtom = atomWithStorage<OpcrTableStates>(
    TABLE_STORAGE_KEY,
    defaultTableStates,
)

// Loading state atoms (in-memory)
export const opcrLoadingAtom = atom<boolean>(false)
export const opcrErrorAtom = atom<string | null>(null)

// Derived atoms for table state
export const tableSelectedRowsAtom = atom(
    (get) => get(opcrTableStatesAtom).selectedRows,
    (get, set, selectedRows: Array<string>) => {
        const current = get(opcrTableStatesAtom)
        set(opcrTableStatesAtom, {
            ...current,
            selectedRows,
        })
    },
)

export const tablePaginationAtom = atom(
    (get) => get(opcrTableStatesAtom).pagination,
    (get, set, pagination: Partial<OpcrTableStates['pagination']>) => {
        const current = get(opcrTableStatesAtom)
        set(opcrTableStatesAtom, {
            ...current,
            pagination: { ...current.pagination, ...pagination },
        })
    },
)

export const tableSortingAtom = atom(
    (get) => get(opcrTableStatesAtom).sorting,
    (get, set, sorting: OpcrTableStates['sorting']) => {
        const current = get(opcrTableStatesAtom)
        set(opcrTableStatesAtom, {
            ...current,
            sorting,
        })
    },
)

export const tableColumnFiltersAtom = atom(
    (get) => get(opcrTableStatesAtom).columnFilters,
    (get, set, columnFilters: OpcrTableStates['columnFilters']) => {
        const current = get(opcrTableStatesAtom)
        set(opcrTableStatesAtom, {
            ...current,
            columnFilters,
        })
    },
)

export const tableGlobalFilterAtom = atom(
    (get) => get(opcrTableStatesAtom).globalFilter,
    (get, set, globalFilter: string) => {
        const current = get(opcrTableStatesAtom)
        set(opcrTableStatesAtom, {
            ...current,
            globalFilter,
        })
    },
)

export const tableColumnVisibilityAtom = atom(
    (get) => get(opcrTableStatesAtom).columnVisibility,
    (get, set, columnVisibility: Record<string, boolean>) => {
        const current = get(opcrTableStatesAtom)
        set(opcrTableStatesAtom, {
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
    set(opcrTableStatesAtom, defaultTableStates)
})
