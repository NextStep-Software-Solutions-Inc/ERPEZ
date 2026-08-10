import { useAtom } from 'jotai'
import {
  createFormDataAtom,
  removeFormDataFromStorage,
  type ProcurementPolicyConfigFormValues,
} from '../atoms/formAtoms'

export function useUpdateFormData() {
  const [, setFormData] = useAtom(createFormDataAtom)

  const updateFormData = (
    fieldName: keyof ProcurementPolicyConfigFormValues,
    value: ProcurementPolicyConfigFormValues[typeof fieldName],
  ) => {
    setFormData({ [fieldName]: value })
  }

  const clearFormData = () => {
    removeFormDataFromStorage()
  }

  return { updateFormData, clearFormData }
}
