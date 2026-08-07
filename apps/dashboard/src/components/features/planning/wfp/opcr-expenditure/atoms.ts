import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Keys for localStorage persistence
const STORAGE_KEYS = {
  DIALOG_STATES: 'opcr_expenditure_dialog_states',
  FORM_DATA: 'opcr_expenditure_form_data',
  EXPENDITURES: 'opcr_expenditures',
} as const

// Dialog state types
export interface DialogStates {
  createDialog: {
    isOpen: boolean
    showUnsavedWarning: boolean
    activityId?: string
    hasUnsavedChanges?: boolean
  }
}

// Form data types
export interface FormData {
  createForm: Record<string, unknown> | null
}

// Expenditure types
export interface ExpenditureItem {
  id: string
  description: string
  quantity: number
  unitCost: number
}

export interface Expenditure {
  id: string
  activityId: string
  date: string
  description: string
  amount: number
  items: ExpenditureItem[]
  createdAt: string
}

export type ExpendituresMap = Record<string, Expenditure[]>

// Atoms for dialog states
export const createDialogAtom = atomWithStorage<DialogStates['createDialog']>(
  STORAGE_KEYS.DIALOG_STATES,
  {
    isOpen: false,
    showUnsavedWarning: false,
    activityId: undefined,
    hasUnsavedChanges: false,
  },
)

// Atoms for form data
export const createFormDataAtom = atomWithStorage<FormData['createForm']>(
  STORAGE_KEYS.FORM_DATA,
  null,
)

// Computed atoms
export const hasUnsavedCreateFormAtom = atom((get) => {
  const formData = get(createFormDataAtom)
  return formData !== null
})

export const closeCreateDialogAtom = atom(null, (get, set) => {
  set(createDialogAtom, {
    isOpen: false,
    showUnsavedWarning: false,
    activityId: undefined,
    hasUnsavedChanges: false,
  })
  set(createFormDataAtom, null)
})

// Atoms for managing expenditures
export const expendituresAtom = atomWithStorage<ExpendituresMap>(
  STORAGE_KEYS.EXPENDITURES,
  {}
)

// Atom to add a new expenditure
export const addExpenditureAtom = atom(null, (get, set, expenditure: Expenditure) => {
  const current = get(expendituresAtom)
  const activityId = expenditure.activityId
  const existing = current[activityId] || []
  
  set(expendituresAtom, {
    ...current,
    [activityId]: [...existing, expenditure],
  })
})

// Atom to get expenditures for a specific activity
export const getActivityExpendituresAtom = atom(
  (get, activityId: string) => {
    const expenditures = get(expendituresAtom)
    return expenditures[activityId] || []
  }
)