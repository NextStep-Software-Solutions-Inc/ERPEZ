/**
 * APR State Management via Jotai Atoms
 * Centralized state for dialogs, forms, and APR data
 */

import { atom } from 'jotai'
import type {
  APRMaster,
  ConsolidatedAPRItem,
  APRConsolidationState,
  APRHeader,
  APRTerms,
} from './types'

// ============================================================================
// Dialog State Atoms
// ============================================================================

/** Create APR Dialog visibility */
export const createAPRDialogOpenAtom = atom(false)

/** Select APP Dialog visibility */
export const selectAPPDialogOpenAtom = atom(false)

/** Selected fiscal year for APR creation */
export const selectedAPRFiscalYearAtom = atom(new Date().getFullYear())

/** Add Agency APP to APR Modal visibility */
export const addAgencyAPPDialogOpenAtom = atom(false)

/** APR Details dialog */
export const aprDetailsDialogOpenAtom = atom(false)

/** Submit APR for Review Modal */
export const submitAPRDialogOpenAtom = atom(false)

/** Return APR Modal */
export const returnAPRDialogOpenAtom = atom(false)

/** Approve APR Modal */
export const approveAPRDialogOpenAtom = atom(false)

// ============================================================================
// APR Data State Atoms
// ============================================================================

/** Current APR being viewed/edited */
export const currentAPRAtom = atom<APRMaster | null>(null)

/** List of all APRs */
export const aprListAtom = atom<APRMaster[]>([])

/** Consolidated items for current APR */
export const aprConsolidatedItemsAtom = atom<ConsolidatedAPRItem[]>([])

/** Total amount calculated from consolidated items */
export const aprTotalAmountAtom = atom<number>(0)

// ============================================================================
// Form State Atoms
// ============================================================================

/** APR Header form data */
export const aprHeaderFormAtom = atom<APRHeader>({
  agencyControlNumber: '',
  agencyAccountCode: '',
  description: '',
  requestDate: new Date().toISOString(),
  fiscalYear: new Date().getFullYear(),
  procuringEntity: '',
  requestingEntity: '',
})

/** APR Terms form data */
export const aprTermsFormAtom = atom<APRTerms>({
  modeOfDelivery: 'FAST_LANE' as any,
  insufficientFundsAction: 'REDUCE_QUANTITY' as any,
  attachments: {
    observationReportRequired: false,
    collectiveBarterAgreementRequired: false,
    completeSpecsRequired: false,
  },
  remarks: '',
})

/** Consolidation filter state for Add Agency APP modal */
export const aprConsolidationFilterAtom = atom<APRConsolidationState>({
  sourceAPPId: '',
  selectedAppLineItemIds: [],
  selectedItems: [],
  filter: {
    categories: [],
    months: [],
    funds: [],
  },
  isLoading: false,
})

// ============================================================================
// UI/UX State Atoms
// ============================================================================

/**
 * APR List Filter State Type
 */
interface APRListFilterState {
  fiscalYear: number
  status: string
  searchTerm: string
}

/** APR List filters */
export const aprListFilterAtom = atom<APRListFilterState>({
  fiscalYear: new Date().getFullYear(),
  status: 'all',
  searchTerm: '',
})

/** APR List sorting */
export const aprListSortingAtom = atom({
  column: 'createdAt',
  direction: 'desc' as const,
})

/** Pagination state for APR list */
export const aprListPaginationAtom = atom({
  page: 1,
  pageSize: 10,
  total: 0,
})

/** Whether APR form has unsaved changes */
export const aprFormDirtyAtom = atom(false)

/** ID of APR being returned (for Return modal) */
export const aprIdToReturnAtom = atom<string | null>(null)

/** ID of APR being approved (for Approve modal) */
export const aprIdToApproveAtom = atom<string | null>(null)

// ============================================================================
// Loading/Error State Atoms
// ============================================================================

/** Whether APR list is being fetched */
export const aprListLoadingAtom = atom(false)

/** Whether APR details are being fetched */
export const aprDetailsLoadingAtom = atom(false)

/** Whether APR creation is in progress */
export const aprCreatingAtom = atom(false)

/** Whether consolidation is in progress */
export const aprConsolidatingAtom = atom(false)

/** Error message if any */
export const aprErrorAtom = atom<string | null>(null)
