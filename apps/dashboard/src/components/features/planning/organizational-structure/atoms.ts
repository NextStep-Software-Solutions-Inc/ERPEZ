import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Keys for localStorage persistence
const STORAGE_KEYS = {
  DIALOG_STATES: 'organizationalStructure_dialog_states',
  FORM_DATA: 'organizationalStructure_form_data',
  TABLE_STATES: 'organizationalStructure_table_states',
} as const

export const CREATE_OFFICE_FORM_STORAGE_KEY = 'createOfficeFormData'
export const UPDATE_OFFICE_FORM_STORAGE_KEY = 'updateOfficeFormData'
export const CREATE_POSITION_FORM_STORAGE_KEY = 'createPositionFormData'
export const UPDATE_POSITION_FORM_STORAGE_KEY = 'updatePositionFormData'
export const CREATE_PERSONNEL_FORM_STORAGE_KEY = 'createPersonnelFormData'
export const UPDATE_PERSONNEL_FORM_STORAGE_KEY = 'updatePersonnelFormData'

// Dialog state types
export interface DialogStates {
  createOfficeDialog: {
    isOpen: boolean
    showUnsavedWarning: boolean
    parentUnitId?: string
  }
  updateOfficeDialog: {
    isOpen: boolean
    showUnsavedWarning: boolean
    selectedId: string | null
  }
  deleteOfficeDialog: {
    isOpen: boolean
    selectedId: string | null
  }
  createPositionDialog: {
    isOpen: boolean
    showUnsavedWarning: boolean
    selectedOrgUnitId?: string
  }
  updatePositionDialog: {
    isOpen: boolean
    showUnsavedWarning: boolean
    selectedId: string | null
  }
  deletePositionDialog: {
    isOpen: boolean
    selectedId: string | null
  }
  createPersonnelDialog: {
    isOpen: boolean
    showUnsavedWarning: boolean
  }
  updatePersonnelDialog: {
    isOpen: boolean
    showUnsavedWarning: boolean
    selectedId: string | null
  }
  deletePersonnelDialog: {
    isOpen: boolean
    selectedId: string | null
  }
  pmtBodyDialog: {
    isOpen: boolean
  }
}

// Form data types
export interface FormData {
  createOfficeForm: Record<string, unknown>
  updateOfficeForm: Record<string, unknown>
  createPositionForm: Record<string, unknown>
  updatePositionForm: Record<string, unknown>
  createPersonnelForm: Record<string, unknown>
  updatePersonnelForm: Record<string, unknown>
}

// Table state types
export interface TableStates {
  selectedRows: Array<string>
  columnVisibility: Record<string, boolean>
  sorting: Array<{ id: string; desc: boolean }>
  columnFilters: Array<{ id: string; value: unknown }>
  pagination: {
    pageIndex: number
    pageSize: number
  }
}

// Initial dialog states
const initialDialogStates: DialogStates = {
  createOfficeDialog: {
    isOpen: false,
    showUnsavedWarning: false,
  },
  updateOfficeDialog: {
    isOpen: false,
    showUnsavedWarning: false,
    selectedId: null,
  },
  deleteOfficeDialog: {
    isOpen: false,
    selectedId: null,
  },
  createPositionDialog: {
    isOpen: false,
    showUnsavedWarning: false,
  },
  updatePositionDialog: {
    isOpen: false,
    showUnsavedWarning: false,
    selectedId: null,
  },
  deletePositionDialog: {
    isOpen: false,
    selectedId: null,
  },
  createPersonnelDialog: {
    isOpen: false,
    showUnsavedWarning: false,
  },
  updatePersonnelDialog: {
    isOpen: false,
    showUnsavedWarning: false,
    selectedId: null,
  },
  deletePersonnelDialog: {
    isOpen: false,
    selectedId: null,
  },
  pmtBodyDialog: {
    isOpen: false,
  },
}

// Initial form data
const initialFormData: FormData = {
  createOfficeForm: {},
  updateOfficeForm: {},
  createPositionForm: {},
  updatePositionForm: {},
  createPersonnelForm: {},
  updatePersonnelForm: {},
}

// Initial table states
const initialTableStates: TableStates = {
  selectedRows: [],
  columnVisibility: {},
  sorting: [],
  columnFilters: [],
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
}

// Dialog state atoms
export const dialogStatesAtom = atomWithStorage<DialogStates>(
  STORAGE_KEYS.DIALOG_STATES,
  initialDialogStates,
)

export const createOfficeDialogAtom = atom(
  (get) => get(dialogStatesAtom).createOfficeDialog,
  (get, set, newState: Partial<DialogStates['createOfficeDialog']>) => {
    const current = get(dialogStatesAtom)
    set(dialogStatesAtom, {
      ...current,
      createOfficeDialog: { ...current.createOfficeDialog, ...newState },
    })
  },
)

export const updateOfficeDialogAtom = atom(
  (get) => get(dialogStatesAtom).updateOfficeDialog,
  (get, set, newState: Partial<DialogStates['updateOfficeDialog']>) => {
    const current = get(dialogStatesAtom)
    set(dialogStatesAtom, {
      ...current,
      updateOfficeDialog: { ...current.updateOfficeDialog, ...newState },
    })
  },
)

