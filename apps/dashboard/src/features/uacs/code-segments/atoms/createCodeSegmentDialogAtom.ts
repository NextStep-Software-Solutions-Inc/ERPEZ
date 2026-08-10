import { atom } from 'jotai'
import type { CodeSegmentType } from '../types/commonTypes'

/**
 * Create Code Segment Dialog State Atom
 * Manages dialog open/close state for creating new code segments
 */
export const createCodeSegmentDialogAtom = atom<{
  isOpen: boolean
  segmentType: CodeSegmentType | null
}>({
  isOpen: false,
  segmentType: null,
})
