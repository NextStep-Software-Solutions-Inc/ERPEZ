/**
 * Notice to Proceed (NTP) API Hooks
 * TanStack Query hooks for querying and mutating NTP data.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { APIResponse } from 'erpez-shared-lib'
import { getNoticeToProceedsRequest } from './getNoticeToProceedsRequest'
import { getNoticeToProceedByIdRequest } from './getNoticeToProceedByIdRequest'
import { getNoticeToProceedByContractIdRequest } from './getNoticeToProceedByContractIdRequest'
import { getNoticeToProceedSummaryRequest } from './getNoticeToProceedSummaryRequest'
import { getAvailableContractsForNoticeToProceedRequest } from './getAvailableContractsForNoticeToProceedRequest'
import { createNoticeToProceedRequest } from './createNoticeToProceedRequest'
import { updateNoticeToProceedRequest } from './updateNoticeToProceedRequest'
import { issueNoticeToProceedRequest } from './issueNoticeToProceedRequest'
import { recordNoticeToProceedReceiptRequest } from './recordNoticeToProceedReceiptRequest'
import { cancelNoticeToProceedRequest } from './cancelNoticeToProceedRequest'
import { deleteNoticeToProceedRequest } from './deleteNoticeToProceedRequest'
import { generateNoticeToProceedDocumentRequest } from './generateNoticeToProceedDocumentRequest'
import type {
  NoticeToProceedDetail,
  NoticeToProceedSummary,
  AvailableContractForNoticeToProceed,
  GetNoticeToProceedsParams,
  NoticeToProceedPaginatedData,
  CreateNoticeToProceedRequest,
  UpdateNoticeToProceedRequest,
  IssueNoticeToProceedRequest,
  RecordNoticeToProceedReceiptRequest,
  CancelNoticeToProceedRequest,
} from '../types/ntpTypes'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const ntpQueryKeys = {
  all: ['notice-to-proceed'] as const,
  lists: () => [...ntpQueryKeys.all, 'list'] as const,
  list: (params: GetNoticeToProceedsParams) => [...ntpQueryKeys.lists(), params] as const,
  details: () => [...ntpQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...ntpQueryKeys.details(), id] as const,
  byContract: (contractId: string) => [...ntpQueryKeys.all, 'by-contract', contractId] as const,
  summary: () => [...ntpQueryKeys.all, 'summary'] as const,
  availableContracts: () => [...ntpQueryKeys.all, 'available-contracts'] as const,
}

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function useGetNoticeToProceeds(
  params: GetNoticeToProceedsParams = {}
): UseQueryResult<APIResponse<NoticeToProceedPaginatedData>> {
  return useQuery({
    queryKey: ntpQueryKeys.list(params),
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

      const finalUrl = `/notice-to-proceed?${searchParams.toString()}`
      return getNoticeToProceedsRequest.fetcher({ finalUrl, signal })
    },
    staleTime: 30_000,
  })
}

export function useGetNoticeToProceedById(
  id: string | null | undefined
): UseQueryResult<NoticeToProceedDetail> {
  return useQuery({
    queryKey: ntpQueryKeys.detail(id ?? ''),
    queryFn: async ({ signal }) => {
      const response = await getNoticeToProceedByIdRequest.fetcher({
        finalUrl: `/notice-to-proceed/${id}`,
        signal,
      })
      return response.data
    },
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useGetNoticeToProceedByContractId(
  contractId: string | null | undefined
): UseQueryResult<NoticeToProceedDetail | null> {
  return useQuery({
    queryKey: ntpQueryKeys.byContract(contractId ?? ''),
    queryFn: async ({ signal }) => {
      try {
        const response = await getNoticeToProceedByContractIdRequest.fetcher({
          finalUrl: `/notice-to-proceed/by-contract/${contractId}`,
          signal,
        })
        return response.data
      } catch (err: unknown) {
        if ((err as { response?: { status?: number } })?.response?.status === 404) {
          return null
        }
        throw err
      }
    },
    enabled: !!contractId,
    staleTime: 30_000,
  })
}

export function useGetNoticeToProceedSummary(): UseQueryResult<NoticeToProceedSummary> {
  return useQuery({
    queryKey: ntpQueryKeys.summary(),
    queryFn: async ({ signal }) => {
      const response = await getNoticeToProceedSummaryRequest.fetcher({
        finalUrl: '/notice-to-proceed/summary',
        signal,
      })
      return response.data
    },
    staleTime: 30_000,
  })
}

export function useGetAvailableContractsForNoticeToProceed(
  enabled = true
): UseQueryResult<AvailableContractForNoticeToProceed[]> {
  return useQuery({
    queryKey: ntpQueryKeys.availableContracts(),
    queryFn: async ({ signal }) => {
      const response = await getAvailableContractsForNoticeToProceedRequest.fetcher({
        finalUrl: '/notice-to-proceed/available-contracts',
        signal,
      })
      return response.data
    },
    enabled,
    staleTime: 30_000,
  })
}

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export function useCreateNoticeToProceed(): UseMutationResult<
  APIResponse<string>,
  Error,
  CreateNoticeToProceedRequest
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) =>
      createNoticeToProceedRequest.fetcher({
        finalUrl: '/notice-to-proceed',
        payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

export function useUpdateNoticeToProceed(): UseMutationResult<
  APIResponse<string>,
  Error,
  { id: string; payload: UpdateNoticeToProceedRequest }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) =>
      updateNoticeToProceedRequest.fetcher({
        finalUrl: `/notice-to-proceed/${id}`,
        payload: { id, payload },
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.summary() })
    },
  })
}

export function useIssueNoticeToProceed(): UseMutationResult<
  APIResponse<string>,
  Error,
  { id: string; payload?: IssueNoticeToProceedRequest }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) =>
      issueNoticeToProceedRequest.fetcher({
        finalUrl: `/notice-to-proceed/${id}/issue`,
        payload: { id, payload: payload ?? {} },
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.summary() })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

export function useRecordNoticeToProceedReceipt(): UseMutationResult<
  APIResponse<string>,
  Error,
  { id: string; payload: RecordNoticeToProceedReceiptRequest }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) =>
      recordNoticeToProceedReceiptRequest.fetcher({
        finalUrl: `/notice-to-proceed/${id}/record-receipt`,
        payload: { id, payload },
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.summary() })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

export function useCancelNoticeToProceed(): UseMutationResult<
  APIResponse<string>,
  Error,
  { id: string; payload: CancelNoticeToProceedRequest }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) =>
      cancelNoticeToProceedRequest.fetcher({
        finalUrl: `/notice-to-proceed/${id}/cancel`,
        payload: { id, payload },
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.summary() })
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.availableContracts() })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

export function useDeleteNoticeToProceed(): UseMutationResult<
  APIResponse<string>,
  Error,
  string
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      deleteNoticeToProceedRequest.fetcher({
        finalUrl: `/notice-to-proceed/${id}`,
        payload: { id },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

export function useGenerateNoticeToProceedDocument(): UseMutationResult<
  APIResponse<string>,
  Error,
  string
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      generateNoticeToProceedDocumentRequest.fetcher({
        finalUrl: `/notice-to-proceed/${id}/generate-document`,
      }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: ntpQueryKeys.lists() })
    },
  })
}
