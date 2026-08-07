import { atom } from 'jotai'
import type { SignatoryAssignment } from '@/lib/fiscal-year-and-policies/types'

/**
 * Annual Signatory Matrix Atoms
 * State management for dialogs, selection, filtering, and pagination
 */

// Dialog state atoms
export const editSignatoryDialogOpenAtom = atom(false)
export const deleteSignatoryDialogOpenAtom = atom(false)
export const createSignatoryDialogOpenAtom = atom(false)

// Selected item atom (consolidates edit/delete selection)
export const selectedSignatoryAtom = atom<SignatoryAssignment | null>(null)

// Pagination atoms
export const currentPageAtom = atom(1)
export const pageSizeAtom = atom(10)

// Filter atoms (null-based for true "no filter" state)
export const filterFiscalYearAtom = atom<string | null>(null)
export const filterOrganizationAtom = atom<string | null>(null)
export const searchQueryAtom = atom('')
