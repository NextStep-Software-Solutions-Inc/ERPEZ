/**
 * Purchase Orders API Hooks
 *
 * All query and mutation hooks for the purchase-orders feature.
 * Mutations that modify server data automatically invalidate all purchase-orders
 * and related source document query caches.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import {
  getPurchaseOrdersRequest,
  type GetPurchaseOrdersParams,
  type PurchaseOrdersResponse,
} from './getPurchaseOrdersRequest'
import { getPurchaseOrderByIdRequest } from './getPurchaseOrderByIdRequest'
import { getPurchaseOrderItemsRequest } from './getPurchaseOrderItemsRequest'
import { createPurchaseOrderRequest } from './createPurchaseOrderRequest'
import { updatePurchaseOrderRequest } from './updatePurchaseOrderRequest'
import { deletePurchaseOrderRequest } from './deletePurchaseOrderRequest'
import { submitPurchaseOrderRequest } from './submitPurchaseOrderRequest'
import { approvePurchaseOrderRequest } from './approvePurchaseOrderRequest'
import { returnPurchaseOrderRequest } from './returnPurchaseOrderRequest'
import { getAvailableAobsRequest } from './getAvailableAobsRequest'
import { getAvailableNoasRequest } from './getAvailableNoasRequest'
import { getAvailableDaResolutionsRequest } from './getAvailableDaResolutionsRequest'
import type {
  AvailableAob,
  AvailableDaResolution,
  AvailableNoa,
  CreatePurchaseOrderRequest,
  PurchaseOrder,
  PurchaseOrderLineItem,
  ReturnPurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
} from '../types'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const purchaseOrderQueryKeys = {
  all: ['purchase-orders'] as const,
  lists: () => [...purchaseOrderQueryKeys.all, 'list'] as const,
  list: (params: GetPurchaseOrdersParams) =>
    [...purchaseOrderQueryKeys.lists(), params] as const,
  details: () => [...purchaseOrderQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...purchaseOrderQueryKeys.details(), id] as const,
  items: (id: string) => [...purchaseOrderQueryKeys.all, 'items', id] as const,
}

export const sourceDocumentsQueryKeys = {
  all: ['source-documents'] as const,
  availableAobs: () => [...sourceDocumentsQueryKeys.all, 'available-aobs'] as const,
  availableNoas: () => [...sourceDocumentsQueryKeys.all, 'available-noas'] as const,
  availableDas: () => [...sourceDocumentsQueryKeys.all, 'available-das'] as const,
}

// ─── Query Hooks (Template-based) ─────────────────────────────────────────────

export const usePurchaseOrders = createQueryHookFromTemplate(getPurchaseOrdersRequest)
export const usePurchaseOrder = createQueryHookFromTemplate(getPurchaseOrderByIdRequest)
export const usePurchaseOrderItemsFromTemplate = createQueryHookFromTemplate(getPurchaseOrderItemsRequest)
export const useAvailableAobsFromTemplate = createQueryHookFromTemplate(getAvailableAobsRequest)
export const useAvailableNoasFromTemplate = createQueryHookFromTemplate(getAvailableNoasRequest)
export const useAvailableDasFromTemplate = createQueryHookFromTemplate(getAvailableDaResolutionsRequest)

// ─── Backward-Compatible Query Hooks ──────────────────────────────────────────

export function useGetPurchaseOrders(
  params: GetPurchaseOrdersParams = {}
): UseQueryResult<PurchaseOrdersResponse> {
  return useQuery({
    queryKey: purchaseOrderQueryKeys.list(params),
    queryFn: async ({ signal }) => {
      const pageNum = params.pageNumber ?? params.PageNumber ?? 1
      const pSize = params.pageSize ?? params.PageSize ?? 10
      const filters = params.filters ?? params.Filters
      const sorts = params.sorts ?? params.Sorts
      const search = params.search ?? params.Search

      const searchParams = new URLSearchParams()
      searchParams.set('PageNumber', String(pageNum))
      searchParams.set('PageSize', String(pSize))
      if (filters) searchParams.set('Filters', filters)
      if (sorts) searchParams.set('Sorts', sorts)
      if (search) searchParams.set('Search', search)

      const finalUrl = `/purchase-orders?${searchParams.toString()}`
      return getPurchaseOrdersRequest.fetcher({ finalUrl, signal } as any)
    },
    staleTime: 30_000,
  })
}

export function useGetPurchaseOrderById(
  id: string | null | undefined
): UseQueryResult<PurchaseOrder> {
  return useQuery({
    queryKey: purchaseOrderQueryKeys.detail(id ?? ''),
    queryFn: async ({ signal }) => {
      const finalUrl = `/purchase-orders/${id}`
      const response = await getPurchaseOrderByIdRequest.fetcher({ finalUrl, signal } as any)
      return response.data
    },
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useGetPurchaseOrderItems(
  id: string | null | undefined
): UseQueryResult<PurchaseOrderLineItem[]> {
  return useQuery({
    queryKey: purchaseOrderQueryKeys.items(id ?? ''),
    queryFn: async ({ signal }) => {
      const finalUrl = `/purchase-orders/${id}/items?pageSize=100`
      const response = await getPurchaseOrderItemsRequest.fetcher({ finalUrl, signal } as any)
      return response.data ?? []
    },
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useGetAobsAvailableForPO(enabled = true): UseQueryResult<AvailableAob[]> {
  return useQuery({
    queryKey: sourceDocumentsQueryKeys.availableAobs(),
    queryFn: async ({ signal }) => {
      return getAvailableAobsRequest.fetcher({ finalUrl: '/aobs/available-for-po', signal } as any)
    },
    enabled,
    staleTime: 30_000,
  })
}

export function useGetNoasAvailableForPO(enabled = true): UseQueryResult<AvailableNoa[]> {
  return useQuery({
    queryKey: sourceDocumentsQueryKeys.availableNoas(),
    queryFn: async ({ signal }) => {
      return getAvailableNoasRequest.fetcher({ finalUrl: '/notice-of-awards/available-for-po', signal } as any)
    },
    enabled,
    staleTime: 30_000,
  })
}

export function useGetDaResolutionsAvailableForPO(enabled = true): UseQueryResult<AvailableDaResolution[]> {
  return useQuery({
    queryKey: sourceDocumentsQueryKeys.availableDas(),
    queryFn: async ({ signal }) => {
      return getAvailableDaResolutionsRequest.fetcher({ finalUrl: '/direct-acquisitions/available-for-po', signal } as any)
    },
    enabled,
    staleTime: 30_000,
  })
}

// ─── Mutation Hooks with Auto-Invalidation ───────────────────────────────────

export function useCreatePurchaseOrder(): UseMutationResult<string, Error, CreatePurchaseOrderRequest> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreatePurchaseOrderRequest) => {
      const response = await createPurchaseOrderRequest.fetcher({
        finalUrl: '/purchase-orders',
        payload,
      } as any)
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: sourceDocumentsQueryKeys.all })
    },
  })
}

export function useUpdatePurchaseOrder(
  id?: string
): UseMutationResult<boolean, Error, UpdatePurchaseOrderRequest> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdatePurchaseOrderRequest) => {
      const targetId = id ?? payload.id
      if (!targetId) throw new Error('Purchase Order ID is required for update.')
      const response = await updatePurchaseOrderRequest.fetcher({
        finalUrl: `/purchase-orders/${targetId}`,
        payload,
      } as any)
      return response.data
    },
    onSuccess: (_, variables) => {
      const targetId = id ?? variables.id
      if (targetId) {
        void queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.detail(targetId) })
      }
      void queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.lists() })
    },
  })
}

export function useDeletePurchaseOrder(): UseMutationResult<boolean, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deletePurchaseOrderRequest.fetcher({
        finalUrl: `/purchase-orders/${id}`,
      } as any)
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: sourceDocumentsQueryKeys.all })
    },
  })
}

export function useSubmitPurchaseOrderForApproval(): UseMutationResult<boolean, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await submitPurchaseOrderRequest.fetcher({
        finalUrl: `/purchase-orders/${id}/submit`,
      } as any)
      return response.data
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.lists() })
    },
  })
}

export function useApprovePurchaseOrder(): UseMutationResult<boolean, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await approvePurchaseOrderRequest.fetcher({
        finalUrl: `/purchase-orders/${id}/approve`,
      } as any)
      return response.data
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.lists() })
    },
  })
}

export function useReturnPurchaseOrder(): UseMutationResult<
  boolean,
  Error,
  { id: string; request: ReturnPurchaseOrderRequest }
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, request }) => {
      const response = await returnPurchaseOrderRequest.fetcher({
        finalUrl: `/purchase-orders/${id}/return`,
        payload: request,
      } as any)
      return response.data
    },
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.lists() })
    },
  })
}
