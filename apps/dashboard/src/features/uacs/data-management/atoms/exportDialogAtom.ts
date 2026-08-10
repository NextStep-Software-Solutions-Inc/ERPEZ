import { atom } from 'jotai'

/**
 * Export Options Dialog Atom
 * Manages state for the export options dialog
 */
export const exportDialogAtom = atom<{
  isOpen: boolean
}>({
  isOpen: false,
})
