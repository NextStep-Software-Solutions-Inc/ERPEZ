import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { FundReceiving, FundReceivingDetails } from './table/types'
import type { CreateFundReceivingFormValues } from './form/CreateFundReceivingForm'

// Keys for localStorage persistence
const STORAGE_KEYS = {
  DIALOG_STATES: 'fundReceiving_dialog_states',
  FORM_DATA: 'fundReceiving_form_data',
  TABLE_STATES: 'fundReceiving_table_states',
} as const

export const CREATE_FORM_STORAGE_KEY = 'createFundReceivingFormData'
export const UPDATE_FORM_STORAGE_KEY = 'updateFundReceivingFormData'

// Dialog state types
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
  createForm: Partial<CreateFundReceivingFormValues>
  updateForm: Partial<CreateFundReceivingFormValues & { id: string }>
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
    mode: 'create',
    initialFundSourceId: undefined,
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
    fundSourceId: '',
    amount: '',
    description: '',
    receivedDate: '',
  },
  updateForm: {
    amount: '',
    description: '',
    receivedDate: '',
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
export const fundReceivingDialogStatesAtom = atomWithStorage<DialogStates>(
  STORAGE_KEYS.DIALOG_STATES,
  defaultDialogStates,
)

export const fundReceivingFormDataAtom = atomWithStorage<FormData>(
  STORAGE_KEYS.FORM_DATA,
  defaultFormData,
)

export const fundReceivingTableStatesAtom = atomWithStorage<TableStates>(
  STORAGE_KEYS.TABLE_STATES,
  defaultTableStates,
)

// In-memory atoms (reset on page refresh)
export const fundReceivingListAtom = atom<Array<FundReceiving>>([])
export const fundReceivingDetailsAtom = atom<FundReceivingDetails | null>(null)
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
  initialFundSourceId?: string
  showUnsavedWarning?: boolean
}

// The overall update type (Partial of the slice or the strict open payload)
type CreateDialogUpdate = Partial<CreateDialogState> | OpenCreatePayload

// ----------------------------------------------------
// 🎯 createDialogAtom (The primary setter for the slice)
// ----------------------------------------------------

export const createDialogAtom = atom(
  (get) => get(fundReceivingDialogStatesAtom).createDialog,
  (get, set, update: CreateDialogUpdate) => {
    const current = get(fundReceivingDialogStatesAtom)
    const newCreateDialogState = {
      ...current.createDialog,
      ...update,
    }

    set(fundReceivingDialogStatesAtom, {
      ...current,
      createDialog: newCreateDialogState,
    })
  },
)

export const updateDialogAtom = atom(
  (get) => get(fundReceivingDialogStatesAtom).updateDialog,
  (get, set, update: Partial<DialogStates['updateDialog']>) => {
    const current = get(fundReceivingDialogStatesAtom)
    set(fundReceivingDialogStatesAtom, {
      ...current,
      updateDialog: { ...current.updateDialog, ...update },
    })
  },
)

export const deleteDialogAtom = atom(
  (get) => get(fundReceivingDialogStatesAtom).deleteDialog,
  (get, set, update: Partial<DialogStates['deleteDialog']>) => {
    const current = get(fundReceivingDialogStatesAtom)
    set(fundReceivingDialogStatesAtom, {
      ...current,
      deleteDialog: { ...current.deleteDialog, ...update },
    })
  },
)

export const deleteMultipleDialogAtom = atom(
  (get) => get(fundReceivingDialogStatesAtom).deleteMultipleDialog,
  (get, set, update: Partial<DialogStates['deleteMultipleDialog']>) => {
    const current = get(fundReceivingDialogStatesAtom)
    set(fundReceivingDialogStatesAtom, {
      ...current,
      deleteMultipleDialog: { ...current.deleteMultipleDialog, ...update },
    })
  },
)

// Derived atoms for form data
export const createFormDataAtom = atom(
  (get) => get(fundReceivingFormDataAtom).createForm,
  (get, set, update: Partial<CreateFundReceivingFormValues>) => {
    const current = get(fundReceivingFormDataAtom)
    set(fundReceivingFormDataAtom, {
      ...current,
      createForm: { ...current.createForm, ...update },
    })
  },
)

export const updateFormDataAtom = atom(
  (get) => get(fundReceivingFormDataAtom).updateForm,
  (
    get,
    set,
    update: Partial<CreateFundReceivingFormValues & { id: string }>,
  ) => {
    const current = get(fundReceivingFormDataAtom)
    set(fundReceivingFormDataAtom, {
      ...current,
      updateForm: { ...current.updateForm, ...update },
    })
  },
)

// Actions atoms for complex operations
export const openCreateDialogAtom = atom(
  null,
  (
    get,
    set,
    context?: { mode: 'add'; fundSourceId: string } | { mode: 'create' },
  ) => {
    // Reset form data when opening the dialog to start with clean state
    set(createFormDataAtom, defaultFormData.createForm)

    if (context?.mode === 'add' && context.fundSourceId) {
      set(createDialogAtom, {
        isOpen: true,
        showUnsavedWarning: false,
        mode: 'add',
        initialFundSourceId: context.fundSourceId,
      })
    } else {
      set(createDialogAtom, {
        isOpen: true,
        showUnsavedWarning: false,
        mode: 'create',
        initialFundSourceId: undefined,
      })
    }
  },
)

