import { atom } from 'jotai'
import type { CodeSegmentType } from '../types/commonTypes'

/**
 * Update Code Segment Dialog State Atom
 * Manages dialog open/close state for updating existing code segments
 */
export const updateCodeSegmentDialogAtom = atom<{
  isOpen: boolean
  segmentType: CodeSegmentType | null
  id: string | null
}>({
  isOpen: false,
  segmentType: null,
  id: null,
})
