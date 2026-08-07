import { atom } from 'jotai'
import type { AppMaster, AppStatus, AppType } from '../types'

/**
 * APP State Management - Jotai Atoms
 *
 * Global state for APP consolidation workflow:
 * - Current selected APP for editing/viewing
 * - List of all APPs across all statuses
 * - Unsaved changes tracking
 * - Row selection for bulk operations
 * - Workflow state and transitions
 * - Filtered/derived views
 *
 * Documentation: documentations/app-state-management.md
 */

// ============================================
// PRIMARY ATOMS (READ/WRITE)
// ============================================

/**
 * appListAtom - All APPs (Draft, Submitted, Approved, Locked)
 * Populated from getAppListRequest API
 */
export const appListAtom = atom<AppMaster[]>([])

/**
 * currentAppAtom - Currently selected APP for editing/viewing
 * Set when user clicks "Edit" or "View" on an APP
 * Cleared when user closes editor dialog
 */
export const currentAppAtom = atom<AppMaster | null>(null)

/**
 * unsavedChangesAtom - Track if current APP has unsaved edits
 * Set to true when user modifies BAC items, notes, or settings
 * Set to false after successful save
 * Triggers "Unsaved Changes" dialog on navigation/close
 */
export const unsavedChangesAtom = atom<boolean>(false)

/**
 * selectedItemIdsAtom - Row IDs selected in current APP table
 * For bulk operations like "Delete Selected" or "Export Selected"
 * Cleared when APP changes or operations complete
 */
export const selectedItemIdsAtom = atom<Set<string>>(new Set<string>())

/**
 * appWorkflowStateAtom - Current step in APP lifecycle
 * Used to control UI transitions (e.g., disable Submit button if not Draft)
 */
export const appWorkflowStateAtom = atom<{
  status: AppStatus | null
  lastAction: 'created' | 'submitted' | 'approved' | 'rejected' | 'locked' | null
  lastActionAt: Date | null
} | null>(null)

/**
 * editingLineItemsAtom - Track which BAC items have been edited
 * Maps itemId to modification timestamp
 * Used to show "Unsaved" badge on rows
 */
export const editingLineItemsAtom = atom<Map<string, Date>>(new Map())

// ============================================
// DERIVED ATOMS (READ-ONLY)
// ============================================

/**
 * draftAppsAtom - Filtered view: Only Draft status APPs
 * Used by APP Dashboard "Draft" tab
 */
export const draftAppsAtom = atom((get) => {
  const apps = get(appListAtom)
  return apps.filter((app) => app.status === 'Draft')
})

/**
 * submittedAppsAtom - Filtered view: Only Submitted status APPs
 * Used by APP Dashboard "Pending Approval" tab
 */
export const submittedAppsAtom = atom((get) => {
  const apps = get(appListAtom)
  return apps.filter((app) => app.status === 'Submitted')
})

/**
 * approvedAppsAtom - Filtered view: Approved OR Locked APPs
 * Used by APP Dashboard "Approved" tab
 */
export const approvedAppsAtom = atom((get) => {
  const apps = get(appListAtom)
  return apps.filter((app) => app.status === 'Approved' || app.status === 'Locked')
})

/**
 * appsByFiscalYearAtom - Group APPs by fiscal year for filtering
 * Returns Map<year, AppMaster[]>
 */
export const appsByFiscalYearAtom = atom((get) => {
  const apps = get(appListAtom)
  const grouped = new Map<number, AppMaster[]>()

  apps.forEach((app) => {
    const year = app.fiscalYear
    if (!grouped.has(year)) {
      grouped.set(year, [])
    }
    grouped.get(year)!.push(app)
  })

  return grouped
})

/**
 * appsByTypeAtom - Group APPs by type (Indicative/Supplemental)
 * Returns Map<type, AppMaster[]>
 */
export const appsByTypeAtom = atom((get) => {
  const apps = get(appListAtom)
  const grouped = new Map<AppType, AppMaster[]>()

  apps.forEach((app) => {
    const type = app.appType
    if (!grouped.has(type)) {
      grouped.set(type, [])
    }
    grouped.get(type)!.push(app)
  })

  return grouped
})

/**
 * hasUnsavedChangesAtom - Boolean indicator for UI rendering
 * Triggers AlertDialog before navigation/close if true
 * Derived from unsavedChangesAtom OR editingLineItemsAtom size > 0
 */
export const hasUnsavedChangesAtom = atom((get) => {
  const unsaved = get(unsavedChangesAtom)
  const editing = get(editingLineItemsAtom)
  return unsaved || editing.size > 0
})

/**
 * unsavedLineItemsAtom - List of item IDs with unsaved changes
 * For showing "Unsaved" badges in table rows
 */
export const unsavedLineItemsAtom = atom((get) => {
  const editing = get(editingLineItemsAtom)
  return new Set(editing.keys())
})

/**
 * isLockedAtom - Whether current APP is in Locked status
 * Disables all editing UI elements when true
 */
export const isLockedAtom = atom((get) => {
  const app = get(currentAppAtom)
  return app?.status === 'Locked'
})

/**
 * isEditableAtom - Whether current APP can be edited
 * True only if status === 'Draft' AND not locked
 */
export const isEditableAtom = atom((get) => {
  const app = get(currentAppAtom)
  return app?.status === 'Draft' && !app?.lockedAt
})

/**
 * isSubmittableAtom - Whether current APP can be submitted
 * True only if:
 * - Status === 'Draft'
 * - Has at least 1 BAC line item
 * - All required fields populated (name, code, type, fiscal year)
 */
export const isSubmittableAtom = atom((get) => {
  const app = get(currentAppAtom)
  if (!app) return false
  if (app.status !== 'Draft') return false
  if (!app.appName || !app.appCode || !app.appType || !app.fiscalYear) return false
  if ((app.bac?.lineItems?.length || 0) === 0) return false
  return true
})

/**
 * canApproveAtom - Whether current user can approve APP
 * Typically role-based: only HOPE role can approve
 * AND app status must be 'Submitted'
 * Implemented in components with role context
 */
export const canApproveAtom = atom((get) => {
  const app = get(currentAppAtom)
  return app?.status === 'Submitted'
})

/**
 * appCountsAtom - Summary counts for dashboard badges
 * Returns { draft, submitted, approved, locked, total }
 */
export const appCountsAtom = atom((get) => {
  const apps = get(appListAtom)
  return {
    draft: apps.filter((a) => a.status === 'Draft').length,
    submitted: apps.filter((a) => a.status === 'Submitted').length,
    approved: apps.filter((a) => a.status === 'Approved').length,
    locked: apps.filter((a) => a.status === 'Locked').length,
    total: apps.length,
  }
})
