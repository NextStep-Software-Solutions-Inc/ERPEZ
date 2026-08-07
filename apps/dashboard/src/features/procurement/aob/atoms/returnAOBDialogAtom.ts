/**
 * Return AOB Dialog State Atom
 * Manages dialog open/close state for returning AOB for revision
 */

import { atom } from 'jotai'

export const returnAOBDialogAtom = atom<{
  isOpen: boolean
  selectedAOBId?: string | null
}>({
  isOpen: false,
  selectedAOBId: null,
})
