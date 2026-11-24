/**
 * Market Scoping Form State Management (Jotai)
 * Manages form state across multi-step wizard and reactive updates
 * Location: src/features/planning/market-scoping/atoms/
 */

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { MarketScopingForm } from '../types/marketScopingTypes'

/**
 * Current draft form being edited
 * Persisted in localStorage to allow incremental form building and draft preservation
 */
export const draftMarketScopingAtom =
  atomWithStorage<Partial<MarketScopingForm> | null>(
    'erpez_market_scoping_draft',
    null,
  )

/**
 * Current step in the multi-step wizard (1-4)
 */
export const currentFormStepAtom = atom<number>(1)

/**
 * Form validation errors by field
 * Key: field path (e.g., "projectName", "activities[0].attachments")
 */
export const formErrorsAtom = atom<Record<string, string>>({})

/**
 * Loading state for form submission
 */
export const isFormSavingAtom = atom<boolean>(false)

/**
 * Loading state for PDF generation
 */
export const isGeneratingPdfAtom = atom<boolean>(false)

/**
 * Track which activities have been checked
 * Used for conditional file upload display
 */
export const checkedActivitiesAtom = atom<Set<string>>(new Set<string>())

/**
 * Track file uploads in progress
 * Key: activityId or parameterId, Value: upload progress %
 */
export const fileUploadProgressAtom = atom<Record<string, number>>({})

/**
 * Track unsaved changes to form
 * Triggers unsaved changes warning dialog on exit
 */
export const hasUnsavedChangesAtom = atom<boolean>(false)

/**
 * Selected view mode in View Details page
 * "overview" | "activities" | "parameters"
 */
export const viewDetailsTabAtom = atom<string>('overview')

/**
 * Approval action being performed
 * "approving" | "rejecting" | null
 */
export const approvalActionTypeAtom = atom<'approving' | 'rejecting' | null>(
  null,
)

/**
 * Rejection reason text (when rejecting)
 */
export const rejectionReasonAtom = atom<string>('')

/**
 * Derived atom: Check if current step is valid
 * Returns true if current step data passes validation
 */
export const isCurrentStepValidAtom = atom((get) => {
  const draft = get(draftMarketScopingAtom)
  const step = get(currentFormStepAtom)
  const errors = get(formErrorsAtom)

  if (!draft) return false

  const stepErrors = Object.entries(errors)
    .filter(([key]) => {
      // Map field names to steps
      if (step === 1)
        return [
          'projectName',
          'estimatedBudget',
          'periodFrom',
          'periodTo',
          'expectedDeliveryDate',
        ].includes(key.split('[')[0])
      if (step === 2) return key.startsWith('activities')
      if (step === 3) return key.startsWith('parameters')
      return false
    })
    .map(([, value]) => value)
    .filter(Boolean)

  return stepErrors.length === 0
})

/**
 * Derived atom: Check if form is complete and ready for submission
 * All steps must be valid and all required data filled
 */
export const isFormCompleteAtom = atom((get) => {
  const draft = get(draftMarketScopingAtom)
  const errors = get(formErrorsAtom)

  if (!draft) return false

  // Check all required fields
  const hasRequiredFields =
    draft.projectName &&
    draft.estimatedBudget &&
    draft.estimatedBudget > 0 &&
    draft.periodFrom &&
    draft.periodTo &&
    draft.expectedDeliveryDate &&
    draft.activities &&
    draft.activities.some((a) => a.checked) &&
    draft.parameters &&
    draft.parameters.every((p) => p.considered && p.recommendations)

  // Check no validation errors
  const hasErrors = Object.values(errors).some((err) => err)

  return hasRequiredFields && !hasErrors
})

/**
 * Reset form state (called after successful submission or close)
 */
export const resetFormStateAtom = atom(null, (_get, set) => {
  set(draftMarketScopingAtom, null)
  set(currentFormStepAtom, 1)
  set(formErrorsAtom, {})
  set(isFormSavingAtom, false)
  set(isGeneratingPdfAtom, false)
  set(checkedActivitiesAtom, new Set())
  set(fileUploadProgressAtom, {})
  set(hasUnsavedChangesAtom, false)
  set(rejectionReasonAtom, '')
})

/**
 * Create Market Scoping Dialog open state
 */
export const createMarketScopingDialogOpenAtom = atom<boolean>(false)

/**
 * Form data persisted for create dialog
 */
export const createMarketScopingFormDataAtom = atom<Partial<MarketScopingForm>>(
  {},
)

/**
 * Delete Market Scoping Dialog open state
 */
export const deleteMarketScopingDialogOpenAtom = atom<boolean>(false)

/**
 * ID of market scoping form selected for deletion
 */
export const selectedMarketScopingForDeleteAtom = atom<string | null>(null)

/**
 * Market Scoping List Filter State (used by toolbar and dashboard)
 * Matches APP consolidation pattern with searchTerm and status filter
 */
interface MarketScopingListFilter {
  searchTerm: string
  statusFilter: string // 'all' or specific status value
}

export const marketScopingListFilterAtom = atom<MarketScopingListFilter>({
  searchTerm: '',
  statusFilter: 'all',
})

/**
 * Layout view type for Market Scoping dashboard list (list view vs grid card view)
 */
export const marketScopingViewTypeAtom = atom<'list' | 'grid'>('list')

/**
 * Open/close state of the Market Scoping reference/interactive guide dialog
 */
export const marketScopingGuideOpenAtom = atom<boolean>(false)
