import { atom } from 'jotai'
import { EconomicIndicator } from '../components/table/data/economicIndicatorTypes'

/**
 * Dialog state atoms - control visibility of create, edit, and delete dialogs
 */
export const createEconomicIndicatorDialogOpenAtom = atom(false)
export const editEconomicIndicatorDialogOpenAtom = atom(false)
export const deleteEconomicIndicatorDialogOpenAtom = atom(false)

/**
 * Selected economic indicator for editing/deletion
 */
export const selectedEconomicIndicatorForEditAtom =
  atom<EconomicIndicator | null>(null)
export const selectedEconomicIndicatorForDeleteAtom =
  atom<EconomicIndicator | null>(null)

/**
 * Pagination state atoms
 */
export const economicIndicatorPageAtom = atom(1)
export const economicIndicatorPageSizeAtom = atom(12)
