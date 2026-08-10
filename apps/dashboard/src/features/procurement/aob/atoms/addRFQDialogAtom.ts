/**
 * Add RFQ Dialog State Atom
 * Manages dialog open/close state for linking RFQ to AOB
 */

import { atom } from 'jotai'

export const addRFQDialogAtom = atom<{
  isOpen: boolean
  selectedAOBId?: string | null
}>({
  isOpen: false,
  selectedAOBId: null,
})
