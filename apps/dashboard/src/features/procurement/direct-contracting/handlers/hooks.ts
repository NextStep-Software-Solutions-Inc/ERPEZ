import { useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { getDirectContractingsRequest } from './getDirectContractingsRequest'
import { getDirectContractingRequest } from './getDirectContractingRequest'
import { getDirectContractingSummaryRequest } from './getDirectContractingSummaryRequest'
import { createDirectContractingRequest } from './createDirectContractingRequest'
import { changeDirectContractingStatusRequest } from './changeDirectContractingStatusRequest'
import { submitProposalRequest } from './submitProposalRequest'
import { reviewProposalRequest } from './reviewProposalRequest'
import { approveDirectContractingRequest } from './approveDirectContractingRequest'
import { deleteDirectContractingRequest } from './deleteDirectContractingRequest'
import { getEligibleBacProjectsRequest } from './getEligibleBacProjectsRequest'

const queryKeys = [
  ['direct-contractings'],
  ['direct-contracting'],
  ['/direct-contracting'],
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

    const invalidateDirectContractings = () => {
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
            invalidateDirectContractings()
          },
        })
      }) as MutationResult<TData, TVariables>['mutate'],
      mutateAsync: (async (variables, options) => {
        const result = await mutation.mutateAsync(variables, options)
        invalidateDirectContractings()
        return result
      }) as MutationResult<TData, TVariables>['mutateAsync'],
    }
  }
}

export const useDirectContractings = createQueryHookFromTemplate(
  getDirectContractingsRequest,
)

export const useDirectContracting = createQueryHookFromTemplate(
  getDirectContractingRequest,
)

export const useDirectContractingSummary = createQueryHookFromTemplate(
  getDirectContractingSummaryRequest,
)

export const useEligibleBacProjects = createQueryHookFromTemplate(
  getEligibleBacProjectsRequest,
)

const useCreateDirectContractingBase = createMutationHookFromTemplate(
  createDirectContractingRequest,
)
export const useCreateDirectContracting = makeMutationWithRefresh(
  useCreateDirectContractingBase,
)


const useChangeDirectContractingStatusBase = createMutationHookFromTemplate(
  changeDirectContractingStatusRequest,
)
export const useChangeDirectContractingStatus = makeMutationWithRefresh(
  useChangeDirectContractingStatusBase,
)

const useSubmitProposalBase = createMutationHookFromTemplate(
  submitProposalRequest,
)
export const useSubmitProposal = makeMutationWithRefresh(
  useSubmitProposalBase,
)

const useReviewProposalBase = createMutationHookFromTemplate(
  reviewProposalRequest,
)
export const useReviewProposal = makeMutationWithRefresh(
  useReviewProposalBase,
)

const useApproveDirectContractingBase = createMutationHookFromTemplate(
  approveDirectContractingRequest,
)
export const useApproveDirectContracting = makeMutationWithRefresh(
  useApproveDirectContractingBase,
)

export const useDeleteDirectContracting = createMutationHookFromTemplate(
  deleteDirectContractingRequest,
)

