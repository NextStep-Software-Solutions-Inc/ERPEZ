import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/services/api'
import type { NONCSEItem } from '@/features/planning/non-cse-item/types/non-cse.type'
import type { PaginationResponse, APIResponse } from 'erpez-shared-lib'

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

export interface CreateNonCSEItemPayload {
  name: string
  description?: string
  uomId: string
  itemCategoryId?: string
  productCode?: string
  currentPrice: number
  remarks?: string
  itemRequestId?: string
}

export interface UpdateNonCSEItemPayload {
  name?: string
  description?: string
  uomId?: string
  itemCategoryId?: string
  productCode?: string
  currentPrice?: number
  remarks?: string
}

export interface NonCSEItemQueryParams {
  filters?: string
  sorts?: string
  page?: number
  pageSize?: number
}

export function useNonCSEItems(params?: NonCSEItemQueryParams) {
  const queryParams = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
    filters: params?.filters,
    sorts: params?.sorts,
  }

  const queryString = new URLSearchParams(
    Object.entries(queryParams).reduce(
      (acc, [key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          acc[key] = String(val)
        }
        return acc
      },
      {} as Record<string, string>,
    ),
  ).toString()

  const url = queryString ? `/non-cse-items?${queryString}` : '/non-cse-items'

  return useQuery({
    queryKey: ['/non-cse-items', queryParams],
    queryFn: async ({ signal }) => {
      const response = await api.get<PaginationResponse<NONCSEItem>>(url, { signal })
      return response.data
    },
  })
}

export function useNonCSEItemById(id: string | null | undefined) {
  return useQuery({
    queryKey: ['/non-cse-items', id],
    queryFn: async ({ signal }) => {
      const response = await api.get<APIResponse<NONCSEItem>>(`/non-cse-items/${id}`, { signal })
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateNonCSEItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateNonCSEItemPayload) => {
      const response = await api.post<APIResponse<string>>('/non-cse-items', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/non-cse-items'] })
      toast.success('Non-CSE catalog item created successfully.')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to create catalog item.'))
    },
  })
}

export function useUpdateNonCSEItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateNonCSEItemPayload }) => {
      const response = await api.put<APIResponse<string>>(`/non-cse-items/${id}`, payload)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/non-cse-items'] })
      queryClient.invalidateQueries({ queryKey: ['/non-cse-items', variables.id] })
      toast.success('Non-CSE catalog item updated successfully.')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update catalog item.'))
    },
  })
}

export function useDeleteNonCSEItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/non-cse-items/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/non-cse-items'] })
      toast.success('Catalog item removed successfully.')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to delete catalog item.'))
    },
  })
}
