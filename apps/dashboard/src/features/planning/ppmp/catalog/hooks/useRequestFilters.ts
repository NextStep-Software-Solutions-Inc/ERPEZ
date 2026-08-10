/**
 * useUserRequests Hook
 * Filter and retrieve current user's item requests
 */

import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import {
  itemRequestsAtom,
  currentUserAtom,
  catalogItemsAtom,
} from '../atoms/catalogAtoms'
import type { ItemRequest } from '../types/catalog.types'

export function useUserRequests() {
  const allRequests = useAtomValue(itemRequestsAtom)
  const currentUser = useAtomValue(currentUserAtom)

  const userRequests = useMemo(() => {
    return allRequests.filter((req) => req.createdBy === currentUser.email)
  }, [allRequests, currentUser.email])

  // Sort by request date (newest first)
  const sortedRequests = useMemo(() => {
    return [...userRequests].sort(
      (a, b) =>
        new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime(),
    )
  }, [userRequests])

  return {
    requests: sortedRequests,
    total: sortedRequests.length,
    isLoading: false,
  }
}

/**
 * useActiveCatalog Hook
 * Retrieve all active catalog items for user browsing
 * Filters by both status='Active' AND isActive=true
 */

export function useActiveCatalog() {
  const items = useAtomValue(catalogItemsAtom)

  const activeItems = useMemo(() => {
    return items.filter(
      (item) => item.status === 'Active' && item.isActive === true,
    )
  }, [items])

  // Sort by name (A-Z)
  const sortedItems = useMemo(() => {
    return [...activeItems].sort((a, b) => a.name.localeCompare(b.name))
  }, [activeItems])

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

export function useFilteredUserRequests(status?: ItemRequest['status']) {
  const { requests } = useUserRequests()

  const filtered = useMemo(() => {
    if (!status || status === ('all' as any)) return requests
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
      (item: any) =>
        item.name.toLowerCase().includes(search) ||
        item.specification.toLowerCase().includes(search) ||
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
 * Retrieve all catalog items for admin (including inactive)
 * Shows both Active and Inactive items
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
 * Filter admin catalog items by search term (shows all, active and inactive)
 */

export function useFilteredAdminCatalog(searchTerm?: string) {
  const { items } = useAdminCatalog()

  const filtered = useMemo(() => {
    if (!searchTerm) return items
    const search = searchTerm.toLowerCase()
    return items.filter(
      (item: any) =>
        item.name.toLowerCase().includes(search) ||
        item.specification.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search),
    )
  }, [items, searchTerm])

  return {
    items: filtered,
    total: filtered.length,
  }
}
