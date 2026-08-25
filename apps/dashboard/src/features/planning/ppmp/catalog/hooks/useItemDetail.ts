/**
 * useItemDetail
 * Fetches full details for the currently selected catalog item from the backend API.
 * Triggered when selectedItemIdAtom is set.
 */

import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { getCatalogMasterItemRequest } from '../handlers/getCatalogMasterItemRequest'
import {
  selectedItemIdAtom,
  selectedItemDataAtom,
} from '../atoms/selectedItemAtom'

export function useItemDetail() {
  const itemId = useAtomValue(selectedItemIdAtom)
  const setItemData = useSetAtom(selectedItemDataAtom)

  const query = useQuery({
    queryKey: itemId
      ? getCatalogMasterItemRequest.key({
          url: `/non-cse-items/${itemId}`,
          pathParams: { id: itemId },
        })
      : ['/non-cse-items', null],
    queryFn: ({ signal }) =>
      getCatalogMasterItemRequest.fetcher({
        finalUrl: `/non-cse-items/${itemId}`,
        signal,
      }),
    enabled: !!itemId,
    staleTime: 1000 * 60 * 5,
  })

  // Sync fetched data into the Jotai atom for non-hook access
  useEffect(() => {
    if (query.data?.data) {
      setItemData(query.data.data)
    } else if (!itemId) {
      setItemData(null)
    }
  }, [query.data, itemId, setItemData])

  return query
}
