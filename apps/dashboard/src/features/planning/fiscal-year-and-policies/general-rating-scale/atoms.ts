/**
 * General Rating Scale Atoms
 * Pattern: SPMS Dialog/Form Pattern
 */

import { atom } from 'jotai'
import type { GeneralRatingScale } from '@/lib/fiscal-year-and-policies/types'

/**
 * Visibility state for the Rating Scale Dialog
 */
export const ratingScaleDialogOpenAtom = atom<boolean>(false)

/**
 * Current mode for the Dialog: 'create' or 'edit'
 */
export const ratingScaleDialogModeAtom = atom<'create' | 'edit'>('create')

/**
 * The rating scale currently being edited (null if in create mode)
 */
export const selectedRatingScaleAtom = atom<GeneralRatingScale | null>(null)

/**
 * Derived atom to check if the dialog is in edit mode
 */
export const isEditRatingScaleAtom = atom(
  (get) => get(ratingScaleDialogModeAtom) === 'edit',
)

/**
 * Visibility state for the Delete Rating Scale Dialog
 */
export const deleteRatingScaleDialogOpenAtom = atom<boolean>(false)

/**
 * The rating scale currently selected for deletion (null if not deleting)
 */
export const selectedRatingScaleForDeleteAtom = atom<GeneralRatingScale | null>(
  null,
)

/**
 * Derived atom to check if the delete dialog is open
 */
export const isDeleteDialogOpenAtom = atom((get) =>
  get(deleteRatingScaleDialogOpenAtom),
)
