/**
 * Consolidated PR API Hooks
 *
 * All query/mutation hooks for the consolidated-pr feature.
 * Mutations automatically invalidate the consolidated-pr query cache on success.
 *
 * @module features/procurement/consolidated-pr/handlers/hooks
 */

import { useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { addPrsToConsolidatedPrRequest } from './addPrsToConsolidatedPrRequest'
import { createConsolidatedPrRequest } from './createConsolidatedPrRequest'
import { getConsolidatedPrRequest } from './getConsolidatedPrRequest'
import { getConsolidatedPrsRequest } from './getConsolidatedPrsRequest'
import { getEligiblePrsRequest } from './getEligiblePrsRequest'
import { removePrFromConsolidatedPrRequest } from './removePrFromConsolidatedPrRequest'
import { submitConsolidatedPrRequest } from './submitConsolidatedPrRequest'
import { updateConsolidatedPrItemRequest } from './updateConsolidatedPrItemRequest'
import { approveConsolidatedPrRequest } from './approveConsolidatedPrRequest'
import { returnConsolidatedPrRequest } from './returnConsolidatedPrRequest'
import { getProcurementModesRequest } from '@/lib/fiscal-year-and-policies/requests/getProcurementModesRequest'

// ─── Cache invalidation keys ──────────────────────────────────────────────────
const CPR_QUERY_KEYS = [
  ['/consolidated-prs'],
  ['/consolidated-prs/:id'],
  ['/consolidated-prs/:id/eligible-prs'],
] as const

type MutationResult<TData, TVariables> = UseMutationResult<
  TData,
  unknown,
  TVariables,
  unknown
>

function makeCPRMutationWithRefresh<TData, TVariables>(
  baseHook: () => MutationResult<TData, TVariables>,
) {
  return function useCPRMutationWithRefresh(): MutationResult<TData, TVariables> {
    const queryClient = useQueryClient()
    const mutation = baseHook()

    const invalidateCPRCaches = () => {
      void Promise.all(
        CPR_QUERY_KEYS.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      )
    }

    return {
      ...mutation,
      mutate: ((variables, options) => {
        mutation.mutate(variables, {
          ...options,
          onSuccess: (data, mutationVariables, onMutateResult, context) => {
            options?.onSuccess?.(data, mutationVariables, onMutateResult, context)
            invalidateCPRCaches()
          },
        })
      }) as MutationResult<TData, TVariables>['mutate'],
      mutateAsync: (async (variables, options) => {
        const result = await mutation.mutateAsync(variables, options)
        invalidateCPRCaches()
        return result
      }) as MutationResult<TData, TVariables>['mutateAsync'],
    }
  }
}

// ─── Query hooks ─────────────────────────────────────────────────────────────

/** Paginated list of consolidated PRs. */
export const useConsolidatedPrs = createQueryHookFromTemplate(
  getConsolidatedPrsRequest,
)

/** Single Consolidated PR with its linked PRs and items. Pass `{ pathParams: { id } }`. */
export const useConsolidatedPr = createQueryHookFromTemplate(
  getConsolidatedPrRequest,
)

/**
 * PRs eligible to be added to the given Consolidated PR.
 * Pass `{ pathParams: { id: consolidatedPrId } }`.
 */
export const useEligiblePrs = createQueryHookFromTemplate(getEligiblePrsRequest)

// ─── Mutation hooks (base) ────────────────────────────────────────────────────

const useCreateConsolidatedPrBase = createMutationHookFromTemplate(
  createConsolidatedPrRequest,
)

const useAddPrsToConsolidatedPrBase = createMutationHookFromTemplate(
  addPrsToConsolidatedPrRequest,
)

const useRemovePrFromConsolidatedPrBase = createMutationHookFromTemplate(
  removePrFromConsolidatedPrRequest,
)

const useUpdateConsolidatedPrItemBase = createMutationHookFromTemplate(
  updateConsolidatedPrItemRequest,
)

const useSubmitConsolidatedPrBase = createMutationHookFromTemplate(
  submitConsolidatedPrRequest,
)

const useApproveConsolidatedPrBase = createMutationHookFromTemplate(
  approveConsolidatedPrRequest,
)

const useReturnConsolidatedPrBase = createMutationHookFromTemplate(
  returnConsolidatedPrRequest,
)

// ─── Mutation hooks (with cache invalidation) ─────────────────────────────────

/** Create a new Consolidated PR container. */
export const useCreateConsolidatedPr = makeCPRMutationWithRefresh(
  useCreateConsolidatedPrBase,
)

/** Link approved PRs into a Consolidated PR. */
export const useAddPrsToConsolidatedPr = makeCPRMutationWithRefresh(
  useAddPrsToConsolidatedPrBase,
)

/** Remove a PR from a Consolidated PR. */
export const useRemovePrFromConsolidatedPr = makeCPRMutationWithRefresh(
  useRemovePrFromConsolidatedPrBase,
)

/** Approve a Consolidated PR. */
export const useApproveConsolidatedPr = makeCPRMutationWithRefresh(
  useApproveConsolidatedPrBase,
)

/** Return a Consolidated PR for revision. */
export const useReturnConsolidatedPr = makeCPRMutationWithRefresh(
  useReturnConsolidatedPrBase,
)

/** Set procurement mode and partial-delivery flag for a consolidated line item. */
export const useUpdateConsolidatedPrItem = makeCPRMutationWithRefresh(
  useUpdateConsolidatedPrItemBase,
)

/** Submit a Consolidated PR for BAC processing. */
export const useSubmitConsolidatedPr = makeCPRMutationWithRefresh(
  useSubmitConsolidatedPrBase,
)

export const useProcurementModes = createQueryHookFromTemplate(
  getProcurementModesRequest,
)
