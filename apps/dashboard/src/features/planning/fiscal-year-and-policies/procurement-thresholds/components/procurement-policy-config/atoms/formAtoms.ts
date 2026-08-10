import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Storage key for form data
const FORM_STORAGE_KEY = 'procurement_policy_config_form_data'

// Form values type
export interface ProcurementPolicyConfigFormValues {
  fiscalYearId: string
  procurementModeId: string
  procurementModeThresholdId: string
  minAmount: number
  maxAmount?: number
}

// Form data types
export interface ProcurementPolicyConfigFormData {
  createForm: Partial<ProcurementPolicyConfigFormValues>
}

// Default form data
export const defaultFormData: ProcurementPolicyConfigFormData = {
  createForm: {
    fiscalYearId: '',
    procurementModeId: '',
    procurementModeThresholdId: '',
    minAmount: 0,
    maxAmount: undefined,
  },
}

// Persisted form data atom
export const procurementPolicyConfigFormDataAtom =
  atomWithStorage<ProcurementPolicyConfigFormData>(
    FORM_STORAGE_KEY,
    defaultFormData,
  )

// Derived atom for create form data
export const createFormDataAtom = atom(
  (get) => get(procurementPolicyConfigFormDataAtom).createForm,
  (get, set, update: Partial<ProcurementPolicyConfigFormValues>) => {
    const current = get(procurementPolicyConfigFormDataAtom)
    set(procurementPolicyConfigFormDataAtom, {
      ...current,
      createForm: { ...current.createForm, ...update },
    })
  },
)

// Unsaved changes detection atom
export const hasProcurementPolicyConfigFormAtom = atom((get) => {
  const formData = get(createFormDataAtom)
  return Object.keys(formData).some(
    (key) =>
      formData[key as keyof ProcurementPolicyConfigFormValues] !==
      defaultFormData.createForm[
        key as keyof ProcurementPolicyConfigFormValues
      ],
  )
})

// Function to completely remove the localStorage key
export const removeFormDataFromStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(FORM_STORAGE_KEY)
  }
}
