import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { CreateWFPObjectiveTargetValues } from './form/CreateWFPObjectiveTargetForm'

// Keys for localStorage persistence
const STORAGE_KEYS = {
  DIALOG_STATES: 'wfp_objective_target_dialog_states',
  FORM_DATA: 'wfp_objective_target_form_data',
  TABLE_STATES: 'wfp_objective_target_table_states',
} as const

// Dialog state types
export interface DialogStates {
  createDialog: {
    isOpen: boolean
    showUnsavedWarning: boolean
    wfpId?: string
  }
  updateDialog: {
    isOpen: boolean
    showUnsavedWarning: boolean
    selectedId: string | null
  }
  deleteDialog: {
    isOpen: boolean
    selectedId: string | null
  }
  deleteMultipleDialog: {
    isOpen: boolean
    selectedIds: Array<string>
  }
  approveDialog: {
    isOpen: boolean
    selectedId: string | null
  }
}

// Form data types
export interface FormData {
  createForm: Partial<CreateWFPObjectiveTargetValues>
  updateForm: Partial<CreateWFPObjectiveTargetValues & { id: string }>
}

// Table state types
export interface TableStates {
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

// Default states
const defaultDialogStates: DialogStates = {
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
  },
  deleteMultipleDialog: {
    isOpen: false,
    selectedIds: [],
  },
  approveDialog: {
    isOpen: false,
    selectedId: null,
  },
}

const defaultFormData: FormData = {
  createForm: {
    wfpObjectiveId: '',
    activityName: '',
    indicator: '',
    weight: 0,
    dates: [],
  },
  updateForm: {
    wfpObjectiveId: '',
    activityName: '',
    indicator: '',
    weight: 0,
    dates: [],
  },
}

const defaultTableStates: TableStates = {
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

// Atoms with persistence
export const wfpObjectiveTargetDialogStatesAtom = atomWithStorage<DialogStates>(
  STORAGE_KEYS.DIALOG_STATES,
  defaultDialogStates,
)

export const wfpObjectiveTargetFormDataAtom = atomWithStorage<FormData>(
  STORAGE_KEYS.FORM_DATA,
  defaultFormData,
)

export const wfpObjectiveTargetTableStatesAtom = atomWithStorage<TableStates>(
  STORAGE_KEYS.TABLE_STATES,
  defaultTableStates,
)

// Individual dialog atoms for easier access
export const createDialogAtom = atom(
  (get) => get(wfpObjectiveTargetDialogStatesAtom).createDialog,
  (get, set, update: Partial<DialogStates['createDialog']>) => {
    const current = get(wfpObjectiveTargetDialogStatesAtom)
    set(wfpObjectiveTargetDialogStatesAtom, {
      ...current,
      createDialog: { ...current.createDialog, ...update },
    })
  },
)

export const updateDialogAtom = atom(
  (get) => get(wfpObjectiveTargetDialogStatesAtom).updateDialog,
  (get, set, update: Partial<DialogStates['updateDialog']>) => {
    const current = get(wfpObjectiveTargetDialogStatesAtom)
    set(wfpObjectiveTargetDialogStatesAtom, {
      ...current,
      updateDialog: { ...current.updateDialog, ...update },
    })
  },
)

export const deleteDialogAtom = atom(
  (get) => get(wfpObjectiveTargetDialogStatesAtom).deleteDialog,
  (get, set, update: Partial<DialogStates['deleteDialog']>) => {
    const current = get(wfpObjectiveTargetDialogStatesAtom)
    set(wfpObjectiveTargetDialogStatesAtom, {
      ...current,
      deleteDialog: { ...current.deleteDialog, ...update },
    })
  },
)

export const deleteMultipleDialogAtom = atom(
  (get) => get(wfpObjectiveTargetDialogStatesAtom).deleteMultipleDialog,
  (get, set, update: Partial<DialogStates['deleteMultipleDialog']>) => {
    const current = get(wfpObjectiveTargetDialogStatesAtom)
    set(wfpObjectiveTargetDialogStatesAtom, {
      ...current,
      deleteMultipleDialog: { ...current.deleteMultipleDialog, ...update },
    })
  },
)

export const approveDialogAtom = atom(
  (get) => get(wfpObjectiveTargetDialogStatesAtom).approveDialog,
  (get, set, update: Partial<DialogStates['approveDialog']>) => {
    const current = get(wfpObjectiveTargetDialogStatesAtom)
    set(wfpObjectiveTargetDialogStatesAtom, {
      ...current,
      approveDialog: { ...current.approveDialog, ...update },
    })
  },
)

// Form data atoms
export const createFormDataAtom = atom(
  (get) => get(wfpObjectiveTargetFormDataAtom).createForm,
  (get, set, update: Partial<CreateWFPObjectiveTargetValues>) => {
    const current = get(wfpObjectiveTargetFormDataAtom)
    set(wfpObjectiveTargetFormDataAtom, {
      ...current,
      createForm: { ...current.createForm, ...update },
    })
  },
)

export const updateFormDataAtom = atom(
  (get) => get(wfpObjectiveTargetFormDataAtom).updateForm,
  (get, set, update: Partial<CreateWFPObjectiveTargetValues & { id: string }>) => {
    const current = get(wfpObjectiveTargetFormDataAtom)
    set(wfpObjectiveTargetFormDataAtom, {
      ...current,
      updateForm: { ...current.updateForm, ...update },
    })
  },
)

// Helper atoms
export const hasUnsavedCreateFormAtom = atom((get) => {
  const formData = get(createFormDataAtom)
  return (
    (formData.wfpObjectiveId && formData.wfpObjectiveId !== defaultFormData.createForm.wfpObjectiveId) ||
    (formData.activityName &&
      formData.activityName !== defaultFormData.createForm.activityName) ||
    (formData.weight && formData.weight !== defaultFormData.createForm.weight) ||
    (formData.indicator &&
      formData.indicator !== defaultFormData.createForm.indicator)
  )
})

export const closeCreateDialogAtom = atom(
  null,
  (get, set, forceClose: boolean = false) => {
    if (forceClose) {
      set(createDialogAtom, { isOpen: false, showUnsavedWarning: false })
      set(createFormDataAtom, defaultFormData.createForm)
    } else {
      set(createDialogAtom, { isOpen: false })
    }
  },
)

export const closeUpdateDialogAtom = atom(
  null,
  (get, set, forceClose: boolean = false) => {
    if (forceClose) {
      set(updateDialogAtom, {
        isOpen: false,
        showUnsavedWarning: false,
        selectedId: null,
      })
      set(updateFormDataAtom, defaultFormData.updateForm)
    } else {
      set(updateDialogAtom, { isOpen: false })
    }
  },
)
