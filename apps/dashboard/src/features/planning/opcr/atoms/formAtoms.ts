import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Storage key for form data
const FORM_STORAGE_KEY = 'opcr_form_data'

// Form values type
export interface CreateOPCRFormValues {
    fiscalYearId: string
    name: string
    deliveryUnitId: string
}

// Form data types
export interface OpcrFormData {
    createForm: Partial<CreateOPCRFormValues>
    updateForm: Partial<CreateOPCRFormValues & { id: string }>
}

// Default form data
export const defaultFormData: OpcrFormData = {
    createForm: {
        fiscalYearId: '',
        deliveryUnitId: '',
    },
    updateForm: {
        id: '',
        fiscalYearId: '',
        deliveryUnitId: '',
    },
}

// Persisted form data atom
export const opcrFormDataAtom = atomWithStorage<OpcrFormData>(
    FORM_STORAGE_KEY,
    defaultFormData,
)

// Derived atoms for form data
export const createFormDataAtom = atom(
    (get) => get(opcrFormDataAtom).createForm,
    (get, set, update: Partial<CreateOPCRFormValues>) => {
        const current = get(opcrFormDataAtom)
        set(opcrFormDataAtom, {
            ...current,
            createForm: { ...current.createForm, ...update },
        })
    },
)

export const updateFormDataAtom = atom(
    (get) => get(opcrFormDataAtom).updateForm,
    (get, set, update: Partial<CreateOPCRFormValues & { id: string }>) => {
        const current = get(opcrFormDataAtom)
        set(opcrFormDataAtom, {
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
    set(opcrFormDataAtom, defaultFormData)
})

// Clear specific form data
export const clearCreateFormAtom = atom(null, (_get, set) => {
    set(createFormDataAtom, defaultFormData.createForm)
})

export const clearUpdateFormAtom = atom(null, (_get, set) => {
    set(updateFormDataAtom, defaultFormData.updateForm)
})
