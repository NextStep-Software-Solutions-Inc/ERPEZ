/**
 * CONSOLIDATED ATOMS - Root Authority
 * 
 * All Jotai atoms exported from a single source to eliminate duplication:
 * ✅ APP Steps (1/2/3) atoms from root atoms.ts
 * ✅ Fiscal Year atoms from fiscal-year/atoms.ts
 * ✅ Budget Distribution atoms from budget-distribution/atoms.ts
 * ✅ KPI Activation atoms from kpi-activation/atoms.ts
 * ✅ Target Distribution atoms from target-distribution/atoms.ts
 * 
 * Sub-feature atoms files now re-export from here for backward compatibility
 */

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { AppFiscalYear } from '@/features/planning/annual-performance-planning/appTypes'

// ============ APP Steps (1/2/3) Atoms ============
// Dialog state types
export interface DialogStates {
  step1Dialog: {
    isOpen: boolean
    showUnsavedWarning: boolean
  }
  step2Dialog: {
    isOpen: boolean
    showUnsavedWarning: boolean
  }
  step3Dialog: {
    isOpen: boolean
    showUnsavedWarning: boolean
  }
}

// Form data types
export interface FormData {
  step1Form: Partial<Record<string, any>>
  step2Form: Partial<Record<string, any>>
  step3Form: Partial<Record<string, any>>
}

// Table state types
export interface TableStates {
  selectedRows: string[]
  columnVisibility: Record<string, boolean>
  sorting: Array<{ id: string; desc: boolean }>
  columnFilters: Array<{ id: string; value: any }>
  globalFilter: string
  pagination: {
    pageIndex: number
    pageSize: number
  }
}

// Storage keys - APP
const APP_STORAGE_KEYS = {
  DIALOG_STATES: 'app_dialog_states',
  FORM_DATA: 'app_form_data',
  TABLE_STATES: 'app_table_states',
} as const

// Default states - APP
const defaultDialogStates: DialogStates = {
  step1Dialog: {
    isOpen: false,
    showUnsavedWarning: false,
  },
  step2Dialog: {
    isOpen: false,
    showUnsavedWarning: false,
  },
  step3Dialog: {
    isOpen: false,
    showUnsavedWarning: false,
  },
}

