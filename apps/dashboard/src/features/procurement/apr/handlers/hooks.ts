/**
 * APR API Hooks
 *
 * All query and mutation hooks for the APR feature.
 * Mutations that modify server data automatically invalidate the relevant query caches.
 *
 * @module features/procurement/apr/handlers/hooks
 */

import { useQueryClient, type UseMutationResult } from '@tanstack/react-query'
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
import { getApprovedAPPsRequest } from './getApprovedAPPsRequest'
import { getAPPByIdRequest } from './getAPPByIdRequest'
import { getFiscalYearsRequest } from './getFiscalYearsRequest'

type MutationResult<TData, TVariables> = UseMutationResult<
  TData,
  unknown,
  TVariables,
  unknown
>

/**
 * Wraps a mutation hook so that on success the /aprs query caches are automatically invalidated.
 */
function makeAPRMutationWithRefresh<TData, TVariables>(
  baseHook: () => MutationResult<TData, TVariables>,
) {
  return function useAPRMutationWithRefresh(): MutationResult<TData, TVariables> {
    const queryClient = useQueryClient()
    const mutation = baseHook()

    const invalidateAPRCaches = () => {
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === 'string' && key.startsWith('/aprs')
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
            invalidateAPRCaches()
          },
        })
      }) as MutationResult<TData, TVariables>['mutate'],
      mutateAsync: (async (variables, options) => {
        const result = await mutation.mutateAsync(variables, options)
        invalidateAPRCaches()
        return result
      }) as MutationResult<TData, TVariables>['mutateAsync'],
    }
  }
}

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

// ─── Base mutation hooks ─────────────────────────────────────────────────────

const useBaseCreateAPR = createMutationHookFromTemplate(createAPRRequest)
const useBaseSubmitAPR = createMutationHookFromTemplate(submitAPRRequest)
const useBaseApproveAPR = createMutationHookFromTemplate(approveAPRRequest)
const useBaseReturnAPR = createMutationHookFromTemplate(returnAPRRequest)
const useBaseDeleteAPR = createMutationHookFromTemplate(deleteAPRRequest)
const useBaseUpdateAPR = createMutationHookFromTemplate(updateAPRRequest)

// ─── Invalidation-wrapped mutation hooks ─────────────────────────────────────

/** Create APR and invalidate APR cache. */
export const useCreateAPRMutation = makeAPRMutationWithRefresh(useBaseCreateAPR)

/** Submit APR for approval and invalidate APR cache. */
export const useSubmitAPRMutation = makeAPRMutationWithRefresh(useBaseSubmitAPR)

/** Approve APR and invalidate APR cache. */
export const useApproveAPRMutation = makeAPRMutationWithRefresh(useBaseApproveAPR)

/** Return APR for revision and invalidate APR cache. */
export const useReturnAPRMutation = makeAPRMutationWithRefresh(useBaseReturnAPR)

/** Delete draft APR and invalidate APR cache. */
export const useDeleteAPRMutation = makeAPRMutationWithRefresh(useBaseDeleteAPR)

/** Update draft APR and invalidate APR cache. */
export const useUpdateAPRMutation = makeAPRMutationWithRefresh(useBaseUpdateAPR)
