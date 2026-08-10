import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { CreateWFPFormValues } from './form/CreateWFPForm'

// Keys for localStorage persistence
const STORAGE_KEYS = {
  DIALOG_STATES: 'wfp_dialog_states',
  FORM_DATA: 'wfp_form_data',
  TABLE_STATES: 'wfp_table_states',
} as const

// Dialog state types
export interface DialogStates {
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
  createForm: Partial<CreateWFPFormValues>
  updateForm: Partial<CreateWFPFormValues & { id: string }>
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
    officeId: '',
    projectTitle: '',
    projectStartDate: '',
    projectEndDate: '',
    generalObjective: '',
    description: '',
    fiscalYearId: '',
    proposedBudget: 0,
    mode: null,
  },
  updateForm: {
    officeId: '',
    projectTitle: '',
    projectStartDate: '',
    projectEndDate: '',
    generalObjective: '',
    description: '',
    fiscalYearId: '',
    proposedBudget: 0,
    mode: null,
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
export const wfpDialogStatesAtom = atomWithStorage<DialogStates>(
  STORAGE_KEYS.DIALOG_STATES,
  defaultDialogStates,
)

export const wfpFormDataAtom = atomWithStorage<FormData>(
  STORAGE_KEYS.FORM_DATA,
  defaultFormData,
)

export const wfpTableStatesAtom = atomWithStorage<TableStates>(
  STORAGE_KEYS.TABLE_STATES,
  defaultTableStates,
)

// Individual dialog atoms for easier access
export const createDialogAtom = atom(
  (get) => get(wfpDialogStatesAtom).createDialog,
  (get, set, update: Partial<DialogStates['createDialog']>) => {
    const current = get(wfpDialogStatesAtom)
    set(wfpDialogStatesAtom, {
      ...current,
      createDialog: { ...current.createDialog, ...update },
    })
  },
)

export const updateDialogAtom = atom(
  (get) => get(wfpDialogStatesAtom).updateDialog,
  (get, set, update: Partial<DialogStates['updateDialog']>) => {
    const current = get(wfpDialogStatesAtom)
    set(wfpDialogStatesAtom, {
      ...current,
      updateDialog: { ...current.updateDialog, ...update },
    })
  },
)

export const deleteDialogAtom = atom(
  (get) => get(wfpDialogStatesAtom).deleteDialog,
  (get, set, update: Partial<DialogStates['deleteDialog']>) => {
    const current = get(wfpDialogStatesAtom)
    set(wfpDialogStatesAtom, {
      ...current,
      deleteDialog: { ...current.deleteDialog, ...update },
    })
  },
)

export const deleteMultipleDialogAtom = atom(
  (get) => get(wfpDialogStatesAtom).deleteMultipleDialog,
  (get, set, update: Partial<DialogStates['deleteMultipleDialog']>) => {
    const current = get(wfpDialogStatesAtom)
    set(wfpDialogStatesAtom, {
      ...current,
      deleteMultipleDialog: { ...current.deleteMultipleDialog, ...update },
    })
  },
)

export const approveDialogAtom = atom(
  (get) => get(wfpDialogStatesAtom).approveDialog,
  (get, set, update: Partial<DialogStates['approveDialog']>) => {
    const current = get(wfpDialogStatesAtom)
    set(wfpDialogStatesAtom, {
      ...current,
      approveDialog: { ...current.approveDialog, ...update },
    })
  },
)

// Form data atoms
export const createFormDataAtom = atom(
  (get) => get(wfpFormDataAtom).createForm,
  (get, set, update: Partial<CreateWFPFormValues>) => {
    const current = get(wfpFormDataAtom)
    set(wfpFormDataAtom, {
      ...current,
      createForm: { ...current.createForm, ...update },
    })
  },
)

export const updateFormDataAtom = atom(
  (get) => get(wfpFormDataAtom).updateForm,
  (get, set, update: Partial<CreateWFPFormValues & { id: string }>) => {
    const current = get(wfpFormDataAtom)
    set(wfpFormDataAtom, {
      ...current,
      updateForm: { ...current.updateForm, ...update },
    })
  },
)

// Helper atoms
export const hasUnsavedCreateFormAtom = atom((get) => {
  const formData = get(createFormDataAtom)
  return (
    (formData.officeId?.length ?? 0) > 0 ||
    (formData.projectTitle?.length ?? 0) > 0 ||
    (formData.projectStartDate?.length ?? 0) > 0 ||
    (formData.projectEndDate?.length ?? 0) > 0 ||
    (formData.generalObjective?.length ?? 0) > 0 ||
    (formData.description?.length ?? 0) > 0 ||
    (formData.fiscalYearId?.length ?? 0) > 0 ||
    (formData.proposedBudget ?? 0) > 0 ||
    (formData.mode !== null && formData.mode !== undefined)
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
