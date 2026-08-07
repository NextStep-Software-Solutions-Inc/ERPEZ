/**
 * Bulk Adjustment Workspace Atoms
 * Controls the right-side bulk price adjustment panel state.
 */

import { atom } from 'jotai'
import type { AdjustmentPreview, BulkAdjustmentMode } from '../types'

/** Whether the bulk adjustment panel (Sheet) is open */
export const bulkAdjustmentPanelOpenAtom = atom<boolean>(false)

/** Adjustment mode: 'selected' = checked rows, 'category' = full category */
export const bulkAdjustmentModeAtom = atom<BulkAdjustmentMode>('selected')

/** Category name when mode = 'category' */
export const bulkAdjustmentCategoryAtom = atom<string | null>(null)

/** Signed percentage: -99 to 200 */
export const bulkAdjustmentPercentAtom = atom<number>(0)

/** Reason text (min 5 chars required) */
export const bulkAdjustmentReasonAtom = atom<string>('')

/** Live preview result after "Preview" is clicked */
export const bulkAdjustmentPreviewAtom = atom<AdjustmentPreview | null>(null)

/** Whether preview is being computed */
export const bulkAdjustmentPreviewLoadingAtom = atom<boolean>(false)
