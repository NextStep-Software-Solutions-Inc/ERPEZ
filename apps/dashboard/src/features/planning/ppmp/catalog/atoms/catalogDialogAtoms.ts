/**
 * Catalog Dialog State Atoms
 * Controls open/close state for Create, Edit, and Delete dialogs.
 */

import { atom } from 'jotai'
import type { NonCSEItem } from '../types/catalog.types'

/** Create Item dialog visibility */
export const createItemDialogOpenAtom = atom<boolean>(false)

/** Edit Item dialog visibility */
export const editItemDialogOpenAtom = atom<boolean>(false)

/** Delete Item dialog visibility */
export const deleteItemDialogOpenAtom = atom<boolean>(false)

/** Bulk Pricing Adjustment dialog visibility */
export const bulkPricingDialogOpenAtom = atom<boolean>(false)

/** The item currently being edited (pre-fills the Edit dialog) */
export const itemToEditAtom = atom<NonCSEItem | null>(null)

/** The item currently targeted for deactivation */
export const itemToDeleteAtom = atom<NonCSEItem | null>(null)

/** Selected item IDs for bulk operations */
export const selectedItemIdsAtom = atom<string[]>([])
