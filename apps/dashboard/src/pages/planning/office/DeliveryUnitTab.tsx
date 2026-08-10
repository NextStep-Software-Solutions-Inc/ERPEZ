import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import type { MetaActions } from '@/types/global'
import { TemplateTable } from '@/components/TemplateTable'
import { getDeliveryUnitsRequest } from '@/components/features/planning/delivery-unit/handlers/getDeliveryUnitsRequest'
import {
  Column,
  Toolbar,
} from '@/components/features/planning/delivery-unit/table'

const useDeliveryUnits = createQueryHookFromTemplate(getDeliveryUnitsRequest)

function DeliveryUnitTab({
  deliveryUnitSearch,
  navigate,
  search,
  parentId = null,
}: {
  deliveryUnitSearch?: string
  navigate?: any
  search?: any
  parentId?: string | null
}) {
  const { data: deliveryUnits } = useDeliveryUnits({
    pathParams: {},
    queryParams: { 
      filters: parentId === null 
        ? "parentId == null" 
        : `parentId == "${parentId}"` 
    },
  })

  const actions: MetaActions = ['read', 'delete']

  return (
    <TemplateTable
      columns={Column}
      data={deliveryUnits?.data || []}
      actions={actions}
      readonly={false}
      toolbar={(table) => (
        <Toolbar
          table={table}
          deliveryUnitSearch={deliveryUnitSearch}
          navigate={navigate}
          search={search}
        />
      )}
      forTab
      fixedPageSize={11}
      meta={{ deliveryUnits: deliveryUnits?.data || [] }}
    />
  )
}

export default DeliveryUnitTab
