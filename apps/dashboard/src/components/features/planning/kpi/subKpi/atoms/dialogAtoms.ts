import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { KPI } from '../../types'

// Storage key for dialog states
const DIALOG_STORAGE_KEY = 'subkpi_dialog_states'

// Dialog state types
export interface SubKpiDialogStates {
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
    }
    deleteMultipleDialog: {
        isOpen: boolean
        selectedIds: Array<string>
    }
}

// Default dialog states
export const defaultDialogStates: SubKpiDialogStates = {
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
    },
    deleteMultipleDialog: {
        isOpen: false,
        selectedIds: [],
    },
}

// Persisted dialog states atom
export const subKpiDialogStatesAtom = atomWithStorage<SubKpiDialogStates>(
    DIALOG_STORAGE_KEY,
    defaultDialogStates,
)

// In-memory atoms
export const subKpiListAtom = atom<Array<KPI>>([])
export const selectedSubKpiAtom = atom<KPI | null>(null)

// Derived atoms for specific dialog states
export const createDialogAtom = atom(
    (get) => get(subKpiDialogStatesAtom).createDialog,
    (get, set, update: Partial<SubKpiDialogStates['createDialog']>) => {
        const current = get(subKpiDialogStatesAtom)
        set(subKpiDialogStatesAtom, {
            ...current,
            createDialog: { ...current.createDialog, ...update },
        })
    },
)

export const updateDialogAtom = atom(
    (get) => get(subKpiDialogStatesAtom).updateDialog,
    (get, set, update: Partial<SubKpiDialogStates['updateDialog']>) => {
        const current = get(subKpiDialogStatesAtom)
        set(subKpiDialogStatesAtom, {
            ...current,
            updateDialog: { ...current.updateDialog, ...update },
        })
    },
)

export const deleteDialogAtom = atom(
    (get) => get(subKpiDialogStatesAtom).deleteDialog,
    (get, set, update: Partial<SubKpiDialogStates['deleteDialog']>) => {
        const current = get(subKpiDialogStatesAtom)
        set(subKpiDialogStatesAtom, {
            ...current,
            deleteDialog: { ...current.deleteDialog, ...update },
        })
    },
)

export const deleteMultipleDialogAtom = atom(
    (get) => get(subKpiDialogStatesAtom).deleteMultipleDialog,
    (get, set, update: Partial<SubKpiDialogStates['deleteMultipleDialog']>) => {
        const current = get(subKpiDialogStatesAtom)
        set(subKpiDialogStatesAtom, {
            ...current,
            deleteMultipleDialog: { ...current.deleteMultipleDialog, ...update },
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
    (_get, set, subKpi: KPI) => {
        set(updateDialogAtom, {
            isOpen: true,
            showUnsavedWarning: false,
            selectedId: subKpi.id,
        })
        set(selectedSubKpiAtom, subKpi)
    },
)

export const closeUpdateDialogAtom = atom(null, (_get, set) => {
    set(updateDialogAtom, {
        isOpen: false,
        showUnsavedWarning: false,
        selectedId: null,
    })
    set(selectedSubKpiAtom, null)
})

export const openDeleteDialogAtom = atom(null, (_get, set, ids: Array<string>) => {
    set(deleteDialogAtom, { isOpen: true, selectedIds: ids })
})

export const closeDeleteDialogAtom = atom(null, (_get, set) => {
    set(deleteDialogAtom, { isOpen: false, selectedIds: [] })
})

export const openDeleteMultipleDialogAtom = atom(null, (_get, set, selectedIds: Array<string>) => {
    set(deleteMultipleDialogAtom, { isOpen: true, selectedIds })
})

export const closeDeleteMultipleDialogAtom = atom(null, (_get, set) => {
    set(deleteMultipleDialogAtom, { isOpen: false, selectedIds: [] })
})

// Reset dialog states
export const resetDialogStatesAtom = atom(null, (_get, set) => {
    set(subKpiDialogStatesAtom, defaultDialogStates)
})
