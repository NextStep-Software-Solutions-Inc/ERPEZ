import { atom } from 'jotai'
import type { CodeSegmentType } from '../types/commonTypes'

/**
 * Delete Code Segment Dialog State Atom
 * Manages dialog open/close state for deleting code segments
 */
export const deleteCodeSegmentDialogAtom = atom<{
  isOpen: boolean
  segmentType: CodeSegmentType | null
  id: string | null
}>({
  isOpen: false,
  segmentType: null,
  id: null,
})
