/**
 * Request Workflow Atoms
 * Manages detail panel selections and dialog states for request workflow
 */

import { atom } from 'jotai'
import type { ItemRequest, NonCSEItem } from '../types/catalog.types'

// ─── DETAIL PANEL STATE ─────────────────────────────────────────────────────

/**
 * Selected item ID for Master Catalog detail panel
 * null = panel closed
 */
export const catalogDetailSelectedIdAtom = atom<string | null>(null)

/**
 * Selected request ID for Request Queue detail panel
 * null = panel closed
 */
export const requestDetailSelectedIdAtom = atom<string | null>(null)

/**
 * Request Detail Panel visibility state
 */
export const requestDetailPanelVisibleAtom = atom(false)

/**
 * Derived: Currently selected catalog item (full object)
 * Used for safe lookups in detail panel
 * Note: Consumers should compose this lookup in their component
 */
export const catalogDetailSelectedItemAtom = atom<NonCSEItem | null>(null)

/**
 * Derived: Currently selected request (full object)
 * Used for safe lookups in detail panel
 * Note: Consumers should use requestDetailSelectedIdAtom to lookup in itemRequestsAtom
 */
export const requestDetailSelectedItemAtom = atom<ItemRequest | null>(null)

// ─── DIALOG STATE ────────────────────────────────────────────────────────────

/**
 * Request Item Dialog open state
 * Used by both User and Admin for creating new requests
 */
export const requestItemDialogOpenAtom = atom(false)

/**
 * Edit Request Dialog open state
 * Only accessible when request is in Draft or Returned status
 */
export const editRequestDialogOpenAtom = atom(false)

/**
 * Bulk Margin Adjustment Dialog open state
 */
export const bulkAdjustmentDialogOpenAtom = atom(false)

/**
 * ID of request being edited (for Edit Request Dialog)
 */
export const editingRequestIdAtom = atom<string | null>(null)

// ─── FORM STATE ─────────────────────────────────────────────────────────────

/**
 * Temporary storage for image URL in forms
 * Cleared on dialog close
 */
export const imagePreviewUrlAtom = atom<string | null>(null)

/**
 * Selected image file in forms
 */
export const selectedImageFileAtom = atom<File | null>(null)

/**
 * Margin adjustment configuration
 */
export const marginAdjustmentConfigAtom = atom({
  percentage: 0,
  scope: 'selected' as 'selected' | 'category' | 'all',
  selectedCategory: '',
})

// ─── REQUEST DETAIL PANEL HELPERS ———────────────────────────────────────────

/**
 * Open request detail panel with a specific request
 * Usage: useSetAtom(openRequestDetailAtom)(requestId)
 */
export const openRequestDetailAtom = atom(
  null,
  (_get, set, requestId: string) => {
    set(requestDetailSelectedIdAtom, requestId)
    set(requestDetailPanelVisibleAtom, true)
  },
)

/**
 * Close request detail panel
 * Usage: useSetAtom(closeRequestDetailAtom)()
 */
export const closeRequestDetailAtom = atom(null, (_get, set) => {
  set(requestDetailSelectedIdAtom, null)
  set(requestDetailPanelVisibleAtom, false)
})
