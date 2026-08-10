/**
 * @deprecated Use Jotai write atoms from `../atoms/catalogAtoms` instead:
 * `createCatalogItemAtom`, `updateCatalogItemAtom`, `deactivateCatalogItemAtom`.
 * This file will be removed once all consumers are migrated.
 *
 * useCatalogMutations
 * React Query mutation wrappers for all catalog write operations.
 * Each mutation invalidates the catalog-master query key on success.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { createCatalogItemRequest } from '../handlers/createCatalogItemRequest'
import { updateCatalogItemRequest } from '../handlers/updateCatalogItemRequest'
import { deleteCatalogItemRequest } from '../handlers/deleteCatalogItemRequest'
import { toggleCatalogItemStatusRequest } from '../handlers/toggleCatalogItemStatusRequest'
import { duplicateCatalogItemRequest } from '../handlers/duplicateCatalogItemRequest'
import {
  selectedItemDataAtom,
  selectedItemIdAtom,
} from '../atoms/selectedItemAtom'
import type {
  CreateCatalogItemPayload,
  UpdateCatalogItemPayload,
} from '../types'

function useCatalogInvalidate() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['catalog-master'] })
}

export function useCreateCatalogItem() {
  const invalidate = useCatalogInvalidate()
  return useMutation({
    mutationFn: (payload: CreateCatalogItemPayload) =>
      createCatalogItemRequest.fetcher({ payload }),
    onSuccess: () => {
      invalidate()
      toast.success('Item created successfully.')
    },
    onError: () => {
      toast.error('Failed to create item.')
    },
  })
}

export function useUpdateCatalogItem() {
  const invalidate = useCatalogInvalidate()
  const setSelectedData = useSetAtom(selectedItemDataAtom)
  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string
      payload: UpdateCatalogItemPayload
    }) => updateCatalogItemRequest.fetcher({ itemId, payload }),
    onSuccess: (updated) => {
      setSelectedData(updated as any)
      invalidate()
      toast.success('Item updated successfully.')
    },
    onError: () => {
      toast.error('Failed to update item.')
    },
  })
}

export function useDeleteCatalogItem() {
  const invalidate = useCatalogInvalidate()
  const setSelectedId = useSetAtom(selectedItemIdAtom)
  const setSelectedData = useSetAtom(selectedItemDataAtom)
  return useMutation({
    mutationFn: (itemId: string) =>
      deleteCatalogItemRequest.fetcher({ itemId }),
    onSuccess: () => {
      setSelectedId(null)
      setSelectedData(null)
      invalidate()
      toast.success('Item deleted.')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete item.')
    },
  })
}

export function useToggleCatalogItemStatus() {
  const invalidate = useCatalogInvalidate()
  const setSelectedData = useSetAtom(selectedItemDataAtom)
  return useMutation({
    mutationFn: (itemId: string) =>
      toggleCatalogItemStatusRequest.fetcher({ itemId }),
    onSuccess: (updated) => {
      setSelectedData(updated as any)
      invalidate()
      const label =
        (updated as any).status === 'active' ? 'activated' : 'deactivated'
      toast.success(`Item ${label}.`)
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update status.',
      )
    },
  })
}

export function useDuplicateCatalogItem() {
  const invalidate = useCatalogInvalidate()
  return useMutation({
    mutationFn: (itemId: string) =>
      duplicateCatalogItemRequest.fetcher({ itemId }),
    onSuccess: (duplicate) => {
      invalidate()
      toast.success(`Duplicated as "${duplicate.name}".`)
    },
    onError: () => {
      toast.error('Failed to duplicate item.')
    },
  })
}
