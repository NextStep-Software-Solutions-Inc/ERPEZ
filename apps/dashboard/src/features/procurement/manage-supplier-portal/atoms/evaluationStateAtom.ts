import { atom } from 'jotai'
import type { EvaluationState } from '../types'

/**
 * Shared evaluation state atom
 * Persists the current evaluation being worked on across component tree
 * Used by ReviewWorkspace and evaluation form components
 */
export const evaluationStateAtom = atom<EvaluationState | null>(null)

/**
 * Selected application ID atom
 * Tracks which supplier application is currently being reviewed
 */
export const selectedApplicationIdAtom = atom<string | null>(null)

/**
 * Unsaved changes flag atom
 * Indicates whether evaluation has been modified but not saved
 */
export const hasUnsavedChangesAtom = atom<boolean>(false)
