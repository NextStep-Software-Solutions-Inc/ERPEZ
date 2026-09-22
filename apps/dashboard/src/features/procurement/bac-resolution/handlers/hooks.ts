import { useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { approveBacResolutionRequest } from './approveBacResolutionRequest'
import { createBacResolutionRequest } from './createBacResolutionRequest'
import { createWhereasClauseTemplateRequest } from './createWhereasClauseTemplateRequest'
import { deleteWhereasClauseTemplateRequest } from './deleteWhereasClauseTemplateRequest'
import { getBacResolutionRequest } from './getBacResolutionRequest'
import { getBacResolutionsRequest } from './getBacResolutionsRequest'
import { getWhereasClauseTemplatesRequest } from './getWhereasClauseTemplatesRequest'
import { getResolutionClausesRequest } from './getResolutionClausesRequest'
import { createResolutionClauseRequest } from './createResolutionClauseRequest'
import { updateResolutionClauseRequest } from './updateResolutionClauseRequest'
import { deleteResolutionClauseRequest } from './deleteResolutionClauseRequest'
import { linkConsolidatedPrsRequest } from './linkConsolidatedPrsRequest'
import { printBacResolutionRequest } from './printBacResolutionRequest'
import { returnBacResolutionRequest } from './returnBacResolutionRequest'
import { submitBacResolutionRequest } from './submitBacResolutionRequest'
import { updateWhereasClauseTemplateRequest } from './updateWhereasClauseTemplateRequest'
import { updateBacResolutionRequest } from './updateBacResolutionRequest'
import { deleteBacResolutionRequest } from './deleteBacResolutionRequest'
import { generateBACResolutionDocumentRequest } from './generateBacResolutionDocumentRequest'
import { downloadBacResolutionDocumentRequest } from './downloadBacResolutionDocumentRequest'
import { getEligibleAppsForProcurementRequest } from './getEligibleAppsForProcurementRequest'
import { getEligibleConsolidatedPRsRequest } from './getEligibleConsolidatedPRsRequest'
import { getUsersRequest } from '@/features/planning/market-scoping/handlers/getUsersRequest'

const bacResolutionQueryKeys = [['bac-resolutions'], ['bac-resolution']] as const
const whereasClauseQueryKeys = [['/bac-resolution-whereas-clauses'], ['/resolution-clauses']] as const

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

    const invalidateBacResolutions = () => {
      void Promise.all(
        bacResolutionQueryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      )
      void queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/bac/projects'),
      })
    }

    return {
      ...mutation,
      mutate: ((variables, options) => {
        mutation.mutate(variables, {
          ...options,
          onSuccess: (data, mutationVariables, onMutateResult, context) => {
            options?.onSuccess?.(data, mutationVariables, onMutateResult, context)
            invalidateBacResolutions()
          },
        })
      }) as MutationResult<TData, TVariables>['mutate'],
      mutateAsync: (async (variables, options) => {
        const result = await mutation.mutateAsync(variables, options)
        invalidateBacResolutions()
        return result
      }) as MutationResult<TData, TVariables>['mutateAsync'],
    }
  }
}

function makeWhereasClauseMutationWithRefresh<TData, TVariables>(
  baseHook: () => MutationResult<TData, TVariables>,
) {
  return function useMutationWithRefresh(): MutationResult<TData, TVariables> {
    const queryClient = useQueryClient()
    const mutation = baseHook()

    const invalidateWhereasClauses = () => {
      void Promise.all(
        whereasClauseQueryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      )
      void queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          (query.queryKey[0].startsWith('/resolution-clauses') ||
            query.queryKey[0].startsWith('/bac-resolution-whereas-clauses')),
      })
    }

    return {
      ...mutation,
      mutate: ((variables, options) => {
        mutation.mutate(variables, {
          ...options,
          onSuccess: (data, mutationVariables, onMutateResult, context) => {
            options?.onSuccess?.(data, mutationVariables, onMutateResult, context)
            invalidateWhereasClauses()
          },
        })
      }) as MutationResult<TData, TVariables>['mutate'],
      mutateAsync: (async (variables, options) => {
        const result = await mutation.mutateAsync(variables, options)
        invalidateWhereasClauses()
        return result
      }) as MutationResult<TData, TVariables>['mutateAsync'],
    }
  }
}