export const deleteOfficeDialogAtom = atom(
  (get) => get(dialogStatesAtom).deleteOfficeDialog,
  (get, set, newState: Partial<DialogStates['deleteOfficeDialog']>) => {
    const current = get(dialogStatesAtom)
    set(dialogStatesAtom, {
      ...current,
      deleteOfficeDialog: { ...current.deleteOfficeDialog, ...newState },
    })
  },
)

export const createPositionDialogAtom = atom(
  (get) => get(dialogStatesAtom).createPositionDialog,
  (get, set, newState: Partial<DialogStates['createPositionDialog']>) => {
    const current = get(dialogStatesAtom)
    set(dialogStatesAtom, {
      ...current,
      createPositionDialog: { ...current.createPositionDialog, ...newState },
    })
  },
)

export const updatePositionDialogAtom = atom(
  (get) => get(dialogStatesAtom).updatePositionDialog,
  (get, set, newState: Partial<DialogStates['updatePositionDialog']>) => {
    const current = get(dialogStatesAtom)
    set(dialogStatesAtom, {
      ...current,
      updatePositionDialog: { ...current.updatePositionDialog, ...newState },
    })
  },
)

export const deletePositionDialogAtom = atom(
  (get) => get(dialogStatesAtom).deletePositionDialog,
  (get, set, newState: Partial<DialogStates['deletePositionDialog']>) => {
    const current = get(dialogStatesAtom)
    set(dialogStatesAtom, {
      ...current,
      deletePositionDialog: { ...current.deletePositionDialog, ...newState },
    })
  },
)

export const createPersonnelDialogAtom = atom(
  (get) => get(dialogStatesAtom).createPersonnelDialog,
  (get, set, newState: Partial<DialogStates['createPersonnelDialog']>) => {
    const current = get(dialogStatesAtom)
    set(dialogStatesAtom, {
      ...current,
      createPersonnelDialog: { ...current.createPersonnelDialog, ...newState },
    })
  },
)

export const updatePersonnelDialogAtom = atom(
  (get) => get(dialogStatesAtom).updatePersonnelDialog,
  (get, set, newState: Partial<DialogStates['updatePersonnelDialog']>) => {
    const current = get(dialogStatesAtom)
    set(dialogStatesAtom, {
      ...current,
      updatePersonnelDialog: { ...current.updatePersonnelDialog, ...newState },
    })
  },
)

export const deletePersonnelDialogAtom = atom(
  (get) => get(dialogStatesAtom).deletePersonnelDialog,
  (get, set, newState: Partial<DialogStates['deletePersonnelDialog']>) => {
    const current = get(dialogStatesAtom)
    set(dialogStatesAtom, {
      ...current,
      deletePersonnelDialog: { ...current.deletePersonnelDialog, ...newState },
    })
  },
)

export const pmtBodyDialogAtom = atom(
  (get) => get(dialogStatesAtom).pmtBodyDialog,
  (get, set, newState: Partial<DialogStates['pmtBodyDialog']>) => {
    const current = get(dialogStatesAtom)
    set(dialogStatesAtom, {
      ...current,
      pmtBodyDialog: { ...current.pmtBodyDialog, ...newState },
    })
  },
)

// Form data atoms
export const formDataAtom = atomWithStorage<FormData>(
  STORAGE_KEYS.FORM_DATA,
  initialFormData,
)

// Table state atoms
export const tableStatesAtom = atomWithStorage<TableStates>(
  STORAGE_KEYS.TABLE_STATES,
  initialTableStates,
)
// Settings Form Atoms (for TemplateTable pattern in settings components)
import type {
  OfficeTypeSetting,
  PositionTypeSetting,
  SalaryGradeSetting,
  PlantillaTypeSetting,
  PMTMaximumSeatsSetting,
  ProcurementWorkflowSetting,
  SatelliteClusterSetting,
} from './types'

// Entity-specific edit/delete atoms for type safety
export const openEditOfficeTypeDialogAtom = atom<OfficeTypeSetting | null>(null)
export const openDeleteOfficeTypeDialogAtom = atom<OfficeTypeSetting | null>(null)

export const openEditPositionTypeDialogAtom = atom<PositionTypeSetting | null>(null)
export const openDeletePositionTypeDialogAtom = atom<PositionTypeSetting | null>(null)

export const openEditSalaryGradeDialogAtom = atom<SalaryGradeSetting | null>(null)
export const openDeleteSalaryGradeDialogAtom = atom<SalaryGradeSetting | null>(null)

export const openEditPlantillaTypeDialogAtom = atom<PlantillaTypeSetting | null>(null)
export const openDeletePlantillaTypeDialogAtom = atom<PlantillaTypeSetting | null>(null)

export const openEditPMTMaximumSeatsDialogAtom = atom<PMTMaximumSeatsSetting | null>(null)
export const openDeletePMTMaximumSeatsDialogAtom = atom<PMTMaximumSeatsSetting | null>(null)

export const openEditProcurementWorkflowDialogAtom = atom<ProcurementWorkflowSetting | null>(null)
export const openDeleteProcurementWorkflowDialogAtom = atom<ProcurementWorkflowSetting | null>(null)

export const openEditSatelliteClusterDialogAtom = atom<SatelliteClusterSetting | null>(null)
export const openDeleteSatelliteClusterDialogAtom = atom<SatelliteClusterSetting | null>(null)

// Shared table state atoms
export const tableSelectedRowsAtom = atom<string[]>([])