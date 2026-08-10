import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { CreateKpiFormType } from '../../form/CreateKpiForm'

// Storage key for form data
const FORM_STORAGE_KEY = 'subkpi_form_data'

// Form data types
export interface SubKpiFormData {
    createForm: Partial<CreateKpiFormType>
    updateForm: Partial<CreateKpiFormType & { id: string }>
}

// Default form data
export const defaultFormData: SubKpiFormData = {
    createForm: {
        name: '',
        description: '',
        functionType: '',
        isOfficeMandate: false,
        isPercentage: false,
        isTargetValueAllocable: false,
        SDGIds: [],
        AttributeIds: [], 
        KPIRatings: [],
        KPITargets: [],
        KPIMOVs: [],
    },
    updateForm: {
        id: '',
        name: '',
        description: '',
        functionType: '',
        isOfficeMandate: false,
        isPercentage: false,
        isTargetValueAllocable: false,
        SDGIds: [],
        AttributeIds: [], 
        KPIRatings: [],
        KPITargets: [],
        KPIMOVs: [],
    },
}

// Persisted form data atom
export const subKpiFormDataAtom = atomWithStorage<SubKpiFormData>(
    FORM_STORAGE_KEY,
    defaultFormData,
)

// Derived atoms for form data
export const createFormDataAtom = atom(
    (get) => get(subKpiFormDataAtom).createForm,
    (get, set, update: Partial<CreateKpiFormType>) => {
        const current = get(subKpiFormDataAtom)
        set(subKpiFormDataAtom, {
            ...current,
            createForm: { ...current.createForm, ...update },
        })
    },
)

export const updateFormDataAtom = atom(
    (get) => get(subKpiFormDataAtom).updateForm,
    (get, set, update: Partial<CreateKpiFormType & { id: string }>) => {
        const current = get(subKpiFormDataAtom)
        set(subKpiFormDataAtom, {
            ...current,
            updateForm: { ...current.updateForm, ...update },
        })
    },
)

// Check if form has unsaved changes
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

// Reset form data
export const resetFormDataAtom = atom(null, (_get, set) => {
    set(subKpiFormDataAtom, defaultFormData)
})

// Clear specific form data
export const clearCreateFormAtom = atom(null, (_get, set) => {
    set(createFormDataAtom, defaultFormData.createForm)
})

export const clearUpdateFormAtom = atom(null, (_get, set) => {
    set(updateFormDataAtom, defaultFormData.updateForm)
})
