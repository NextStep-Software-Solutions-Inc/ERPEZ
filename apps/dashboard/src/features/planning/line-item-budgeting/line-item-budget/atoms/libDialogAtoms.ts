import { atom } from 'jotai'

// Atom to track the current step in the dialog wizard
export type LibDialogStep = 1 | 2
export const libDialogCurrentStepAtom = atom<LibDialogStep>(1)

// Atom to track the selected source document
export interface LibDialogSourceDocument {
  id: string
  code: string
  name: string
  status: 'Approved' | 'Draft'
  office: string
  type: 'OPCR' | 'WFP'
  fiscalYear: string
  projectName?: string
}

export const libDialogSelectedDocumentAtom =
  atom<LibDialogSourceDocument | null>(null)

// Atoms for form field values
export const libDialogFiscalYearAtom = atom<string>('')
export const libDialogFundClusterAtom = atom<string>('')

// Derived read-only atom that computes if we can proceed to step 2
export const libDialogCanProceedToStep2Atom = atom((get) => {
  const fiscalYear = get(libDialogFiscalYearAtom)
  const fundCluster = get(libDialogFundClusterAtom)
  return !!fiscalYear && !!fundCluster
})
