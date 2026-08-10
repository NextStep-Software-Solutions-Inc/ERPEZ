import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { FunctionConfig } from '../types/functionConfigTypes'

/**
 * Dialog state atoms
 */
export const createFunctionConfigDialogOpenAtom = atom(false)
export const editFunctionConfigDialogOpenAtom = atom(false)
export const deleteFunctionConfigDialogOpenAtom = atom(false)

/**
 * Selected weight configuration for editing/deletion
 */
export const selectedFunctionConfigForEditAtom = atom<FunctionConfig | null>(
  null,
)
export const selectedFunctionConfigForDeleteAtom = atom<FunctionConfig | null>(
  null,
)

/**
 * View mode selection
 */
export const configViewModeAtom = atomWithStorage<'card' | 'table'>(
  'spms-function-config-view-mode',
  'table',
)

/**
 * Pagination state
 */
export const configPageAtom = atom(1)
export const configPageSizeAtom = atom(12)