const defaultFormData: FormData = {
  step1Form: {},
  step2Form: {},
  step3Form: {},
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
export const appDialogStatesAtom = atomWithStorage<DialogStates>(
  APP_STORAGE_KEYS.DIALOG_STATES,
  defaultDialogStates,
)

export const appFormDataAtom = atomWithStorage<FormData>(
  APP_STORAGE_KEYS.FORM_DATA,
  defaultFormData,
)

export const appTableStatesAtom = atomWithStorage<TableStates>(
  APP_STORAGE_KEYS.TABLE_STATES,
  defaultTableStates,
)

// Unsaved changes tracking
export const hasUnsavedStep1FormAtom = atom(false)
export const hasUnsavedStep2FormAtom = atom(false)
export const hasUnsavedStep3FormAtom = atom(false)

// Dialog open/close atoms
export const step1DialogAtom = atom(
  (get) => get(appDialogStatesAtom).step1Dialog,
  (get, set, value: Partial<typeof defaultDialogStates.step1Dialog>) => {
    const current = get(appDialogStatesAtom)
    set(appDialogStatesAtom, {
      ...current,
      step1Dialog: { ...current.step1Dialog, ...value },
    })
  }
)

export const step2DialogAtom = atom(
  (get) => get(appDialogStatesAtom).step2Dialog,
  (get, set, value: Partial<typeof defaultDialogStates.step2Dialog>) => {
    const current = get(appDialogStatesAtom)
    set(appDialogStatesAtom, {
      ...current,
      step2Dialog: { ...current.step2Dialog, ...value },
    })
  }
)

export const step3DialogAtom = atom(
  (get) => get(appDialogStatesAtom).step3Dialog,
  (get, set, value: Partial<typeof defaultDialogStates.step3Dialog>) => {
    const current = get(appDialogStatesAtom)
    set(appDialogStatesAtom, {
      ...current,
      step3Dialog: { ...current.step3Dialog, ...value },
    })
  }
)

// Close dialog atoms
export const closeStep1DialogAtom = atom(null, (get, set) => {
  const current = get(appDialogStatesAtom)
  set(appDialogStatesAtom, {
    ...current,
    step1Dialog: { ...defaultDialogStates.step1Dialog },
  })
})

export const closeStep2DialogAtom = atom(null, (get, set) => {
  const current = get(appDialogStatesAtom)
  set(appDialogStatesAtom, {
    ...current,
    step2Dialog: { ...defaultDialogStates.step2Dialog },
  })
})

export const closeStep3DialogAtom = atom(null, (get, set) => {
  const current = get(appDialogStatesAtom)
  set(appDialogStatesAtom, {
    ...current,
    step3Dialog: { ...defaultDialogStates.step3Dialog },
  })
})

// Form data atoms
export const step1FormDataAtom = atom(
  (get) => get(appFormDataAtom).step1Form,
  (get, set, value: FormData['step1Form']) => {
    const current = get(appFormDataAtom)
    set(appFormDataAtom, {
      ...current,
      step1Form: value,
    })
  }
)

export const step2FormDataAtom = atom(
  (get) => get(appFormDataAtom).step2Form,
  (get, set, value: FormData['step2Form']) => {
    const current = get(appFormDataAtom)
    set(appFormDataAtom, {
      ...current,
      step2Form: value,
    })
  }
)

export const step3FormDataAtom = atom(
  (get) => get(appFormDataAtom).step3Form,
  (get, set, value: FormData['step3Form']) => {
    const current = get(appFormDataAtom)
    set(appFormDataAtom, {
      ...current,
      step3Form: value,
    })
  }
)

// Table state atoms
export const appTableStatesReadAtom = atom((get) => get(appTableStatesAtom))

export const appTableStatesWriteAtom = atom(
  (get) => get(appTableStatesAtom),
  (get, set, value: Partial<TableStates>) => {
    const current = get(appTableStatesAtom)
    set(appTableStatesAtom, {
      ...current,
      ...value,
    })
  }
)

// ============ Fiscal Year Atoms ============
// Dialog state types
export interface FiscalYearDialogStates {
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
}

// Form data types
export interface FiscalYearFormData {
  createForm: Partial<AppFiscalYear>
  updateForm: Partial<AppFiscalYear>
}

// Table states
export interface FiscalYearTableStates {
  columnVisibility: Record<string, boolean>
  sorting: Array<{ id: string; desc: boolean }>
  columnFilters: Array<{ id: string; value: unknown }>
  globalFilter: string
}

// Storage keys - Fiscal Year
export const FISCAL_YEAR_STORAGE_KEYS = {
  FISCAL_YEAR_DIALOG_STATES: 'fiscal_year_dialog_states',
  FISCAL_YEAR_FORM: 'fiscal_year_form_data',
  FISCAL_YEAR_TABLE_STATES: 'fiscal_year_table_states',
} as const

const defaultFiscalYearDialogStates: FiscalYearDialogStates = {
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
}

const defaultFiscalYearFormData: FiscalYearFormData = {
  createForm: {
    year: new Date().getFullYear(),
    description: '',
    startDate: '',
    endDate: '',
  },
  updateForm: {
    year: new Date().getFullYear(),
    description: '',
    startDate: '',
    endDate: '',
  },
}

const defaultFiscalYearTableStates: FiscalYearTableStates = {
  columnVisibility: {},
  sorting: [],
  columnFilters: [],
  globalFilter: '',
}

// Persisted atoms (survive page refresh)
export const appFiscalYearDialogStatesAtom = atomWithStorage<FiscalYearDialogStates>(
  FISCAL_YEAR_STORAGE_KEYS.FISCAL_YEAR_DIALOG_STATES,
  defaultFiscalYearDialogStates,
)

export const appFiscalYearFormDataAtom = atomWithStorage<FiscalYearFormData>(
  FISCAL_YEAR_STORAGE_KEYS.FISCAL_YEAR_FORM,
  defaultFiscalYearFormData,
)

export const appFiscalYearTableStatesAtom = atomWithStorage<FiscalYearTableStates>(
  FISCAL_YEAR_STORAGE_KEYS.FISCAL_YEAR_TABLE_STATES,
  defaultFiscalYearTableStates,
)

// Derived atoms for dialog control
export const createDialogAtom = atom(
  (get) => get(appFiscalYearDialogStatesAtom).createDialog,
  (get, set, update: Partial<FiscalYearDialogStates['createDialog']>) => {
    const current = get(appFiscalYearDialogStatesAtom)
    set(appFiscalYearDialogStatesAtom, {
      ...current,
      createDialog: { ...current.createDialog, ...update },
    })
  },
)

export const closeCreateDialogAtom = atom(null, (_get, set, resetForm: boolean = true) => {
  set(appFiscalYearDialogStatesAtom, (prev) => ({
    ...prev,
    createDialog: {
      isOpen: false,
      showUnsavedWarning: false,
    },
  }))
  if (resetForm) {
    set(appFiscalYearFormDataAtom, (prev) => ({
      ...prev,
      createForm: defaultFiscalYearFormData.createForm,
    }))
  }
})

export const updateDialogAtom = atom(
  (get) => get(appFiscalYearDialogStatesAtom).updateDialog,
  (get, set, update: Partial<FiscalYearDialogStates['updateDialog']>) => {
    const current = get(appFiscalYearDialogStatesAtom)
    set(appFiscalYearDialogStatesAtom, {
      ...current,
      updateDialog: { ...current.updateDialog, ...update },
    })
  },
)

export const closeUpdateDialogAtom = atom(null, (_get, set, resetForm: boolean = true) => {
  set(appFiscalYearDialogStatesAtom, (prev) => ({
    ...prev,
    updateDialog: {
      isOpen: false,
      showUnsavedWarning: false,
      selectedId: null,
    },
  }))
  if (resetForm) {
    set(appFiscalYearFormDataAtom, (prev) => ({
      ...prev,
      updateForm: defaultFiscalYearFormData.updateForm,
    }))
  }
})

export const deleteDialogAtom = atom(
  (get) => get(appFiscalYearDialogStatesAtom).deleteDialog,
  (get, set, update: Partial<FiscalYearDialogStates['deleteDialog']>) => {
    const current = get(appFiscalYearDialogStatesAtom)
    set(appFiscalYearDialogStatesAtom, {
      ...current,
      deleteDialog: { ...current.deleteDialog, ...update },
    })
  },
)

export const closeDeleteDialogAtom = atom(null, (_get, set) => {
  set(appFiscalYearDialogStatesAtom, (prev) => ({
    ...prev,
    deleteDialog: {
      isOpen: false,
      selectedId: null,
    },
  }))
})

// Derived atoms for form data
export const createFormDataAtom = atom(
  (get) => get(appFiscalYearFormDataAtom).createForm,
  (_get, set, update: Partial<AppFiscalYear>) => {
    set(appFiscalYearFormDataAtom, (prev) => ({
      ...prev,
      createForm: { ...prev.createForm, ...update },
    }))
  },
)

export const hasUnsavedCreateFormAtom = atom(false)

export const updateFormDataAtom = atom(
  (get) => get(appFiscalYearFormDataAtom).updateForm,
  (_get, set, update: Partial<AppFiscalYear>) => {
    set(appFiscalYearFormDataAtom, (prev) => ({
      ...prev,
      updateForm: { ...prev.updateForm, ...update },
    }))
  },
)

export const hasUnsavedUpdateFormAtom = atom(false)

// ============ Budget Distribution Atoms ============
export interface BudgetAllocation {
  id: string
  officeId: string
  officeName: string
  kpiId: string
  kpiCode: string
  kpiName: string
  baseTarget: number
  allocatedBudget: number
  percentageOfTotal: number
  q1: number | null
  q2: number | null
  q3: number | null
  q4: number | null
  notes: string
  isLocked: boolean
  status: 'pending' | 'allocated' | 'approved'
}

export interface OfficeAssignment {
  id: string
  officeId: string
  officeName: string
  kpiId: string
  kpiCode: string
  kpiName: string
  allocationFromPlanning: number
  officeTarget: number | null
  q1: number | null
  q2: number | null
  q3: number | null
  q4: number | null
  notes: string
  isFromPlanning: boolean
  isEdited: boolean
  status: 'pending' | 'submitted' | 'approved'
}

export const budgetAllocationsAtom = atom<BudgetAllocation[]>([])
export const selectedAllocationAtom = atom<BudgetAllocation | null>(null)
export const budgetDistributionSearchAtom = atom<string>('')
export const budgetDistributionOfficeFilterAtom = atom<string | 'all'>('all')
export const budgetDistributionStatusFilterAtom = atom<'all' | 'pending' | 'allocated' | 'approved'>('all')

// Office Assignment atoms
export const officeAssignmentsAtom = atom<OfficeAssignment[]>([])
export const selectedAssignmentAtom = atom<OfficeAssignment | null>(null)
export const officeAssignmentSearchAtom = atom<string>('')
export const officeAssignmentStatusFilterAtom = atom<'all' | 'pending' | 'submitted' | 'approved'>('all')
export const officeAssignmentEditedFilterAtom = atom<'all' | 'edited' | 'unchanged'>('all')

// ============ KPI Activation Atoms ============
export interface KPIActivationFormData {
  selectedKPIs: Set<string>
  searchQuery: string
}

const defaultKPIActivationFormData: KPIActivationFormData = {
  selectedKPIs: new Set(),
  searchQuery: '',
}

export const KPI_ACTIVATION_STORAGE_KEYS = {
  KPI_ACTIVATION_FORM: 'kpi_activation_form_data',
} as const

export const kpiActivationFormDataAtom = atomWithStorage<KPIActivationFormData>(
  KPI_ACTIVATION_STORAGE_KEYS.KPI_ACTIVATION_FORM,
  defaultKPIActivationFormData,
)

export const hasUnsavedKPIActivationAtom = atom(false)

// ============ Target Distribution Atoms ============
export interface TargetDistributionFormData {
  searchQuery: string
  selectedTargets: string[]
}

const initialTargetDistributionFormData: TargetDistributionFormData = {
  searchQuery: '',
  selectedTargets: [],
}

export const TARGET_DISTRIBUTION_STORAGE_KEYS = {
  TARGET_DISTRIBUTION_FORM: 'target_distribution_form_data',
} as const

export const targetDistributionFormDataAtom = atomWithStorage(
  TARGET_DISTRIBUTION_STORAGE_KEYS.TARGET_DISTRIBUTION_FORM,
  initialTargetDistributionFormData
)

export const hasUnsavedTargetDistributionAtom = atom((get) => {
  const formData = get(targetDistributionFormDataAtom)
  return formData.selectedTargets.length > 0 || formData.searchQuery.length > 0
})
