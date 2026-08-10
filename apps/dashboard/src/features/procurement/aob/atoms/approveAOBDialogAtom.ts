/**
 * Approve AOB Dialog State Atom
 * Manages dialog open/close state for AOB approval by BAC Chairperson
 */

import { atom } from 'jotai'

export const approveAOBDialogAtom = atom<{
  isOpen: boolean
  selectedAOBId?: string | null
}>({
  isOpen: false,
  selectedAOBId: null,
})
