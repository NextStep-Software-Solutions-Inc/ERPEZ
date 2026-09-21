/**
 * Contract API Hooks
 *
 * All query and mutation hooks for the contract feature.
 * Mutations that modify server data automatically invalidate all contract
 * and related available-noas query caches.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { APIResponse } from 'erpez-shared-lib'
import { getContractsRequest, type GetContractsParams, type ContractsPaginatedData } from './getContractsRequest'
import { getContractByIdRequest } from './getContractByIdRequest'
import { getContractSummaryRequest } from './getContractSummaryRequest'
import { getAvailableNoasForContractRequest } from './getAvailableNoasForContractRequest'
import { createContractRequest } from './createContractRequest'
import { updateContractRequest } from './updateContractRequest'
import { submitContractRequest } from './submitContractRequest'
import { approveContractRequest } from './approveContractRequest'
import { returnContractRequest } from './returnContractRequest'
import { cancelContractRequest } from './cancelContractRequest'
import { deleteContractRequest } from './deleteContractRequest'
import { generateContractDocumentRequest } from './generateContractDocumentRequest'
import type {
  ContractDetail,
  ContractSummary,
  AvailableNoaForContract,
  CreateContractRequest,
  UpdateContractRequest,
  ApproveContractRequest,
  ReturnContractRequest,
} from '../types'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const contractQueryKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractQueryKeys.all, 'list'] as const,
  list: (params: GetContractsParams) => [...contractQueryKeys.lists(), params] as const,
  details: () => [...contractQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractQueryKeys.details(), id] as const,
  summary: () => [...contractQueryKeys.all, 'summary'] as const,
  availableNoas: () => [...contractQueryKeys.all, 'available-noas'] as const,
}

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function useGetContracts(params: GetContractsParams = {}): UseQueryResult<APIResponse<ContractsPaginatedData>> {
  return useQuery({
    queryKey: contractQueryKeys.list(params),
    queryFn: async ({ signal }) => {
      const pageNum = params.pageNumber ?? params.PageNumber ?? 1
      const pSize = params.pageSize ?? params.PageSize ?? 10
      const filters = params.filters ?? params.Filters
      const sorts = params.sorts ?? params.Sorts
      const search = params.search ?? params.Search
      const status = params.status ?? params.Status

      const searchParams = new URLSearchParams()
      searchParams.set('PageNumber', String(pageNum))
      searchParams.set('PageSize', String(pSize))
      if (filters) searchParams.set('Filters', filters)
      if (sorts) searchParams.set('Sorts', sorts)
      if (search) searchParams.set('Search', search)
      if (status) searchParams.set('Status', status)

      const finalUrl = `/contracts?${searchParams.toString()}`
      return getContractsRequest.fetcher({ finalUrl, signal })
    },
    staleTime: 30_000,
  })
}

export function useGetContractById(id: string | null | undefined): UseQueryResult<ContractDetail> {
  return useQuery({
    queryKey: contractQueryKeys.detail(id ?? ''),
    queryFn: async ({ signal }) => {
      const response = await getContractByIdRequest.fetcher({ finalUrl: `/contracts/${id}`, signal })
      return response.data
    },
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useGetContractSummary(): UseQueryResult<ContractSummary> {
  return useQuery({
    queryKey: contractQueryKeys.summary(),
    queryFn: async ({ signal }) => {
      const response = await getContractSummaryRequest.fetcher({ finalUrl: '/contracts/summary', signal })
      return response.data
    },
    staleTime: 30_000,
  })
}

export function useGetAvailableNoasForContract(enabled = true): UseQueryResult<AvailableNoaForContract[]> {
  return useQuery({
    queryKey: contractQueryKeys.availableNoas(),
    queryFn: async ({ signal }) => {
      const response = await getAvailableNoasForContractRequest.fetcher({ finalUrl: '/contracts/available-noas', signal })
      return response.data ?? []
    },
    enabled,
    staleTime: 30_000,
  })
}

// ─── Mutation Hooks with Auto-Invalidation ─────────────────────────────────

export function useCreateContract(): UseMutationResult<string, Error, CreateContractRequest> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateContractRequest) => {
      const response = await createContractRequest.fetcher({ finalUrl: '/contracts', payload })
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.all })
    },
  })
}

export function useUpdateContract(id?: string): UseMutationResult<boolean, Error, UpdateContractRequest & { id?: string }> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload) => {
      const targetId = id ?? payload.id
      if (!targetId) throw new Error('Contract ID is required for update.')
      const response = await updateContractRequest.fetcher({ finalUrl: `/contracts/${targetId}`, payload })
      return response.data
    },
    onSuccess: (_, variables) => {
      const targetId = id ?? variables.id
      if (targetId) {
        void queryClient.invalidateQueries({ queryKey: contractQueryKeys.detail(targetId) })
      }
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.lists() })
    },
  })
}

export function useSubmitContract(): UseMutationResult<boolean, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await submitContractRequest.fetcher({ finalUrl: `/contracts/${id}/submit` })
      return response.data
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.summary() })
    },
  })
}

export function useApproveContract(): UseMutationResult<boolean, Error, { id: string; payload?: ApproveContractRequest }> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await approveContractRequest.fetcher({ finalUrl: `/contracts/${id}/approve`, payload: payload ?? {} })
      return response.data
    },
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.summary() })
    },
  })
}

export function useReturnContract(): UseMutationResult<boolean, Error, { id: string; payload: ReturnContractRequest }> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await returnContractRequest.fetcher({ finalUrl: `/contracts/${id}/return`, payload })
      return response.data
    },
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.summary() })
    },
  })
}

export function useCancelContract(): UseMutationResult<boolean, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await cancelContractRequest.fetcher({ finalUrl: `/contracts/${id}/cancel` })
      return response.data
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.summary() })
      // Freed NOA is now available again
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.availableNoas() })
    },
  })
}

export function useDeleteContract(): UseMutationResult<boolean, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteContractRequest.fetcher({ finalUrl: `/contracts/${id}` })
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.all })
    },
  })
}

export function useGenerateContractDocument(): UseMutationResult<string, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await generateContractDocumentRequest.fetcher({ finalUrl: `/contracts/${id}/generate-document` })
      return response.data
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: contractQueryKeys.detail(id) })
    },
  })
}