export const closeCreateDialogAtom = atom(
  null,
  (get, set, shouldClearForm = true) => {
    // Explicitly set isOpen: false, which triggers the reset logic in createDialogAtom's setter
    set(createDialogAtom, {
      isOpen: false,
      showUnsavedWarning: false,
      mode: 'create',
      initialFundSourceId: undefined,
    })
    if (shouldClearForm) {
      set(createFormDataAtom, defaultFormData.createForm)
      localStorage.removeItem(CREATE_FORM_STORAGE_KEY)
    }
  },
)

export const openUpdateDialogAtom = atom(
  null,
  (get, set, fundReceiving: FundReceiving) => {
    set(updateDialogAtom, {
      isOpen: true,
      showUnsavedWarning: false,
      selectedId: fundReceiving.id,
    })
    set(updateFormDataAtom, {
      id: fundReceiving.id,
      fundSourceId: fundReceiving.fundSourceId,
      amount: fundReceiving.amount,
      description: fundReceiving.description,
      receivedDate: fundReceiving.receivedDate,
    })
  },
)

export const closeUpdateDialogAtom = atom(
  null,
  (get, set, shouldClearForm = true) => {
    set(updateDialogAtom, {
      isOpen: false,
      showUnsavedWarning: false,
      selectedId: null,
    })
    if (shouldClearForm) {
      set(updateFormDataAtom, defaultFormData.updateForm)
      localStorage.removeItem(UPDATE_FORM_STORAGE_KEY)
    }
  },
)

export const openDeleteDialogAtom = atom(null, (get, set, id: string) => {
  set(deleteDialogAtom, { isOpen: true, selectedId: id })
})

export const closeDeleteDialogAtom = atom(null, (get, set) => {
  set(deleteDialogAtom, { isOpen: false, selectedId: null })
})

export const openDeleteMultipleDialogAtom = atom(
  null,
  (get, set, ids: Array<string>) => {
    set(deleteMultipleDialogAtom, { isOpen: true, selectedIds: ids })
  },
)

export const closeDeleteMultipleDialogAtom = atom(null, (get, set) => {
  set(deleteMultipleDialogAtom, { isOpen: false, selectedIds: [] })
})

// Table state derived atoms
export const tableSelectedRowsAtom = atom(
  (get) => get(fundReceivingTableStatesAtom).selectedRows,
  (get, set, selectedRows: Array<string>) => {
    const current = get(fundReceivingTableStatesAtom)
    set(fundReceivingTableStatesAtom, {
      ...current,
      selectedRows,
    })
  },
)

export const tablePaginationAtom = atom(
  (get) => get(fundReceivingTableStatesAtom).pagination,
  (get, set, pagination: Partial<TableStates['pagination']>) => {
    const current = get(fundReceivingTableStatesAtom)
    set(fundReceivingTableStatesAtom, {
      ...current,
      pagination: { ...current.pagination, ...pagination },
    })
  },
)

export const tableSortingAtom = atom(
  (get) => get(fundReceivingTableStatesAtom).sorting,
  (get, set, sorting: TableStates['sorting']) => {
    const current = get(fundReceivingTableStatesAtom)
    set(fundReceivingTableStatesAtom, {
      ...current,
      sorting,
    })
  },
)

export const tableColumnFiltersAtom = atom(
  (get) => get(fundReceivingTableStatesAtom).columnFilters,
  (get, set, columnFilters: TableStates['columnFilters']) => {
    const current = get(fundReceivingTableStatesAtom)
    set(fundReceivingTableStatesAtom, {
      ...current,
      columnFilters,
    })
  },
)

export const tableGlobalFilterAtom = atom(
  (get) => get(fundReceivingTableStatesAtom).globalFilter,
  (get, set, globalFilter: string) => {
    const current = get(fundReceivingTableStatesAtom)
    set(fundReceivingTableStatesAtom, {
      ...current,
      globalFilter,
    })
  },
)

export const tableColumnVisibilityAtom = atom(
  (get) => get(fundReceivingTableStatesAtom).columnVisibility,
  (get, set, columnVisibility: Record<string, boolean>) => {
    const current = get(fundReceivingTableStatesAtom)
    set(fundReceivingTableStatesAtom, {
      ...current,
      columnVisibility,
    })
  },
)

// Reset actions for cleanup
export const resetAllFundReceivingStatesAtom = atom(null, (get, set) => {
  set(fundReceivingDialogStatesAtom, defaultDialogStates)
  set(fundReceivingFormDataAtom, defaultFormData)
  set(fundReceivingTableStatesAtom, defaultTableStates)
  set(fundReceivingListAtom, [])
  set(fundReceivingDetailsAtom, null)
  set(loadingStatesAtom, {
    isFetching: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  })
})

// Utility atoms for common computed states
export const hasUnsavedCreateFormAtom = atom((get) => {
  const formData = get(createFormDataAtom)
  const defaultForm = defaultFormData.createForm

  return Object.keys(formData).some(
    (key) =>
      formData[key as keyof typeof formData] !==
      defaultForm[key as keyof typeof defaultForm],
  )
})

export const hasUnsavedUpdateFormAtom = atom((get) => {
  const formData = get(updateFormDataAtom)
  const defaultForm = defaultFormData.updateForm

  return Object.keys(formData).some(
    (key) =>
      formData[key as keyof typeof formData] !==
      defaultForm[key as keyof typeof defaultForm],
  )
})

export const selectedRowCountAtom = atom(
  (get) => get(tableSelectedRowsAtom).length,
)

export const canDeleteMultipleAtom = atom(
  (get) => get(selectedRowCountAtom) > 0,
)
