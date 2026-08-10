import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { DUAllocation, DUAllocationDetails } from './table/types'
import type { FormValues } from './form/CreateBudgetAllocationForm'

// ------------------------------------
// Storage Keys (Budget Allocation)
// ------------------------------------
const STORAGE_KEYS = {
  DIALOG_STATES: 'budgetAllocation_dialog_states',
  FORM_DATA: 'budgetAllocation_form_data',
  TABLE_STATES: 'budgetAllocation_table_states',
} as const

export const CREATE_FORM_STORAGE_KEY = 'createBudgetAllocationFormData'
export const UPDATE_FORM_STORAGE_KEY = 'updateBudgetAllocationFormData'

// ------------------------------------
// Dialog State Types
// ------------------------------------
export interface DialogStates {
  createDialog: {
    isOpen: boolean
    mode: 'create' | 'add'
    initialFundSourceId?: string
    showUnsavedWarning: boolean
  }
  updateDialog: {
    isOpen: boolean
    showUnsavedWarning: boolean
    selectedId: string | null
    initialData?: Partial<FormValues>
  }
  deleteDialog: {
    isOpen: boolean
    selectedId: string | null
  }
  deleteMultipleDialog: {
    isOpen: boolean
    selectedIds: Array<string>
  }
}

// ------------------------------------
// Form Data Types
// ------------------------------------
export interface FormData {
  createForm: Partial<FormValues>
  updateForm: Partial<FormValues & { id: string }>
}

// ------------------------------------
// Table State Types
// ------------------------------------
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

// ------------------------------------
// Default States
// ------------------------------------
const defaultDialogStates: DialogStates = {
  createDialog: {
    isOpen: false,
    mode: 'create',
    initialFundSourceId: undefined,
    showUnsavedWarning: false,
  },
  updateDialog: {
    isOpen: false,
    showUnsavedWarning: false,
    selectedId: null,
    initialData: undefined,
  },
  deleteDialog: {
    isOpen: false,
    selectedId: null,
  },
  deleteMultipleDialog: {
    isOpen: false,
    selectedIds: [],
  },
}

const defaultFormData: FormData = {
  createForm: {
    deliveryUnitId: '',
    purpose: '',
    amount: 0,
    duFundAllocations: [
      {
        receivedFundId: '',
        amount: 0,
      },
    ],
  },
  updateForm: {
    purpose: '',
    amount: 0,
    duFundAllocations: [
      {
        receivedFundId: '',
        amount: 0,
      },
    ],
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

// ------------------------------------
// Persisted Atoms
// ------------------------------------
export const budgetAllocationDialogStatesAtom = atomWithStorage<DialogStates>(
  STORAGE_KEYS.DIALOG_STATES,
  defaultDialogStates,
)

export const budgetAllocationFormDataAtom = atomWithStorage<FormData>(
  STORAGE_KEYS.FORM_DATA,
  defaultFormData,
)

export const budgetAllocationTableStatesAtom = atomWithStorage<TableStates>(
  STORAGE_KEYS.TABLE_STATES,
  defaultTableStates,
)

// ------------------------------------
// In-Memory Atoms
// ------------------------------------
export const budgetAllocationListAtom = atom<Array<DUAllocation>>([])

export const budgetAllocationDetailsAtom = atom<DUAllocationDetails | null>(
  null,
)

export const loadingStatesAtom = atom({
  isFetching: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
})

// ------------------------------------
// createDialog Atom (Strict & Safe)
// ------------------------------------
type CreateDialogState = DialogStates['createDialog']

type OpenCreatePayload = {
  isOpen: true
  mode: 'create' | 'add'
  initialFundSourceId?: string
  showUnsavedWarning?: boolean
}

type CreateDialogUpdate = Partial<CreateDialogState> | OpenCreatePayload

export const createDialogAtom = atom(
  (get) => get(budgetAllocationDialogStatesAtom).createDialog,
  (get, set, update: CreateDialogUpdate) => {
    const current = get(budgetAllocationDialogStatesAtom)

    set(budgetAllocationDialogStatesAtom, {
      ...current,
      createDialog: {
        ...current.createDialog,
        ...update,
      },
    })
  },
)

// ------------------------------------
// Update / Delete Dialog Atoms
// ------------------------------------
export const updateDialogAtom = atom(
  (get) => get(budgetAllocationDialogStatesAtom).updateDialog,
  (get, set, update: Partial<DialogStates['updateDialog']>) => {
    const current = get(budgetAllocationDialogStatesAtom)
    set(budgetAllocationDialogStatesAtom, {
      ...current,
      updateDialog: { ...current.updateDialog, ...update },
    })
  },
)

export const deleteDialogAtom = atom(
  (get) => get(budgetAllocationDialogStatesAtom).deleteDialog,
  (get, set, update: Partial<DialogStates['deleteDialog']>) => {
    const current = get(budgetAllocationDialogStatesAtom)
    set(budgetAllocationDialogStatesAtom, {
      ...current,
      deleteDialog: { ...current.deleteDialog, ...update },
    })
  },
)

export const deleteMultipleDialogAtom = atom(
  (get) => get(budgetAllocationDialogStatesAtom).deleteMultipleDialog,
  (get, set, update: Partial<DialogStates['deleteMultipleDialog']>) => {
    const current = get(budgetAllocationDialogStatesAtom)
    set(budgetAllocationDialogStatesAtom, {
      ...current,
      deleteMultipleDialog: {
        ...current.deleteMultipleDialog,
        ...update,
      },
    })
  },
)
