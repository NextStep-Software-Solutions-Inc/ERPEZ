/**
 * NTP Jotai Atoms
 * Shared state management for NTP dialogs and UI
 */

import { atom } from 'jotai'
import type { NTP } from '../types/ntpTypes'

// Dialog visibility atoms
export const isCreateNTPDialogOpenAtom = atom(false)
export const isNTPDetailsDialogOpenAtom = atom(false)
export const isSubmitNTPDialogOpenAtom = atom(false)
export const isApproveNTPDialogOpenAtom = atom(false)
export const isReturnNTPDialogOpenAtom = atom(false)
export const isLinkSourceDocumentModalOpenAtom = atom(false)

// Selected NTP atom
export const selectedNTPAtom = atom<NTP | null>(null)

// Approve/Return NTP ID atom
export const targetNTPIdAtom = atom<string | null>(null)
