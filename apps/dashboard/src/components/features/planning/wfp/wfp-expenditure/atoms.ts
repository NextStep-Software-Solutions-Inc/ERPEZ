import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { CreateWFPObjectiveTargetExpenditureValues } from './form/schema'
import type { UpdateWFPObjectiveTargetExpenditureValues } from './form/UpdateWFPObjectiveTargetExpenditureForm'
import type { WFPObjectiveTargetExpenditure, WFPObjectiveTargetExpenditureItem } from './table/types'

// Keys for localStorage persistence
const STORAGE_KEYS = {
  DIALOG_STATES: 'wfp_objective_expenditure_dialog_states',
  FORM_DATA: 'wfp_objective_expenditure_form_data',
  TABLE_STATES: 'wfp_objective_expenditure_table_states',
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
    selectedItem?: WFPObjectiveTargetExpenditure | WFPObjectiveTargetExpenditureItem | null
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
  createForm: CreateWFPObjectiveTargetExpenditureValues | null
  updateForm:
  | Partial<CreateWFPObjectiveTargetExpenditureValues & { id: string }>
  | Partial<UpdateWFPObjectiveTargetExpenditureValues & { id?: string }>
  | null
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
    selectedItem: undefined,
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
  createForm: null,
  updateForm: null,
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
export const wfpObjectiveExpenditureDialogStatesAtom = atomWithStorage<DialogStates>(
  STORAGE_KEYS.DIALOG_STATES,
  defaultDialogStates,
)

export const wfpObjectiveExpenditureFormDataAtom = atomWithStorage<FormData>(
  STORAGE_KEYS.FORM_DATA,
  defaultFormData,
)

export const wfpObjectiveExpenditureTableStatesAtom = atomWithStorage<TableStates>(
  STORAGE_KEYS.TABLE_STATES,
  defaultTableStates,
)

// Individual dialog atoms for easier access
export const createDialogAtom = atom(
  (get) => get(wfpObjectiveExpenditureDialogStatesAtom).createDialog,
  (get, set, update: Partial<DialogStates['createDialog']>) => {
    const current = get(wfpObjectiveExpenditureDialogStatesAtom)
    set(wfpObjectiveExpenditureDialogStatesAtom, {
      ...current,
      createDialog: { ...current.createDialog, ...update },
    })
  },
)

export const createFormDataAtom = atom(
  (get) => get(wfpObjectiveExpenditureFormDataAtom).createForm,
  (get, set, update: CreateWFPObjectiveTargetExpenditureValues | null) => {
    const current = get(wfpObjectiveExpenditureFormDataAtom)
    set(wfpObjectiveExpenditureFormDataAtom, {
      ...current,
      createForm: update,
    })
  },
)

export const closeCreateDialogAtom = atom(
  null,
  (_get, set, forceClose: boolean = false) => {
    if (forceClose) {
      set(createDialogAtom, { isOpen: false, showUnsavedWarning: false })
      set(createFormDataAtom, null)
    } else {
      set(createDialogAtom, { isOpen: false })
    }
  },
)

export const updateDialogAtom = atom(
  (get) => get(wfpObjectiveExpenditureDialogStatesAtom).updateDialog,
  (get, set, update: Partial<DialogStates['updateDialog']>) => {
    const current = get(wfpObjectiveExpenditureDialogStatesAtom)
    set(wfpObjectiveExpenditureDialogStatesAtom, {
      ...current,
      updateDialog: { ...current.updateDialog, ...update },
    })
  },
)

export const deleteDialogAtom = atom(
  (get) => get(wfpObjectiveExpenditureDialogStatesAtom).deleteDialog,
  (get, set, update: Partial<DialogStates['deleteDialog']>) => {
    const current = get(wfpObjectiveExpenditureDialogStatesAtom)
    set(wfpObjectiveExpenditureDialogStatesAtom, {
      ...current,
      deleteDialog: { ...current.deleteDialog, ...update },
    })
  },
)

export const deleteMultipleDialogAtom = atom(
  (get) => get(wfpObjectiveExpenditureDialogStatesAtom).deleteMultipleDialog,
  (get, set, update: Partial<DialogStates['deleteMultipleDialog']>) => {
    const current = get(wfpObjectiveExpenditureDialogStatesAtom)
    set(wfpObjectiveExpenditureDialogStatesAtom, {
      ...current,
      deleteMultipleDialog: { ...current.deleteMultipleDialog, ...update },
    })
  },
)

export const approveDialogAtom = atom(
  (get) => get(wfpObjectiveExpenditureDialogStatesAtom).approveDialog,
  (get, set, update: Partial<DialogStates['approveDialog']>) => {
    const current = get(wfpObjectiveExpenditureDialogStatesAtom)
    set(wfpObjectiveExpenditureDialogStatesAtom, {
      ...current,
      approveDialog: { ...current.approveDialog, ...update },
    })
  },
)

export const updateFormDataAtom = atom(
  (get) => get(wfpObjectiveExpenditureFormDataAtom).updateForm,
  (
    get,
    set,
    update:
      | Partial<CreateWFPObjectiveTargetExpenditureValues & { id: string }>
      | Partial<UpdateWFPObjectiveTargetExpenditureValues & { id?: string }>
      | null,
  ) => {
    const current = get(wfpObjectiveExpenditureFormDataAtom)
    set(wfpObjectiveExpenditureFormDataAtom, {
      ...current,
      updateForm: update,
    })
  },
)

// Helper atoms
export const hasUnsavedCreateFormAtom = atom((get) => {
  const formData = get(createFormDataAtom)
  if (!formData) return false

  const hasType = formData.wfpObjectiveTargetId !== ''
  const hasLines = Array.isArray(formData.expenditures) && formData.expenditures.some((exp) =>
    exp.lineItems.some((line) =>
      line.items.some((item) =>
        item.name !== '' ||
        item.unitEstimates !== 0 ||
        item.quantity !== 1
      ))
  )

  return hasType || hasLines
})

export const hasUnsavedUpdateFormAtom = atom((get) => {
  const formData = get(updateFormDataAtom)
  if (!formData) return false

  // If this is the single-item update shape
  if ('itemDescription' in formData) {
    const fd = formData as Partial<UpdateWFPObjectiveTargetExpenditureValues>
    const hasDescription = (fd.itemDescription ?? '') !== ''
    const hasQuantity = (fd.quantity ?? 0) > 1
    const hasCost = (fd.unitEstimates ?? 0) > 0
    return hasDescription || hasQuantity || hasCost
  }

  // If this is the full create/update form shape
  if ('expenditures' in formData) {
    const fd = formData as Partial<CreateWFPObjectiveTargetExpenditureValues>
    const hasLines =
      Array.isArray(fd.expenditures) &&
      fd.expenditures.some((exp) =>
        exp.lineItems?.some((line) =>
          line.items?.some((item) =>
            item.name !== '' || item.unitEstimates !== 0 || item.quantity !== 1,
          ),
        ),
      )

    return !!hasLines
  }

  return false
})

export const closeUpdateDialogAtom = atom(
  null,
  (_get, set, forceClose: boolean = false) => {
    if (forceClose) {
      set(updateDialogAtom, {
        isOpen: false,
        showUnsavedWarning: false,
        selectedId: null,
      })
      set(updateFormDataAtom, null)
    } else {
      set(updateDialogAtom, { isOpen: false })
    }
  },
)
