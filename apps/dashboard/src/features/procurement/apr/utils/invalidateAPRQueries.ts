import type { QueryClient } from '@tanstack/react-query'

/**
 * Invalidates all APR queries in the TanStack Query cache.
 * Ensures APR list and detail views immediately reflect updates, status changes,
 * deletions, and item modifications without manual browser reloads.
 */
export function invalidateAPRQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey.some(
        (key) =>
          typeof key === 'string' &&
          (key.includes('/api/procurement/apr') ||
            key.includes('getAPRs') ||
            key.includes('getAPR') ||
            key.includes('/aprs') ||
            key.includes('apr')),
      ),
  })
}
