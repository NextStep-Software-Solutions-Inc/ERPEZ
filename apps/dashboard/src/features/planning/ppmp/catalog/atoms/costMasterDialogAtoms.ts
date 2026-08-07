/**
 * Cost Master Dialog State Atoms
 * Controls create/edit dialogs for the Cost Master admin interface.
 */

import { atom } from 'jotai'
import type { CostItemMaster } from '../../types'

export const createCostItemDialogOpenAtom = atom(false)
export const editCostItemDialogOpenAtom = atom(false)
export const costItemToEditAtom = atom<CostItemMaster | null>(null)
