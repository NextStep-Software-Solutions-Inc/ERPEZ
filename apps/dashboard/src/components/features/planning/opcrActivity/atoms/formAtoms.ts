import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Storage key for form data
const FORM_STORAGE_KEY = 'opcr_activity_form_data'

// Form values type
export interface CreateOPCRActivityFormValues {
    name: string
    description?: string
    budget: number
}

// Form data types
export interface OpcrActivityFormData {
    createForm: Partial<CreateOPCRActivityFormValues>
}

// Default form data
export const defaultFormData: OpcrActivityFormData = {
    createForm: {
        name: '',
        description: '',
        budget: 0,
    },
}

// Persisted form data atom
export const opcrActivityFormDataAtom = atomWithStorage<OpcrActivityFormData>(
    FORM_STORAGE_KEY,
    defaultFormData,
)

// Derived atoms for form data
export const createFormDataAtom = atom(
    (get) => get(opcrActivityFormDataAtom).createForm,
    (get, set, update: Partial<CreateOPCRActivityFormValues>) => {
        const current = get(opcrActivityFormDataAtom)
        set(opcrActivityFormDataAtom, {
            ...current,
            createForm: { ...current.createForm, ...update },
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

// Reset form data
export const resetFormDataAtom = atom(null, (_get, set) => {
    set(opcrActivityFormDataAtom, defaultFormData)
})

// Clear specific form data
export const clearCreateFormAtom = atom(null, (_get, set) => {
    set(createFormDataAtom, defaultFormData.createForm)
})