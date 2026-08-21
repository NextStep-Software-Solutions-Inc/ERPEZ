import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { catalogItemsAtom } from '../atoms/catalogAtoms'
import { useItemRequests } from './useItemRequestQueries'
import type { ItemRequest, NonCSEItem } from '../types/catalog.types'

export function useUserRequests() {
  const { data: response, isLoading } = useItemRequests({
    pageSize: 100,
    sorts: '-requestDate',
  })

  const requests: ItemRequest[] = useMemo(() => {
    return response?.data || []
  }, [response?.data])

  return {
    requests,
    total: response?.totalRows ?? requests.length,
    isLoading,
  }
}

/**
 * useActiveCatalog Hook
 * Retrieve catalog items for user browsing
 */
export function useActiveCatalog() {
  const items = useAtomValue(catalogItemsAtom)

  // Sort by name (A-Z)
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name))
  }, [items])

  return {
    items: sortedItems,
    total: sortedItems.length,
    isLoading: false,
  }
}

/**
 * useFilteredUserRequests Hook
 * Filter user requests by status
 */
export function useFilteredUserRequests(status?: ItemRequest['status'] | 'all') {
  const { requests } = useUserRequests()

  const filtered = useMemo(() => {
    if (!status || status === 'all') return requests
    return requests.filter((req) => req.status === status)
  }, [requests, status])

  return {
    requests: filtered,
    total: filtered.length,
  }
}

/**
 * useFilteredCatalog Hook
 * Filter catalog items by search term
 */
export function useFilteredCatalog(searchTerm?: string) {
  const { items } = useActiveCatalog()

  const filtered = useMemo(() => {
    if (!searchTerm) return items
    const search = searchTerm.toLowerCase()
    return items.filter(
      (item: NonCSEItem) =>
        item.name.toLowerCase().includes(search) ||
        item.specification?.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search),
    )
  }, [items, searchTerm])

  return {
    items: filtered,
    total: filtered.length,
  }
}

/**
 * useAdminCatalog Hook
 * Retrieve all catalog items for admin management
 */
export function useAdminCatalog() {
  const items = useAtomValue(catalogItemsAtom)

  // Sort by name (A-Z)
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name))
  }, [items])

  return {
    items: sortedItems,
    total: sortedItems.length,
    isLoading: false,
  }
}

/**
 * useFilteredAdminCatalog Hook
 * Filter admin catalog items by search term
 */
export function useFilteredAdminCatalog(searchTerm?: string) {
  const { items } = useAdminCatalog()

  const filtered = useMemo(() => {
    if (!searchTerm) return items
    const search = searchTerm.toLowerCase()
    return items.filter(
      (item: NonCSEItem) =>
        item.name.toLowerCase().includes(search) ||
        item.specification?.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search),
    )
  }, [items, searchTerm])

  return {
    items: filtered,
    total: filtered.length,
  }
}
