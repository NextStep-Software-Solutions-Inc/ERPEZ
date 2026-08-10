import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { createWFPObjectiveSchema } from './form/CreateWFPObjectiveForm'
import { updateWFPObjectiveSchema } from './form/UpdateWFPObjectiveForm'
import type { CreateWFPObjectiveValues} from './form/CreateWFPObjectiveForm';
import type { UpdateWFPObjectiveValues} from './form/UpdateWFPObjectiveForm';

// Keys for localStorage persistence
const STORAGE_KEYS = {
  DIALOG_STATES: 'wfp_objective_dialog_states',
  FORM_DATA: 'wfp_objective_form_data',
  TABLE_STATES: 'wfp_objective_table_states',
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
    selectedIds: Array<string>
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
  createForm: Partial<CreateWFPObjectiveValues>
  updateForm: Partial<UpdateWFPObjectiveValues & { id: string }>
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
    selectedIds: [],
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
    wfpId: '',
    wfpObjectives: [
      {
        description: '',
        weight: 0,
        outcome: '',
      }
    ],
  },
  updateForm: {
    wfpId: '',
    description: '',
    weight: 0,
    outcome: '',
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
export const wfpObjectiveDialogStatesAtom = atomWithStorage<DialogStates>(
  STORAGE_KEYS.DIALOG_STATES,
  defaultDialogStates,
)

export const wfpObjectiveFormDataAtom = atomWithStorage<FormData>(
  STORAGE_KEYS.FORM_DATA,
  defaultFormData,
)

export const wfpObjectiveTableStatesAtom = atomWithStorage<TableStates>(
  STORAGE_KEYS.TABLE_STATES,
  defaultTableStates,
)

// Individual dialog atoms for easier access
export const createDialogAtom = atom(
  (get) => get(wfpObjectiveDialogStatesAtom).createDialog,
  (get, set, update: Partial<DialogStates['createDialog']>) => {
    const current = get(wfpObjectiveDialogStatesAtom)
    set(wfpObjectiveDialogStatesAtom, {
      ...current,
      createDialog: { ...current.createDialog, ...update },
    })
  },
)

export const updateDialogAtom = atom(
  (get) => get(wfpObjectiveDialogStatesAtom).updateDialog,
  (get, set, update: Partial<DialogStates['updateDialog']>) => {
    const current = get(wfpObjectiveDialogStatesAtom)
    set(wfpObjectiveDialogStatesAtom, {
      ...current,
      updateDialog: { ...current.updateDialog, ...update },
    })
  },
)

export const deleteDialogAtom = atom(
  (get) => get(wfpObjectiveDialogStatesAtom).deleteDialog,
  (get, set, update: Partial<DialogStates['deleteDialog']>) => {
    const current = get(wfpObjectiveDialogStatesAtom)
    set(wfpObjectiveDialogStatesAtom, {
      ...current,
      deleteDialog: { ...current.deleteDialog, ...update },
    })
  },
)

export const deleteMultipleDialogAtom = atom(
  (get) => get(wfpObjectiveDialogStatesAtom).deleteMultipleDialog,
  (get, set, update: Partial<DialogStates['deleteMultipleDialog']>) => {
    const current = get(wfpObjectiveDialogStatesAtom)
    set(wfpObjectiveDialogStatesAtom, {
      ...current,
      deleteMultipleDialog: { ...current.deleteMultipleDialog, ...update },
    })
  },
)

export const approveDialogAtom = atom(
  (get) => get(wfpObjectiveDialogStatesAtom).approveDialog,
  (get, set, update: Partial<DialogStates['approveDialog']>) => {
    const current = get(wfpObjectiveDialogStatesAtom)
    set(wfpObjectiveDialogStatesAtom, {
      ...current,
      approveDialog: { ...current.approveDialog, ...update },
    })
  },
)

// Form data atoms
export const createFormDataAtom = atom(
  (get) => get(wfpObjectiveFormDataAtom).createForm,
  (get, set, update: Partial<CreateWFPObjectiveValues>) => {
    const current = get(wfpObjectiveFormDataAtom)
    const schemaKeys = Object.keys(createWFPObjectiveSchema.shape)
    const filteredUpdate = Object.fromEntries(
      Object.entries(update).filter(([key]) => schemaKeys.includes(key))
    ) as Partial<CreateWFPObjectiveValues>
    set(wfpObjectiveFormDataAtom, {
      ...current,
      createForm: { ...current.createForm, ...filteredUpdate },
    })
  },
)

export const updateFormDataAtom = atom(
  (get) => get(wfpObjectiveFormDataAtom).updateForm,
  (get, set, update: Partial<UpdateWFPObjectiveValues & { id: string }>) => {
    const current = get(wfpObjectiveFormDataAtom)
    const schemaKeys = Object.keys(updateWFPObjectiveSchema.shape)
    const allowedKeys = [...schemaKeys, 'id']
    const filteredUpdate = Object.fromEntries(
      Object.entries(update).filter(([key]) => allowedKeys.includes(key))
    ) as Partial<UpdateWFPObjectiveValues & { id: string }>
    set(wfpObjectiveFormDataAtom, {
      ...current,
      updateForm: { ...current.updateForm, ...filteredUpdate },
    })
  },
)

// Helper atoms
export const hasUnsavedCreateFormAtom = atom((get) => {
  const formData = get(createFormDataAtom)
  
  // Check if wfpObjectives array has been modified
  if (formData.wfpObjectives && Array.isArray(formData.wfpObjectives)) {
    // Check if array length is different from default
    if (formData.wfpObjectives.length !== defaultFormData.createForm.wfpObjectives?.length) {
      return true
    }
    
    // Check if any objective has non-default values
    return formData.wfpObjectives.some((objective, index) => {
      const defaultObjective = defaultFormData.createForm.wfpObjectives?.[index]
      return (
        (objective.description && objective.description !== defaultObjective?.description) ||
        (objective.weight && objective.weight !== defaultObjective?.weight) ||
        (objective.outcome && objective.outcome !== defaultObjective?.outcome)
      )
    })
  }
  
  return false
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
