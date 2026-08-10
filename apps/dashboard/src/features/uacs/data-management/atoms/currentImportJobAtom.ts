import { atom } from 'jotai'
import type { ImportJob } from '../types/importTypes'

/**
 * Import Job Progress Atom
 * Tracks the current import job progress
 */
export const currentImportJobAtom = atom<ImportJob | null>(null)
