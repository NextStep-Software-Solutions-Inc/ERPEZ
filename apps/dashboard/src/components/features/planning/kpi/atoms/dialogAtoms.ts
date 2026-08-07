import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { KPI } from '../types'

// Storage key for dialog states
const DIALOG_STORAGE_KEY = 'kpi_dialog_states'

// Dialog state types
export interface KpiDialogStates {
    createDialog: {
        isOpen: boolean
        showUnsavedWarning: boolean
    }
    updateDialog: {
        isOpen: boolean
        showUnsavedWarning: boolean
        selectedId: string | null
    }
    deleteDialog: {
        isOpen: boolean
        selectedIds: Array<string>
        selectedKPIs: Array<KPI>
    }
}

// Default dialog states
export const defaultDialogStates: KpiDialogStates = {
    createDialog: {
        isOpen: false,
        showUnsavedWarning: false,
    },
    updateDialog: {
        isOpen: false,
        showUnsavedWarning: false,
        selectedId: null,
    },
    deleteDialog: {
        isOpen: false,
        selectedIds: [],
        selectedKPIs: [],
    },
}

// Persisted dialog states atom
export const kpiDialogStatesAtom = atomWithStorage<KpiDialogStates>(
    DIALOG_STORAGE_KEY,
    defaultDialogStates,
)

// In-memory atoms
export const kpiListAtom = atom<Array<KPI>>([])
export const selectedKPIAtom = atom<KPI | null>(null)

// Derived atoms for specific dialog states
export const createDialogAtom = atom(
    (get) => get(kpiDialogStatesAtom).createDialog,
    (get, set, update: Partial<KpiDialogStates['createDialog']>) => {
        const current = get(kpiDialogStatesAtom)
        set(kpiDialogStatesAtom, {
            ...current,
            createDialog: { ...current.createDialog, ...update },
        })
    },
)

export const updateDialogAtom = atom(
    (get) => get(kpiDialogStatesAtom).updateDialog,
    (get, set, update: Partial<KpiDialogStates['updateDialog']>) => {
        const current = get(kpiDialogStatesAtom)
        set(kpiDialogStatesAtom, {
            ...current,
            updateDialog: { ...current.updateDialog, ...update },
        })
    },
)

export const deleteDialogAtom = atom(
    (get) => get(kpiDialogStatesAtom).deleteDialog,
    (get, set, update: Partial<KpiDialogStates['deleteDialog']>) => {
        const current = get(kpiDialogStatesAtom)
        set(kpiDialogStatesAtom, {
            ...current,
            deleteDialog: { ...current.deleteDialog, ...update },
        })
    },
)

// Action atoms for opening/closing dialogs
export const openCreateDialogAtom = atom(null, (_get, set) => {
    set(createDialogAtom, { isOpen: true, showUnsavedWarning: false })
})

export const closeCreateDialogAtom = atom(null, (_get, set) => {
    set(createDialogAtom, { isOpen: false, showUnsavedWarning: false })
})

export const openUpdateDialogAtom = atom(
    null,
    (_get, set, kpi: KPI) => {
        set(updateDialogAtom, {
            isOpen: true,
            showUnsavedWarning: false,
            selectedId: kpi.id,
        })
    },
)

export const closeUpdateDialogAtom = atom(null, (_get, set) => {
    set(updateDialogAtom, {
        isOpen: false,
        showUnsavedWarning: false,
        selectedId: null,
    })
})

export const openDeleteDialogAtom = atom(null, (_get, set, kpis: Array<KPI>) => {
    const ids = kpis.map(kpi => kpi.id)
    set(deleteDialogAtom, { isOpen: true, selectedIds: ids, selectedKPIs: kpis })
})

export const closeDeleteDialogAtom = atom(null, (_get, set) => {
    set(deleteDialogAtom, { isOpen: false, selectedIds: [], selectedKPIs: [] })
})

// Reset dialog states
export const resetDialogStatesAtom = atom(null, (_get, set) => {
    set(kpiDialogStatesAtom, defaultDialogStates)
})
