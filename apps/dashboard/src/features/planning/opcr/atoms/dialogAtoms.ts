import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { OPCR } from '../types/type.opcr'

// Storage key for dialog states
const DIALOG_STORAGE_KEY = 'opcr_dialog_states'

// Dialog state types
export interface OpcrDialogStates {
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
    selectedId: string | null
    selectedOPCR: OPCR | null
  }
  deleteMultipleDialog: {
    isOpen: boolean
    selectedIds: Array<string>
  }
  submitDialog: {
    isOpen: boolean
    selectedId: string | null
  }
}

// Default dialog states
export const defaultDialogStates: OpcrDialogStates = {
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
    selectedId: null,
    selectedOPCR: null,
  },
  deleteMultipleDialog: {
    isOpen: false,
    selectedIds: [],
  },
  submitDialog: {
    isOpen: false,
    selectedId: null,
  },
}

// Persisted dialog states atom
export const opcrDialogStatesAtom = atomWithStorage<OpcrDialogStates>(
  DIALOG_STORAGE_KEY,
  defaultDialogStates,
)

// In-memory atoms
export const opcrListAtom = atom<Array<OPCR>>([])
export const selectedOPCRAtom = atom<OPCR | null>(null)

// Derived atoms for specific dialog states
export const createDialogAtom = atom(
  (get) => get(opcrDialogStatesAtom).createDialog,
  (get, set, update: Partial<OpcrDialogStates['createDialog']>) => {
    const current = get(opcrDialogStatesAtom)
    set(opcrDialogStatesAtom, {
      ...current,
      createDialog: { ...current.createDialog, ...update },
    })
  },
)

export const updateDialogAtom = atom(
  (get) => get(opcrDialogStatesAtom).updateDialog,
  (get, set, update: Partial<OpcrDialogStates['updateDialog']>) => {
    const current = get(opcrDialogStatesAtom)
    set(opcrDialogStatesAtom, {
      ...current,
      updateDialog: { ...current.updateDialog, ...update },
    })
  },
)

export const deleteDialogAtom = atom(
  (get) => get(opcrDialogStatesAtom).deleteDialog,
  (get, set, update: Partial<OpcrDialogStates['deleteDialog']>) => {
    const current = get(opcrDialogStatesAtom)
    set(opcrDialogStatesAtom, {
      ...current,
      deleteDialog: { ...current.deleteDialog, ...update },
    })
  },
)

export const deleteMultipleDialogAtom = atom(
  (get) => get(opcrDialogStatesAtom).deleteMultipleDialog,
  (get, set, update: Partial<OpcrDialogStates['deleteMultipleDialog']>) => {
    const current = get(opcrDialogStatesAtom)
    set(opcrDialogStatesAtom, {
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

export const openUpdateDialogAtom = atom(null, (_get, set, opcr: OPCR) => {
  set(updateDialogAtom, {
    isOpen: true,
    showUnsavedWarning: false,
    selectedId: opcr.id,
  })
})

export const closeUpdateDialogAtom = atom(null, (_get, set) => {
  set(updateDialogAtom, {
    isOpen: false,
    showUnsavedWarning: false,
    selectedId: null,
  })
})

export const openDeleteDialogAtom = atom(null, (_get, set, opcr: OPCR) => {
  set(deleteDialogAtom, {
    isOpen: true,
    selectedId: opcr.id,
    selectedOPCR: opcr,
  })
})

export const closeDeleteDialogAtom = atom(null, (_get, set) => {
  set(deleteDialogAtom, { isOpen: false, selectedId: null, selectedOPCR: null })
})

export const openDeleteMultipleDialogAtom = atom(
  null,
  (_get, set, selectedIds: Array<string>) => {
    set(deleteMultipleDialogAtom, { isOpen: true, selectedIds })
  },
)

export const closeDeleteMultipleDialogAtom = atom(null, (_get, set) => {
  set(deleteMultipleDialogAtom, { isOpen: false, selectedIds: [] })
})

export const submitDialogAtom = atom(
  (get) => get(opcrDialogStatesAtom).submitDialog,
  (get, set, update: Partial<OpcrDialogStates['submitDialog']>) => {
    const current = get(opcrDialogStatesAtom)
    set(opcrDialogStatesAtom, {
      ...current,
      submitDialog: { ...current.submitDialog, ...update },
    })
  },
)

export const openSubmitDialogAtom = atom(null, (_get, set, opcrId: string) => {
  set(submitDialogAtom, { isOpen: true, selectedId: opcrId })
})

export const closeSubmitDialogAtom = atom(null, (_get, set) => {
  set(submitDialogAtom, { isOpen: false, selectedId: null })
})

// Reset dialog states
export const resetDialogStatesAtom = atom(null, (_get, set) => {
  set(opcrDialogStatesAtom, defaultDialogStates)
})
