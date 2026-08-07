import { useLocalStorage } from './useLocalStorage'

/**
 * Table state interface - includes sorting, filtering, pagination
 */
export interface KpiTableState {
    sortColumn?: string
    sortOrder?: 'asc' | 'desc'
    filters?: Record<string, any>
    pageSize?: number
    pageNumber?: number
}

/**
 * Column visibility and order state
 */
export interface KpiColumnState {
    visibility?: Record<string, boolean>
    order?: Array<string>
}

/**
 * Toolbar state - includes search and filter selections
 */
export interface KpiToolbarState {
    searchQuery?: string
    selectedFilters?: Record<string, any>
    activeTab?: string
}

const DEFAULT_TABLE_STATE: KpiTableState = {
    sortColumn: undefined,
    sortOrder: 'asc',
    filters: {},
    pageSize: 10,
    pageNumber: 1,
}

const DEFAULT_COLUMN_STATE: KpiColumnState = {
    visibility: {},
    order: [],
}

const DEFAULT_TOOLBAR_STATE: KpiToolbarState = {
    searchQuery: '',
    selectedFilters: {},
    activeTab: undefined,
}

/**
 * Hook for managing KPI table state persistence
 */
export function useKpiTableState() {
    const [tableState, setTableState, clearTableState] =
        useLocalStorage<KpiTableState>('kpiTableState', DEFAULT_TABLE_STATE)

    return {
        tableState,
        setTableState,
        clearTableState,
        updateTableState: (updates: Partial<KpiTableState>) => {
            setTableState((prev) => ({ ...prev, ...updates }))
        },
        resetTableState: () => clearTableState(),
    }
}

/**
 * Hook for managing KPI column visibility and order persistence
 */
export function useKpiColumnState() {
    const [columnState, setColumnState, clearColumnState] =
        useLocalStorage<KpiColumnState>('kpiColumnState', DEFAULT_COLUMN_STATE)

    return {
        columnState,
        setColumnState,
        clearColumnState,
        updateColumnState: (updates: Partial<KpiColumnState>) => {
            setColumnState((prev) => ({ ...prev, ...updates }))
        },
        resetColumnState: () => clearColumnState(),
        setVisibility: (visibility: Record<string, boolean>) => {
            setColumnState((prev) => ({ ...prev, visibility }))
        },
        setOrder: (order: Array<string>) => {
            setColumnState((prev) => ({ ...prev, order }))
        },
    }
}

/**
 * Hook for managing KPI toolbar state persistence
 */
export function useKpiToolbarState() {
    const [toolbarState, setToolbarState, clearToolbarState] =
        useLocalStorage<KpiToolbarState>('kpiToolbarState', DEFAULT_TOOLBAR_STATE)

    return {
        toolbarState,
        setToolbarState,
        clearToolbarState,
        updateToolbarState: (updates: Partial<KpiToolbarState>) => {
            setToolbarState((prev) => ({ ...prev, ...updates }))
        },
        resetToolbarState: () => clearToolbarState(),
        setSearchQuery: (query: string) => {
            setToolbarState((prev) => ({ ...prev, searchQuery: query }))
        },
        setSelectedFilters: (filters: Record<string, any>) => {
            setToolbarState((prev) => ({ ...prev, selectedFilters: filters }))
        },
    }
}

/**
 * Hook to clear all KPI-related state (table, column, toolbar)
 * Called on successful form submission or reset
 */
export function useKpiStateCleanup() {
    const { clearTableState } = useKpiTableState()
    const { clearColumnState } = useKpiColumnState()
    const { clearToolbarState } = useKpiToolbarState()

    return () => {
        clearTableState()
        clearColumnState()
        clearToolbarState()
    }
}
