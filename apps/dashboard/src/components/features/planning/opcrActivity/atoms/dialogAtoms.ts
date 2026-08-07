import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { OPCRActivity } from '../types'

// Storage key for dialog states
const DIALOG_STORAGE_KEY = 'opcr_activity_dialog_states'

// Dialog state types
export interface OpcrActivityDialogStates {
    createDialog: {
        isOpen: boolean
        showUnsavedWarning: boolean
    }
    editDialog: {
        isOpen: boolean
        showUnsavedWarning: boolean
    }
    deleteDialog: {
        isOpen: boolean
    }
}

// Default dialog states
export const defaultDialogStates: OpcrActivityDialogStates = {
    createDialog: {
        isOpen: false,
        showUnsavedWarning: false,
    },
    editDialog: {
        isOpen: false,
        showUnsavedWarning: false,
    },
    deleteDialog: {
        isOpen: false,
    },
}

// Persisted dialog states atom
export const opcrActivityDialogStatesAtom = atomWithStorage<OpcrActivityDialogStates>(
    DIALOG_STORAGE_KEY,
    defaultDialogStates,
)

// Derived atoms for specific dialog states
export const createDialogAtom = atom(
    (get) => get(opcrActivityDialogStatesAtom).createDialog,
    (get, set, update: Partial<OpcrActivityDialogStates['createDialog']>) => {
        const current = get(opcrActivityDialogStatesAtom)
        set(opcrActivityDialogStatesAtom, {
            ...current,
            createDialog: { ...current.createDialog, ...update },
        })
    },
)

export const editDialogAtom = atom(
    (get) => get(opcrActivityDialogStatesAtom).editDialog,
    (get, set, update: Partial<OpcrActivityDialogStates['editDialog']>) => {
        const current = get(opcrActivityDialogStatesAtom)
        set(opcrActivityDialogStatesAtom, {
            ...current,
            editDialog: { ...current.editDialog, ...update },
        })
    },
)

export const deleteDialogAtom = atom(
    (get) => get(opcrActivityDialogStatesAtom).deleteDialog,
    (get, set, update: Partial<OpcrActivityDialogStates['deleteDialog']>) => {
        const current = get(opcrActivityDialogStatesAtom)
        set(opcrActivityDialogStatesAtom, {
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

export const openEditDialogAtom = atom(null, (_get, set) => {
    set(editDialogAtom, { isOpen: true, showUnsavedWarning: false })
})

export const closeEditDialogAtom = atom(null, (_get, set) => {
    set(editDialogAtom, { isOpen: false, showUnsavedWarning: false })
})

export const openDeleteDialogAtom = atom(null, (_get, set) => {
    set(deleteDialogAtom, { isOpen: true })
})

export const closeDeleteDialogAtom = atom(null, (_get, set) => {
    set(deleteDialogAtom, { isOpen: false })
})

// Atoms for storing activity data for edit/delete operations
export const editingActivityAtom = atom<OPCRActivity | null>(null)
export const deletingActivityAtom = atom<OPCRActivity | null>(null)

// Reset dialog states
export const resetDialogStatesAtom = atom(null, (_get, set) => {
    set(opcrActivityDialogStatesAtom, defaultDialogStates)
})