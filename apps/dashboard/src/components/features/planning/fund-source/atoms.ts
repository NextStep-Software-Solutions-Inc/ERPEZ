import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { FundSource, FundSourceDetails } from './table/types'
import type { CreateFundSourceFormValues } from './form/CreateFundSourceForm'

// Keys for localStorage persistence
const STORAGE_KEYS = {
  DIALOG_STATES: 'fundSource_dialog_states',
  FORM_DATA: 'fundSource_form_data',
  TABLE_STATES: 'fundSource_table_states',
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
  activeDialog: {
    isOpen: boolean
    selectedFundSource: FundSource | null
  }
  inactiveDialog: {
    isOpen: boolean
    selectedFundSource: FundSource | null
  }
}

// Form data types
export interface FormData {
  createForm: Partial<CreateFundSourceFormValues>
  updateForm: Partial<CreateFundSourceFormValues & { id: string }>
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
  activeDialog: {
    isOpen: false,
    selectedFundSource: null,
  },
  inactiveDialog: {
    isOpen: false,
    selectedFundSource: null,
  },
}

const defaultFormData: FormData = {
  createForm: {
    name: '',
    code: '',
    category: '',
    type: '',
    isActive: true,
    fundCluster: '',
    authorization: '',
  },
  updateForm: {
    id: '',
    name: '',
    code: '',
    category: '',
    type: '',
    isActive: true,
    fundCluster: '',
    authorization: '',
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
export const fundSourceDialogStatesAtom = atomWithStorage<DialogStates>(
  STORAGE_KEYS.DIALOG_STATES,
  defaultDialogStates,
)

export const fundSourceFormDataAtom = atomWithStorage<FormData>(
  STORAGE_KEYS.FORM_DATA,
  defaultFormData,
)

export const fundSourceTableStatesAtom = atomWithStorage<TableStates>(
  STORAGE_KEYS.TABLE_STATES,
  defaultTableStates,
)

// In-memory atoms (reset on page refresh)
export const fundSourceListAtom = atom<Array<FundSource>>([])
export const fundSourceDetailsAtom = atom<FundSourceDetails | null>(null)
export const loadingStatesAtom = atom({
  isFetching: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
})

// Derived atoms for specific dialog states
export const createDialogAtom = atom(
  (get) => get(fundSourceDialogStatesAtom).createDialog,
  (get, set, update: Partial<DialogStates['createDialog']>) => {
    const current = get(fundSourceDialogStatesAtom)
    set(fundSourceDialogStatesAtom, {
      ...current,
      createDialog: { ...current.createDialog, ...update },
    })
  },
)

export const updateDialogAtom = atom(
  (get) => get(fundSourceDialogStatesAtom).updateDialog,
  (get, set, update: Partial<DialogStates['updateDialog']>) => {
    const current = get(fundSourceDialogStatesAtom)
    set(fundSourceDialogStatesAtom, {
      ...current,
      updateDialog: { ...current.updateDialog, ...update },
    })
  },
)

export const deleteDialogAtom = atom(
  (get) => get(fundSourceDialogStatesAtom).deleteDialog,
  (get, set, update: Partial<DialogStates['deleteDialog']>) => {
    const current = get(fundSourceDialogStatesAtom)
    set(fundSourceDialogStatesAtom, {
      ...current,
      deleteDialog: { ...current.deleteDialog, ...update },
    })
  },
)

export const deleteMultipleDialogAtom = atom(
  (get) => get(fundSourceDialogStatesAtom).deleteMultipleDialog,
  (get, set, update: Partial<DialogStates['deleteMultipleDialog']>) => {
    const current = get(fundSourceDialogStatesAtom)
    set(fundSourceDialogStatesAtom, {
      ...current,
      deleteMultipleDialog: { ...current.deleteMultipleDialog, ...update },
    })
  },
)

export const activeDialogAtom = atom(
  (get) => get(fundSourceDialogStatesAtom).activeDialog,
  (get, set, update: Partial<DialogStates['activeDialog']>) => {
    const current = get(fundSourceDialogStatesAtom)
    set(fundSourceDialogStatesAtom, {
      ...current,
      activeDialog: { ...current.activeDialog, ...update },
    })
  },
)

export const inactiveDialogAtom = atom(
  (get) => get(fundSourceDialogStatesAtom).inactiveDialog,
  (get, set, update: Partial<DialogStates['inactiveDialog']>) => {
    const current = get(fundSourceDialogStatesAtom)
    set(fundSourceDialogStatesAtom, {
      ...current,
      inactiveDialog: { ...current.inactiveDialog, ...update },
    })
  },
)

// Derived atoms for form data
export const createFormDataAtom = atom(
  (get) => get(fundSourceFormDataAtom).createForm,
  (get, set, update: Partial<CreateFundSourceFormValues>) => {
    const current = get(fundSourceFormDataAtom)
    set(fundSourceFormDataAtom, {
      ...current,
      createForm: { ...current.createForm, ...update },
    })
  },
)

export const updateFormDataAtom = atom(
  (get) => get(fundSourceFormDataAtom).updateForm,
  (get, set, update: Partial<CreateFundSourceFormValues & { id: string }>) => {
    const current = get(fundSourceFormDataAtom)
    set(fundSourceFormDataAtom, {
      ...current,
      updateForm: { ...current.updateForm, ...update },
    })
  },
)

// Actions atoms for complex operations
export const openCreateDialogAtom = atom(null, (_get, set) => {
  set(createDialogAtom, { isOpen: true, showUnsavedWarning: false })
})

export const closeCreateDialogAtom = atom(
  null,
  (_get, set, shouldClearForm = true) => {
    set(createDialogAtom, { isOpen: false, showUnsavedWarning: false })
    if (shouldClearForm) {
      set(createFormDataAtom, defaultFormData.createForm)
      localStorage.removeItem('fundSource_form_data')
    }
  },
)

export const openUpdateDialogAtom = atom(
  null,
  (_get, set, fundSource: FundSource) => {
    set(updateDialogAtom, {
      isOpen: true,
      showUnsavedWarning: false,
      selectedId: fundSource.id,
    })
    set(updateFormDataAtom, {
      id: fundSource.id,
      name: fundSource.name,
      code: fundSource.code,
      category: fundSource.category,
      type: fundSource.type,
      isActive: fundSource.isActive,
      fundCluster: fundSource.fundCluster,
      authorization: fundSource.authorization,
    })
  },
)

export const closeUpdateDialogAtom = atom(
  null,
  (_get, set, shouldClearForm = true) => {
    set(updateDialogAtom, {
      isOpen: false,
      showUnsavedWarning: false,
      selectedId: null,
    })
    if (shouldClearForm) {
      set(updateFormDataAtom, defaultFormData.updateForm)
      localStorage.removeItem('fundSource_form_data')
    }
  },
)

export const openDeleteDialogAtom = atom(null, (_get, set, id: string) => {
  set(deleteDialogAtom, { isOpen: true, selectedId: id })
})

export const closeDeleteDialogAtom = atom(null, (_get, set) => {
  set(deleteDialogAtom, { isOpen: false, selectedId: null })
})

export const openDeleteMultipleDialogAtom = atom(
  null,
  (_get, set, ids: Array<string>) => {
    set(deleteMultipleDialogAtom, { isOpen: true, selectedIds: ids })
  },
)

export const closeDeleteMultipleDialogAtom = atom(null, (_get, set) => {
  set(deleteMultipleDialogAtom, { isOpen: false, selectedIds: [] })
})

export const openActiveDialogAtom = atom(
  null,
  (_get, set, fundSource: FundSource) => {
    set(activeDialogAtom, { isOpen: true, selectedFundSource: fundSource })
  },
)

export const closeActiveDialogAtom = atom(null, (_get, set) => {
  set(activeDialogAtom, { isOpen: false, selectedFundSource: null })
})

export const openInactiveDialogAtom = atom(
  null,
  (_get, set, fundSource: FundSource) => {
    set(inactiveDialogAtom, { isOpen: true, selectedFundSource: fundSource })
  },
)

export const closeInactiveDialogAtom = atom(null, (_get, set) => {
  set(inactiveDialogAtom, { isOpen: false, selectedFundSource: null })
})

// Table state derived atoms
export const tableSelectedRowsAtom = atom(
  (get) => get(fundSourceTableStatesAtom).selectedRows,
  (get, set, selectedRows: Array<string>) => {
    const current = get(fundSourceTableStatesAtom)
    set(fundSourceTableStatesAtom, {
      ...current,
      selectedRows,
    })
  },
)

export const tablePaginationAtom = atom(
  (get) => get(fundSourceTableStatesAtom).pagination,
  (get, set, pagination: Partial<TableStates['pagination']>) => {
    const current = get(fundSourceTableStatesAtom)
    set(fundSourceTableStatesAtom, {
      ...current,
      pagination: { ...current.pagination, ...pagination },
    })
  },
)

export const tableSortingAtom = atom(
  (get) => get(fundSourceTableStatesAtom).sorting,
  (get, set, sorting: TableStates['sorting']) => {
    const current = get(fundSourceTableStatesAtom)
    set(fundSourceTableStatesAtom, {
      ...current,
      sorting,
    })
  },
)

export const tableColumnFiltersAtom = atom(
  (get) => get(fundSourceTableStatesAtom).columnFilters,
  (get, set, columnFilters: TableStates['columnFilters']) => {
    const current = get(fundSourceTableStatesAtom)
    set(fundSourceTableStatesAtom, {
      ...current,
      columnFilters,
    })
  },
)

export const tableGlobalFilterAtom = atom(
  (get) => get(fundSourceTableStatesAtom).globalFilter,
  (get, set, globalFilter: string) => {
    const current = get(fundSourceTableStatesAtom)
    set(fundSourceTableStatesAtom, {
      ...current,
      globalFilter,
    })
  },
)

export const tableColumnVisibilityAtom = atom(
  (get) => get(fundSourceTableStatesAtom).columnVisibility,
  (get, set, columnVisibility: Record<string, boolean>) => {
    const current = get(fundSourceTableStatesAtom)
    set(fundSourceTableStatesAtom, {
      ...current,
      columnVisibility,
    })
  },
)

// Reset actions for cleanup
export const resetAllFundSourceStatesAtom = atom(null, (_get, set) => {
  set(fundSourceDialogStatesAtom, defaultDialogStates)
  set(fundSourceFormDataAtom, defaultFormData)
  set(fundSourceTableStatesAtom, defaultTableStates)
  set(fundSourceListAtom, [])
  set(fundSourceDetailsAtom, null)
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
