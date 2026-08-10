import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Storage key for dialog states
const DIALOG_STORAGE_KEY = 'kpi_assignment_dialog_states'

// Dialog state types
export interface KpiAssignmentDialogStates {
    createDialog: {
        isOpen: boolean
        showUnsavedWarning: boolean
        deliveryUnitId: string | null
    }
}

// Default dialog states
export const defaultDialogStates: KpiAssignmentDialogStates = {
    createDialog: {
        isOpen: false,
        showUnsavedWarning: false,
        deliveryUnitId: null,
    },
}

// Persisted dialog states atom
export const kpiAssignmentDialogStatesAtom = atomWithStorage<KpiAssignmentDialogStates>(
    DIALOG_STORAGE_KEY,
    defaultDialogStates,
)

// Derived atoms for specific dialog states
export const createDialogAtom = atom(
    (get) => get(kpiAssignmentDialogStatesAtom).createDialog,
    (get, set, update: Partial<KpiAssignmentDialogStates['createDialog']>) => {
        const current = get(kpiAssignmentDialogStatesAtom)
        set(kpiAssignmentDialogStatesAtom, {
            ...current,
            createDialog: { ...current.createDialog, ...update },
        })
    },
)

// Action atoms for opening/closing dialogs
export const openCreateDialogAtom = atom(
    null,
    (_get, set, deliveryUnitId: string | null = null) => {
        set(createDialogAtom, { isOpen: true, showUnsavedWarning: false, deliveryUnitId })
    },
)

export const closeCreateDialogAtom = atom(null, (_get, set) => {
    set(createDialogAtom, { isOpen: false, showUnsavedWarning: false, deliveryUnitId: null })
})

// Reset dialog states
export const resetDialogStatesAtom = atom(null, (_get, set) => {
    set(kpiAssignmentDialogStatesAtom, defaultDialogStates)
})