export const useBacResolutions = createQueryHookFromTemplate(
  getBacResolutionsRequest,
)

export const useBacResolution = createQueryHookFromTemplate(
  getBacResolutionRequest,
)



export const useEligibleAppsForProcurement = createQueryHookFromTemplate(
  getEligibleAppsForProcurementRequest,
)

export const useEligibleConsolidatedPRs = createQueryHookFromTemplate(
  getEligibleConsolidatedPRsRequest,
)

export const useUsers = createQueryHookFromTemplate(getUsersRequest)

const useCreateBacResolutionBase = createMutationHookFromTemplate(
  createBacResolutionRequest,
)
export const useCreateBacResolution = makeMutationWithRefresh(
  useCreateBacResolutionBase,
)

const useLinkConsolidatedPrsBase = createMutationHookFromTemplate(
  linkConsolidatedPrsRequest,
)
export const useLinkConsolidatedPrs = makeMutationWithRefresh(
  useLinkConsolidatedPrsBase,
)

const useSubmitBacResolutionBase = createMutationHookFromTemplate(
  submitBacResolutionRequest,
)
export const useSubmitBacResolution = makeMutationWithRefresh(
  useSubmitBacResolutionBase,
)

export const usePrintBacResolution = createMutationHookFromTemplate(
  printBacResolutionRequest,
)

export const useGenerateBACResolutionDocument = createMutationHookFromTemplate(
  generateBACResolutionDocumentRequest,
)

export const useDownloadBacResolutionDocument = createMutationHookFromTemplate(
  downloadBacResolutionDocumentRequest,
)

export const useWhereasClauseTemplates = createQueryHookFromTemplate(
  getWhereasClauseTemplatesRequest,
)

const useCreateWhereasClauseTemplateBase = createMutationHookFromTemplate(
  createWhereasClauseTemplateRequest,
)
export const useCreateWhereasClauseTemplate = makeWhereasClauseMutationWithRefresh(
  useCreateWhereasClauseTemplateBase,
)

const useUpdateWhereasClauseTemplateBase = createMutationHookFromTemplate(
  updateWhereasClauseTemplateRequest,
)
export const useUpdateWhereasClauseTemplate = makeWhereasClauseMutationWithRefresh(
  useUpdateWhereasClauseTemplateBase,
)

const useDeleteWhereasClauseTemplateBase = createMutationHookFromTemplate(
  deleteWhereasClauseTemplateRequest,
)
export const useDeleteWhereasClauseTemplate = makeWhereasClauseMutationWithRefresh(
  useDeleteWhereasClauseTemplateBase,
)

const useApproveBacResolutionBase = createMutationHookFromTemplate(
  approveBacResolutionRequest,
)
export const useApproveBacResolution = makeMutationWithRefresh(
  useApproveBacResolutionBase,
)

const useReturnBacResolutionBase = createMutationHookFromTemplate(
  returnBacResolutionRequest,
)
export const useReturnBacResolution = makeMutationWithRefresh(
  useReturnBacResolutionBase,
)

const useUpdateBacResolutionBase = createMutationHookFromTemplate(
  updateBacResolutionRequest,
)
export const useUpdateBacResolution = makeMutationWithRefresh(
  useUpdateBacResolutionBase,
)

const useDeleteBacResolutionBase = createMutationHookFromTemplate(
  deleteBacResolutionRequest,
)
export const useDeleteBacResolution = makeMutationWithRefresh(
  useDeleteBacResolutionBase,
)

export const useResolutionClauses = createQueryHookFromTemplate(
  getResolutionClausesRequest,
)

const useCreateResolutionClauseBase = createMutationHookFromTemplate(
  createResolutionClauseRequest,
)
export const useCreateResolutionClause = makeWhereasClauseMutationWithRefresh(
  useCreateResolutionClauseBase,
)

const useUpdateResolutionClauseBase = createMutationHookFromTemplate(
  updateResolutionClauseRequest,
)
export const useUpdateResolutionClause = makeWhereasClauseMutationWithRefresh(
  useUpdateResolutionClauseBase,
)

const useDeleteResolutionClauseBase = createMutationHookFromTemplate(
  deleteResolutionClauseRequest,
)
export const useDeleteResolutionClause = makeWhereasClauseMutationWithRefresh(
  useDeleteResolutionClauseBase,
)

