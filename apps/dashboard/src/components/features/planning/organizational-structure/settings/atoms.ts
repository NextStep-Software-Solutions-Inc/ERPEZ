import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { AdministrativeLevel, AdministrativeLevelFormValues } from '@/components/features/planning/organizational-structure/types'

// Keys for localStorage persistence
const STORAGE_KEYS = {
  DIALOG_STATES: 'administrativeLevel_dialog_states',
  FORM_DATA: 'administrativeLevel_form_data',
  TABLE_STATES: 'administrativeLevel_table_states',
} as const

export const CREATE_FORM_STORAGE_KEY = 'createAdministrativeLevelFormData'
export const UPDATE_FORM_STORAGE_KEY = 'updateAdministrativeLevelFormData'

// Dialog state types
export interface DialogStates {
  createDialog: {
    isOpen: boolean
    mode: 'create' | 'add'
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
}

// Form data types
export interface FormData {
  createForm: Partial<AdministrativeLevelFormValues>
  updateForm: Partial<AdministrativeLevelFormValues>
}

// Table state types
export interface TableStates {
  selectedRows: Array<string>
  columnVisibility: Record<string, boolean>
  sorting: Array<{
    id: string
    desc: boolean
  }>
  columnFilters: Array<{
    id: string
    value: unknown
  }>
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
    mode: 'create',
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
}

const defaultFormData: FormData = {
  createForm: {
    name: '',
    code: '',
    canHaveChildren: false,
  },
  updateForm: {
    name: '',
    code: '',
    canHaveChildren: false,
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

// Persisted atoms (survive page refresh)
export const administrativeLevelDialogStatesAtom = atomWithStorage<DialogStates>(
  STORAGE_KEYS.DIALOG_STATES,
  defaultDialogStates,
)

export const administrativeLevelFormDataAtom = atomWithStorage<FormData>(
  STORAGE_KEYS.FORM_DATA,
  defaultFormData,
)

export const administrativeLevelTableStatesAtom = atomWithStorage<TableStates>(
  STORAGE_KEYS.TABLE_STATES,
  defaultTableStates,
)

// In-memory atoms (reset on page refresh)
export const administrativeLevelListAtom = atom<Array<AdministrativeLevel>>([])
export const administrativeLevelDetailsAtom = atom<AdministrativeLevel | null>(null)
export const loadingStatesAtom = atom({
  isFetching: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
})

// Types for the createDialog update, ensuring type safety
type CreateDialogState = DialogStates['createDialog']

type OpenCreatePayload = {
  isOpen: true // When opening, this must be true
  mode: 'create' | 'add'
  showUnsavedWarning?: boolean
}

// The overall update type (Partial of the slice or the strict open payload)
type CreateDialogUpdate = Partial<CreateDialogState> | OpenCreatePayload

// ----------------------------------------------------
// DIALOG ATOMS (DERIVED) - For easier access to specific dialog states
// ----------------------------------------------------

// Create Dialog atoms
export const createDialogAtom = atom(
  (get) => get(administrativeLevelDialogStatesAtom).createDialog,
  (get, set, update: CreateDialogUpdate) => {
    const current = get(administrativeLevelDialogStatesAtom)
    set(administrativeLevelDialogStatesAtom, {
      ...current,
      createDialog: { ...current.createDialog, ...update },
    })
  },
)

// Update Dialog atoms
export const updateDialogAtom = atom(
  (get) => get(administrativeLevelDialogStatesAtom).updateDialog,
  (get, set, update: Partial<DialogStates['updateDialog']>) => {
    const current = get(administrativeLevelDialogStatesAtom)
    set(administrativeLevelDialogStatesAtom, {
      ...current,
      updateDialog: { ...current.updateDialog, ...update },
    })
  },
)

// Delete Dialog atoms
export const deleteDialogAtom = atom(
  (get) => get(administrativeLevelDialogStatesAtom).deleteDialog,
  (get, set, update: Partial<DialogStates['deleteDialog']>) => {
    const current = get(administrativeLevelDialogStatesAtom)
    set(administrativeLevelDialogStatesAtom, {
      ...current,
      deleteDialog: { ...current.deleteDialog, ...update },
    })
  },
)

// Delete Multiple Dialog atoms
export const deleteMultipleDialogAtom = atom(
  (get) => get(administrativeLevelDialogStatesAtom).deleteMultipleDialog,
  (get, set, update: Partial<DialogStates['deleteMultipleDialog']>) => {
    const current = get(administrativeLevelDialogStatesAtom)
    set(administrativeLevelDialogStatesAtom, {
      ...current,
      deleteMultipleDialog: { ...current.deleteMultipleDialog, ...update },
    })
  },
)

// ----------------------------------------------------
// FORM DATA ATOMS (DERIVED)
// ----------------------------------------------------

// Create Form atoms
export const createFormDataAtom = atom(
  (get) => get(administrativeLevelFormDataAtom).createForm,
  (get, set, update: Partial<AdministrativeLevelFormValues>) => {
    const current = get(administrativeLevelFormDataAtom)
    set(administrativeLevelFormDataAtom, {
      ...current,
      createForm: { ...current.createForm, ...update },
    })
  },
)

// Update Form atoms
export const updateFormDataAtom = atom(
  (get) => get(administrativeLevelFormDataAtom).updateForm,
  (get, set, update: Partial<AdministrativeLevelFormValues>) => {
    const current = get(administrativeLevelFormDataAtom)
    set(administrativeLevelFormDataAtom, {
      ...current,
      updateForm: { ...current.updateForm, ...update },
    })
  },
)

// ----------------------------------------------------
// ACTION ATOMS (OPERATIONS)
// ----------------------------------------------------

// Open actions
export const openCreateDialogAtom = atom(null, (_, set, mode: 'create' | 'add' = 'create') => {
  set(createDialogAtom, { isOpen: true, mode, showUnsavedWarning: false })
})

export const openUpdateDialogAtom = atom(null, (_, set, administrativeLevel: AdministrativeLevel) => {
  // Pre-populate the form with current data
  set(updateFormDataAtom, {
    name: administrativeLevel.name,
    code: administrativeLevel.code,
    canHaveChildren: administrativeLevel.canHaveChildren,
  })
  set(updateDialogAtom, { isOpen: true, selectedId: administrativeLevel.id, showUnsavedWarning: false })
})

export const openDeleteDialogAtom = atom(null, (_, set, id: string) => {
  set(deleteDialogAtom, { isOpen: true, selectedId: id })
})

export const openDeleteMultipleDialogAtom = atom(
  null,
  (_, set, ids: Array<string>) => {
    set(deleteMultipleDialogAtom, { isOpen: true, selectedIds: ids })
  },
)

// Close actions
export const closeCreateDialogAtom = atom(null, (_, set, clearForm = false) => {
  set(createDialogAtom, { isOpen: false, mode: 'create', showUnsavedWarning: false })
  if (clearForm) {
    set(createFormDataAtom, defaultFormData.createForm)
  }
})

export const closeUpdateDialogAtom = atom(null, (_, set, clearForm = false) => {
  set(updateDialogAtom, { isOpen: false, selectedId: null, showUnsavedWarning: false })
  if (clearForm) {
    set(updateFormDataAtom, defaultFormData.updateForm)
  }
})

export const closeDeleteDialogAtom = atom(null, (_, set) => {
  set(deleteDialogAtom, { isOpen: false, selectedId: null })
})

export const closeDeleteMultipleDialogAtom = atom(null, (_, set) => {
  set(deleteMultipleDialogAtom, { isOpen: false, selectedIds: [] })
})

// Table state derived atoms
export const tableSelectedRowsAtom = atom(
  (get) => get(administrativeLevelTableStatesAtom).selectedRows,
  (get, set, selectedRows: Array<string>) => {
    const current = get(administrativeLevelTableStatesAtom)
    set(administrativeLevelTableStatesAtom, {
      ...current,
      selectedRows,
    })
  },
)

export const tablePaginationAtom = atom(
  (get) => get(administrativeLevelTableStatesAtom).pagination,
  (get, set, pagination: { pageIndex: number; pageSize: number }) => {
    const current = get(administrativeLevelTableStatesAtom)
    set(administrativeLevelTableStatesAtom, {
      ...current,
      pagination,
    })
  },
)

export const hasUnsavedCreateFormAtom = atom(false)
export const hasUnsavedUpdateFormAtom = atom(false)