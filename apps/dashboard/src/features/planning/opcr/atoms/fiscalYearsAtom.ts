import { atom } from 'jotai'
import { FiscalYear } from '../../fiscal-year-and-policies/fiscal-year-management/types/types'

// In-memory cache for fiscal years
export const fiscalYearsAtom = atom<Array<FiscalYear>>([])
export const fiscalYearsLoadingAtom = atom<boolean>(false)
export const fiscalYearsErrorAtom = atom<string | null>(null)
