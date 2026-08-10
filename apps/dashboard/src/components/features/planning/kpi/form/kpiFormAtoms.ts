import { atomWithStorage } from 'jotai/utils'
import { atom } from 'jotai'
import type { CreateKpiFormValues } from './CreateKpiForm'

const STORAGE_KEY_FORM_DATA = 'createKpiFormData'
const STORAGE_KEY_STEP = 'createKpiFormStep'

// Default form values
export const defaultFormValues: Partial<CreateKpiFormValues> = {
  name: '',
  description: '',
  functionType: '',
  isOfficeMandate: false,
  isPercentage: false,
  isTargetValueAllocable: false,
  AttributeIds: [],
  SDGIds: [],
  KPITargets: [{ period: 'Annual', targetValue: 0, quarterName: 'Annual' }],
  KPIRatings: [],
  KPIMOVs: [{ name: '', description: '', fileId: '' }],
}

// Atom for form values with getOnInit: true for synchronous initialization
// This ensures localStorage is read synchronously on first render
export const kpiFormValuesAtom = atomWithStorage<Partial<CreateKpiFormValues>>(
  STORAGE_KEY_FORM_DATA,
  defaultFormValues,
  undefined, // Use default JSON storage
  { getOnInit: true }, // Synchronously get value on initialization
)

// Atom for current step with getOnInit: true for synchronous initialization
export const kpiFormStepAtom = atomWithStorage<number>(
  STORAGE_KEY_STEP,
  1,
  undefined,
  { getOnInit: true },
)

// Derived atom for checking if form can proceed to next step
export const canProceedToStepAtom = atom((get) => {
  const values = get(kpiFormValuesAtom)
  const step = get(kpiFormStepAtom)

  switch (step) {
    case 1:
      return (
        (values.name?.trim().length ?? 0) >= 3 &&
        (values.functionType?.length ?? 0) >= 1 &&
        (values.AttributeIds?.length ?? 0) >= 1 &&
        (values.SDGIds?.length ?? 0) >= 1
      )
    case 2:
      return Array.isArray(values.KPIRatings) && values.KPIRatings.length > 0
    case 3:
      return Array.isArray(values.KPITargets) && values.KPITargets.length > 0
    default:
      return false
  }
})

// Action atom to reset form state
export const resetKpiFormAtom = atom(null, (_get, set) => {
  set(kpiFormValuesAtom, defaultFormValues)
  set(kpiFormStepAtom, 1)
})

// Action atom to clear persisted data from localStorage
export const clearKpiFormStorageAtom = atom(null, () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_FORM_DATA)
      localStorage.removeItem(STORAGE_KEY_STEP)
      localStorage.removeItem('createkpiform')
    } catch {
      // Gracefully handle localStorage unavailability
      console.warn('Failed to clear localStorage for KPI form')
    }
  }
})
