/**
 * Rating Scale Template Jotai Atoms for State Management
 */

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { RatingScaleTemplate, RatingScaleTemplateFormValues } from '../types'

/**
 * Dialog state atoms
 */
export const createTemplateDialogOpenAtom = atom(false)
export const editTemplateDialogOpenAtom = atom(false)
export const deleteTemplateDialogOpenAtom = atom(false)

/**
 * Selected template for detail view
 */
export const selectedTemplateAtom = atom<RatingScaleTemplate | null>(null)

/**
 * Selected template for editing/deletion
 */
export const selectedTemplateForEditAtom = atom<RatingScaleTemplate | null>(
  null,
)
export const selectedTemplateForDeleteAtom = atom<RatingScaleTemplate | null>(
  null,
)

/**
 * Form data persistence
 */
export const createTemplateFormDataAtom = atomWithStorage<
  Partial<RatingScaleTemplateFormValues>
>('rating-scale-create-form-draft', {})

/**
 * Template preview state (for showing/hiding preview)
 */
export const templatePreviewAtom = atom<RatingScaleTemplate | null>(null)

/**
 * Filter/search state
 */
export const templateSearchFilterAtom = atom('')
export const templateScaleTypeFilterAtom = atom<string>('')

/**
 * Tab filtering state for sidebar
 * 'all' | 'preset' | 'custom'
 */
export const templateFilterTabAtom = atom<'all' | 'preset' | 'custom'>('all')

/**
 * Pagination state
 */
export const templateTablePageAtom = atom(1)
export const templateTablePageSizeAtom = atom(10)
