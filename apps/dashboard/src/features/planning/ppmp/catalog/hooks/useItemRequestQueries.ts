import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getItemRequestsRequest } from '../handlers/getItemRequestsRequest'
import { getItemRequestByIdRequest } from '../handlers/getItemRequestByIdRequest'
import {
  createItemRequestApiRequest,
  type CreateItemRequestPayload,
} from '../handlers/createItemRequestApiRequest'
import {
  updateItemRequestApiRequest,
  type UpdateItemRequestPayload,
} from '../handlers/updateItemRequestApiRequest'
import { deleteItemRequestApiRequest } from '../handlers/deleteItemRequestApiRequest'

export function useItemRequests(params?: {
  filters?: string
  sorts?: string
  pageNumber?: number
  pageSize?: number
}) {
  const queryParams: Record<string, string | number | undefined> = {
    filters: params?.filters,
    sorts: params?.sorts,
    pageNumber: params?.pageNumber ?? 1,
    pageSize: params?.pageSize ?? 50,
  }

  return useQuery({
    queryKey: ['/item-requests', queryParams],
    queryFn: ({ signal }) =>
      getItemRequestsRequest.fetcher({
        finalUrl: `/item-requests?${new URLSearchParams(
          Object.entries(queryParams).reduce(
            (acc, [key, val]) => {
              if (val !== undefined && val !== null && val !== '') {
                acc[key] = String(val)
              }
              return acc
            },
            {} as Record<string, string>,
          ),
        ).toString()}`,
        signal,
      }),
  })
}

export function useItemRequestById(id: string | null | undefined) {
  return useQuery({
    queryKey: ['/item-requests', id],
    queryFn: ({ signal }) =>
      getItemRequestByIdRequest.fetcher({
        finalUrl: `/item-requests/${id}`,
        signal,
      }),
    enabled: !!id,
  })
}

export function useCreateItemRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateItemRequestPayload) =>
      createItemRequestApiRequest.fetcher({
        finalUrl: '/item-requests',
        payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/item-requests'] })
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create item request.'
      toast.error(message)
    },
  })
}

export function useUpdateItemRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateItemRequestPayload
    }) =>
      updateItemRequestApiRequest.fetcher({
        finalUrl: `/item-requests/${id}`,
        payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/item-requests'] })
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update item request.'
      toast.error(message)
    },
  })
}

export function useDeleteItemRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      deleteItemRequestApiRequest.fetcher({
        finalUrl: `/item-requests/${id}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/item-requests'] })
      toast.success('Item request deleted successfully.')
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete item request.'
      toast.error(message)
    },
  })
}
