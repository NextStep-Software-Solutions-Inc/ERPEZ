/**
 * Purchase Requests API Hooks
 *
 * All query/mutation hooks for the purchase-requests-pr feature.
 * Mutations that modify server data automatically invalidate the relevant query caches.
 *
 * @module features/procurement/purchase-requests-pr/handlers/hooks
 */

import { useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { createPurchaseRequestRequest } from './createPurchaseRequestRequest'
import { deletePurchaseRequestRequest } from './deletePurchaseRequestRequest'
import { getPurchaseRequestEligiblePpmpsRequest } from './getPurchaseRequestEligiblePpmpsRequest'
import { getPurchaseRequestEligiblePpmpsByOfficeRequest } from './getPurchaseRequestEligiblePpmpsByOfficeRequest'
import { getPurchaseRequestEligibleAprsRequest } from './getPurchaseRequestEligibleAprsRequest'
import { getPurchaseRequestRequest } from './getPurchaseRequestRequest'
import { getPurchaseRequestsRequest } from './getPurchaseRequestsRequest'
import { getPurchaseRequestStatsRequest } from './getPurchaseRequestStatsRequest'
import { updatePurchaseRequestRequest } from './updatePurchaseRequestRequest'
import { updatePurchaseRequestStatusRequest } from './updatePurchaseRequestStatusRequest'

// ─── Cache invalidation keys ──────────────────────────────────────────────────
// These prefix-based keys cover all variations (list, single, stats) automatically.

type MutationResult<TData, TVariables> = UseMutationResult<
  TData,
  unknown,
  TVariables,
  unknown
>

/**
 * Wraps a mutation hook so that on success the purchase-requests and stats
 * query caches are always invalidated without the call-site having to manage it.
 */
function makePRMutationWithRefresh<TData, TVariables>(
  baseHook: () => MutationResult<TData, TVariables>,
) {
  return function usePRMutationWithRefresh(): MutationResult<TData, TVariables> {
    const queryClient = useQueryClient()
    const mutation = baseHook()

    const invalidatePRCaches = () => {
    void queryClient.invalidateQueries({
        predicate: (query) => {
        const key = query.queryKey[0]
        return typeof key === 'string' && key.startsWith('/purchase-requests')
        },
    })
    }

    return {
      ...mutation,
      mutate: ((variables, options) => {
        mutation.mutate(variables, {
          ...options,
          onSuccess: (data, mutationVariables, onMutateResult, context) => {
            options?.onSuccess?.(data, mutationVariables, onMutateResult, context)
            invalidatePRCaches()
          },
        })
      }) as MutationResult<TData, TVariables>['mutate'],
      mutateAsync: (async (variables, options) => {
        const result = await mutation.mutateAsync(variables, options)
        invalidatePRCaches()
        return result
      }) as MutationResult<TData, TVariables>['mutateAsync'],
    }
  }
}

// ─── Query hooks ─────────────────────────────────────────────────────────────

/** Paginated list of purchase requests. Accepts Sieve filter/sort strings. */
export const usePurchaseRequests = createQueryHookFromTemplate(
  getPurchaseRequestsRequest,
)

/** Single PR with full item list. Pass `{ pathParams: { id } }`. */
export const usePurchaseRequest = createQueryHookFromTemplate(
  getPurchaseRequestRequest,
)

/** Dashboard statistics (totals + counts). */
export const usePurchaseRequestStats = createQueryHookFromTemplate(
  getPurchaseRequestStatsRequest,
)

/**
 * PPMP documents eligible to supply items for the given PR.
 * Only relevant for Non-CSE PRs.
 * Pass `{ pathParams: { id: prId } }`.
 */
export const usePurchaseRequestEligiblePpmps = createQueryHookFromTemplate(
  getPurchaseRequestEligiblePpmpsRequest,
)

/**
 * PPMP documents eligible to supply items for a given Office (new PR creation).
 * Only relevant for Non-CSE PRs.
 * Pass `{ queryParams: { officeId } }`.
 */
export const usePurchaseRequestEligiblePpmpsByOffice = createQueryHookFromTemplate(
  getPurchaseRequestEligiblePpmpsByOfficeRequest,
)

/**
 * APR documents eligible to supply out-of-stock items for the given PR.
 * Only relevant for Out-of-Stock CSE PRs.
 * Pass `{ pathParams: { id: prId } }`.
 */
export const usePurchaseRequestEligibleAprs = createQueryHookFromTemplate(
  getPurchaseRequestEligibleAprsRequest,
)

// ─── Mutation hooks (base) ────────────────────────────────────────────────────

const useCreatePurchaseRequestBase = createMutationHookFromTemplate(
  createPurchaseRequestRequest,
)

const useUpdatePurchaseRequestBase = createMutationHookFromTemplate(
  updatePurchaseRequestRequest,
)

const useDeletePurchaseRequestBase = createMutationHookFromTemplate(
  deletePurchaseRequestRequest,
)

const useUpdatePurchaseRequestStatusBase = createMutationHookFromTemplate(
  updatePurchaseRequestStatusRequest,
)

// ─── Mutation hooks (with cache invalidation) ─────────────────────────────────

/** Create a new PR header. On success invalidates the PR list and stats. */
export const useCreatePurchaseRequest = makePRMutationWithRefresh(
  useCreatePurchaseRequestBase,
)

/** Update an existing PR (description, purpose, items). Invalidates PR list/stats. */
export const useUpdatePurchaseRequest = makePRMutationWithRefresh(
  useUpdatePurchaseRequestBase,
)

/** Delete a Draft PR. Invalidates PR list and stats. */
export const useDeletePurchaseRequest = makePRMutationWithRefresh(
  useDeletePurchaseRequestBase,
)

/**
 * Transition a PR to a new status (Submit / Approve / Return).
 * Invalidates PR list, stats, and the individual PR detail cache.
 */
export const useUpdatePurchaseRequestStatus = makePRMutationWithRefresh(
  useUpdatePurchaseRequestStatusBase,
)
