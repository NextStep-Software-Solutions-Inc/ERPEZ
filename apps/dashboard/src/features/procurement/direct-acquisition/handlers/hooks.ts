import { useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { getDirectAcquisitionsSummaryRequest } from './getDirectAcquisitionsSummaryRequest'
import { getDirectAcquisitionsRequest } from './getDirectAcquisitionsRequest'
import { getDirectAcquisitionByIdRequest } from './getDirectAcquisitionByIdRequest'
import { createDirectAcquisitionRequest } from './createDirectAcquisitionRequest'
import { recordDirectPurchaseRequest } from './recordDirectPurchaseRequest'
import { approveDirectAcquisitionRequest } from './approveDirectAcquisitionRequest'
import { returnDirectAcquisitionRequest } from './returnDirectAcquisitionRequest'
import { changeDirectAcquisitionStatusRequest } from './changeDirectAcquisitionStatusRequest'
import { deleteDirectAcquisitionRequest } from './deleteDirectAcquisitionRequest'

const queryKeys = [
  ['direct-acquisitions'],
  ['direct-acquisitions-summary'],
  ['direct-acquisition'],
] as const

type MutationResult<TData, TVariables> = UseMutationResult<
  TData,
  unknown,
  TVariables,
  unknown
>

function makeMutationWithRefresh<TData, TVariables>(
  baseHook: () => MutationResult<TData, TVariables>,
) {
  return function useMutationWithRefresh(): MutationResult<TData, TVariables> {
    const queryClient = useQueryClient()
    const mutation = baseHook()

    const invalidateQueries = () => {
      void Promise.all(
        queryKeys.map((queryKey) =>
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
            invalidateQueries()
          },
        })
      }) as MutationResult<TData, TVariables>['mutate'],
      mutateAsync: (async (variables, options) => {
        const result = await mutation.mutateAsync(variables, options)
        invalidateQueries()
        return result
      }) as MutationResult<TData, TVariables>['mutateAsync'],
    }
  }
}

export const useDirectAcquisitionsSummary = createQueryHookFromTemplate(
  getDirectAcquisitionsSummaryRequest,
)

export const useDirectAcquisitions = createQueryHookFromTemplate(
  getDirectAcquisitionsRequest,
)

export const useDirectAcquisition = createQueryHookFromTemplate(
  getDirectAcquisitionByIdRequest,
)

const useCreateDirectAcquisitionBase = createMutationHookFromTemplate(
  createDirectAcquisitionRequest,
)
export const useCreateDirectAcquisition = makeMutationWithRefresh(
  useCreateDirectAcquisitionBase,
)

const useRecordDirectPurchaseBase = createMutationHookFromTemplate(
  recordDirectPurchaseRequest,
)
export const useRecordDirectPurchase = makeMutationWithRefresh(
  useRecordDirectPurchaseBase,
)

const useApproveDirectAcquisitionBase = createMutationHookFromTemplate(
  approveDirectAcquisitionRequest,
)
export const useApproveDirectAcquisition = makeMutationWithRefresh(
  useApproveDirectAcquisitionBase,
)

const useReturnDirectAcquisitionBase = createMutationHookFromTemplate(
  returnDirectAcquisitionRequest,
)
export const useReturnDirectAcquisition = makeMutationWithRefresh(
  useReturnDirectAcquisitionBase,
)

const useChangeDirectAcquisitionStatusBase = createMutationHookFromTemplate(
  changeDirectAcquisitionStatusRequest,
)
export const useChangeDirectAcquisitionStatus = makeMutationWithRefresh(
  useChangeDirectAcquisitionStatusBase,
)

const useDeleteDirectAcquisitionBase = createMutationHookFromTemplate(
  deleteDirectAcquisitionRequest,
)
export const useDeleteDirectAcquisition = makeMutationWithRefresh(
  useDeleteDirectAcquisitionBase,
)
