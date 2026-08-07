/**
 * PPMP Jotai Atoms for State Management
 * Handles dialog states, form persistence, table/filter state, and UI interactivity
 */

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { PPMP, PPMPState, CreatePPMPMetadata, CatalogItem } from '../types'
import type { ValidationError } from '../lib/ppmpValidation'

// ─── Dialog Control Atoms ─────────────────────────────────────────────────────

export const createPpmpDialogOpenAtom = atom(false)
export const createMasterPpmpDialogOpenAtom = atom(false)
export const editPpmpDialogOpenAtom = atom(false)
export const deletePpmpDialogOpenAtom = atom(false)
export const catalogPickerModalOpenAtom = atom(false)
export const importDeptPpmpDialogOpenAtom = atom(false)
export const approvalDialogOpenAtom = atom(false)
export const rejectionDialogOpenAtom = atom(false)
export const amendmentDialogOpenAtom = atom(false)
export const mopOverrideDialogOpenAtom = atom(false)
export const addActivityBlockDialogOpenAtom = atom(false)

/** Controls visibility of the Link Scoping Form modal */
export const linkScopingFormModalOpenAtom = atom(false)

/** The line item ID currently being linked to an MSF (single-item mode) */
export const targetLineItemIdForMsfAtom = atom<string | null>(null)

/** Selected line item IDs for bulk MSF linking */
export const selectedLineItemIdsAtom = atom<Set<string>>(new Set<string>())

/** Controls visibility of the Bulk Link MSF modal */
export const bulkLinkMsfModalOpenAtom = atom(false)

// ─── Selection Atoms ──────────────────────────────────────────────────────────

/** The PPMP currently being viewed or edited in the workspace */
export const selectedPpmpForEditAtom = atom<PPMP | null>(null)

/** The lightweight PPMP row selected for delete confirmation */
export const selectedPpmpForDeleteAtom = atom<PPMP | null>(null)

/** Master PPMP currently being edited for import operations */
export const selectedMasterPpmpForImportAtom = atom<PPMP | null>(null)

/** IoE Block ID that the catalog picker is currently adding items to */
export const targetIoEBlockIdAtom = atom<string | null>(null)

/** Item ID (line item) being configured for MoP override */
export const targetLineItemIdForMopAtom = atom<string | null>(null)

/** Selected department PPMP ids for batch consolidation into a master PPMP */
export const selectedDeptPpmpIdsAtom = atom<string[]>([])

// ─── Form Persistence Atoms (localStorage) ────────────────────────────────────

/** Create PPMP step-1 metadata — persisted so users don't lose their work */
export const createPpmpFormDataAtom = atomWithStorage<
  Partial<CreatePPMPMetadata>
>('ppmp-create-form-draft', {})

// ─── Catalog Picker State ─────────────────────────────────────────────────────

/** Currently selected catalog items in the picker modal (batch selection) */
export const selectedCatalogItemsAtom = atom<CatalogItem[]>([])

/** Active tab in the catalog picker modal */
export const catalogPickerTabAtom = atom<'cse' | 'non-cse'>('cse')

/** Search query in the catalog picker modal */
export const catalogPickerSearchAtom = atom('')

// ─── Accordion / UI State ─────────────────────────────────────────────────────

/** Set of IoE block IDs that are currently expanded (accordion state) */
export const expandedIoEBlocksAtom = atom<Set<string>>(new Set<string>())

/** Set of Activity block IDs that are currently expanded (accordion state) */
export const expandedActivityBlocksAtom = atom<Set<string>>(new Set<string>())

// ─── Table / Filter Atoms ─────────────────────────────────────────────────────

/** Search text for the PPMP list tables */
export const ppmpSearchFilterAtom = atom('')

/** State filter for My Drafts / For Approval tabs */
export const ppmpStateFilterAtom = atom<PPMPState | 'all'>('all')

/** Pagination for the drafts/approval/approved tables */
export const ppmpTablePageAtom = atom(1)
export const ppmpTablePageSizeAtom = atom(10)

/** Sorting state — matches TanStack Table's ColumnSort shape */
export const ppmpTableSortingAtom = atom<{ id: string; desc: boolean }[]>([])

/** Column visibility for PPMP list tables */
export const ppmpTableColumnVisibilityAtom = atomWithStorage<
  Record<string, boolean>
>('ppmp-column-visibility', {})

// ─── Validation State Atoms ───────────────────────────────────────────────────

/** Real-time PPMP submission readiness state */
export const ppmpValidationStateAtom = atom<{
  isReady: boolean
  errors: ValidationError[]
}>({
  isReady: false,
  errors: [],
})

// ─── Unsaved Non-Procurable Costs Tracking ────────────────────────────────────

/** Maps IoE Block ID → unsaved non-procurable costs (optimistic validation) */
export const pendingNonProcurableCostsAtom = atom<
  Record<string, import('../types').NonProcurableCost[]>
>({})
