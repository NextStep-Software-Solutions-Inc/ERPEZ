/**
 * useDetailPanelTabs
 * Lazy-loads content for each detail panel tab on demand.
 * Cache is maintained for the current item session (cleared when itemId changes).
 */

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import {
  selectedItemIdAtom,
  selectedItemDataAtom,
} from '../atoms/selectedItemAtom'
import { getPriceHistoryRequest } from '../handlers/getPriceHistoryRequest'
import { getAuditLogRequest } from '../handlers/getAuditLogRequest'
import { getPpmpReferencesRequest } from '../handlers/getPpmpReferencesRequest'

export function usePriceHistoryTab() {
  const itemId = useAtomValue(selectedItemIdAtom)
  const itemData = useAtomValue(selectedItemDataAtom)

  return useQuery({
    queryKey: itemId
      ? getPriceHistoryRequest.key({ itemId })
      : ['catalog-price-history', null],
    queryFn: () =>
      getPriceHistoryRequest.fetcher({
        finalUrl: getPriceHistoryRequest.endpoint,
        itemId: itemId!,
        currentPrice: itemData?.currentPrice ?? 0,
      }),
    enabled: !!itemId,
    staleTime: 1000 * 60 * 10,
  })
}

export function useAuditLogTab() {
  const itemId = useAtomValue(selectedItemIdAtom)

  return useQuery({
    queryKey: itemId
      ? getAuditLogRequest.key({ itemId })
      : ['catalog-audit-log', null],
    queryFn: () =>
      getAuditLogRequest.fetcher({
        finalUrl: getAuditLogRequest.endpoint,
        itemId: itemId!,
      }),
    enabled: !!itemId,
    staleTime: 1000 * 60 * 10,
  })
}

export function useReferencesTab() {
  const itemId = useAtomValue(selectedItemIdAtom)

  return useQuery({
    queryKey: itemId
      ? getPpmpReferencesRequest.key({ itemId })
      : ['catalog-ppmp-refs', null],
    queryFn: () =>
      getPpmpReferencesRequest.fetcher({
        finalUrl: getPpmpReferencesRequest.endpoint,
        itemId: itemId!,
      }),
    enabled: !!itemId,
    staleTime: 1000 * 60 * 10,
  })
}
