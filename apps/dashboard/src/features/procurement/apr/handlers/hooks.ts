/**
 * APR API Hooks
 *
 * All query and mutation hooks for the APR feature.
 * Connects directly to backend REST endpoints.
 *
 * @module features/procurement/apr/handlers/hooks
 */

import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { getAPRsRequest } from './getAPRsRequest'
import { getAPRRequest } from './getAPRRequest'
import { createAPRRequest } from './createAPRRequest'
import { submitAPRRequest } from './submitAPRRequest'
import { approveAPRRequest } from './approveAPRRequest'
import { returnAPRRequest } from './returnAPRRequest'
import { deleteAPRRequest } from './deleteAPRRequest'
import { updateAPRRequest } from './updateAPRRequest'
import { addItemsToAPRRequest } from './addItemsToAPRRequest'
import { getApprovedAPPsRequest } from './getApprovedAPPsRequest'
import { getAPPByIdRequest } from './getAPPByIdRequest'
import { getFiscalYearsRequest } from './getFiscalYearsRequest'

// ─── Query hooks ─────────────────────────────────────────────────────────────

/** Paginated list of APRs. Accepts Sieve filter/sort strings. */
export const useAPRs = createQueryHookFromTemplate(getAPRsRequest)

/** Single APR with full item list. Pass `{ pathParams: { aprId } }`. */
export const useAPR = createQueryHookFromTemplate(getAPRRequest)

/** List of APPs available for APR creation. */
export const useApprovedAPPs = createQueryHookFromTemplate(getApprovedAPPsRequest)

/** Single APP with item details. Pass `{ pathParams: { appId } }`. */
export const useAPPById = createQueryHookFromTemplate(getAPPByIdRequest)

/** List of active and available Fiscal Years. */
export const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)

// ─── Mutation hooks ──────────────────────────────────────────────────────────

/** Create APR */
export const useCreateAPRMutation = createMutationHookFromTemplate(createAPRRequest)

/** Submit APR for approval */
export const useSubmitAPRMutation = createMutationHookFromTemplate(submitAPRRequest)

/** Approve APR */
export const useApproveAPRMutation = createMutationHookFromTemplate(approveAPRRequest)

/** Return APR for revision */
export const useReturnAPRMutation = createMutationHookFromTemplate(returnAPRRequest)

/** Delete draft APR */
export const useDeleteAPRMutation = createMutationHookFromTemplate(deleteAPRRequest)

/** Update draft APR */
export const useUpdateAPRMutation = createMutationHookFromTemplate(updateAPRRequest)

/** Add catalog items to draft APR */
export const useAddCatalogItemsToAPRMutation = createMutationHookFromTemplate(addItemsToAPRRequest)
