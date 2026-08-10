import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getItemMastersRequest } from '@/components/features/planning/procurement-library/item-master/handlers/getItemMastersRequest'
import { mapProcurementItemsToItemMasters } from '@/components/features/planning/procurement-library/item-master/mappers'

const useItemMastersQuery = createQueryHookFromTemplate(getItemMastersRequest)

interface UseItemMasterReturn {
  itemMasters: ReturnType<typeof mapProcurementItemsToItemMasters>
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useItemMaster(): UseItemMasterReturn {
  const { data, isLoading, isError, error, refetch } = useItemMastersQuery({
    pathParams: {},
    queryParams: {},
  })

  return {
    itemMasters: mapProcurementItemsToItemMasters(data?.data ?? []),
    loading: isLoading,
    error: isError
      ? error instanceof Error
        ? error.message
        : 'Failed to load item master data'
      : null,
    refetch,
  }
}
