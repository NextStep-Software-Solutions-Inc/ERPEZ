/**
 * Create AOB Dialog State Atom
 * Manages dialog open/close state for creating new AOBs
 */

import { atom } from 'jotai'

export const createAOBDialogAtom = atom<{
  isOpen: boolean
}>({
  isOpen: false,
})
