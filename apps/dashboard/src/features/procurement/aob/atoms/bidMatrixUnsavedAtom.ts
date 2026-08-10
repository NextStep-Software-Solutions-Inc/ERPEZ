/**
 * Bid Matrix Unsaved State Atom
 * Tracks if there are unsaved changes in the bid matrix
 * Used for: unsaved changes protection, dirty state indication
 */

import { atom } from 'jotai'

export const bidMatrixUnsavedAtom = atom<{
  isDirty: boolean
  lastSavedAt?: string
}>({
  isDirty: false,
})
