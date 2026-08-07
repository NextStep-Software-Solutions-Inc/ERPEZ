import { atom } from 'jotai'
import type { DuplicateHandling } from '../types/importTypes'

/**
 * Import Dialog Atom
 * Manages state for the import dialog and file selection
 */
export const importDialogAtom = atom<{
  isOpen: boolean
  file: File | null
  duplicateHandling: DuplicateHandling
}>({
  isOpen: false,
  file: null,
  duplicateHandling: 'SKIP',
})
