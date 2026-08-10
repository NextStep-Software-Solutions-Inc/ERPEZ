import { useAtom } from 'jotai'
import { createFormDataAtom  } from '../atoms/formAtoms'
import type { CreateOPCRFormValues  } from '../atoms/formAtoms';


/**
 * Custom hook to update Jotai atom whenever form values change.
 * Automatically persists updates via atomWithStorage.
 *
 * @returns A function to update form data with a field name and value
 */
export function useUpdateFormData() {
    const [, setFormData] = useAtom(createFormDataAtom)

    const updateFormData = (fieldName: keyof CreateOPCRFormValues, value: any) => {
        setFormData({ [fieldName]: value })
    }

    return updateFormData
}
