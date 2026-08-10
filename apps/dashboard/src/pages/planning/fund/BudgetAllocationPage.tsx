import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useState } from 'react'
import type { MetaActions } from '@/types/global'
import { PageContainer } from '@/components/PageContainer'
import { getDUAllocationsRequest } from '@/components/features/planning/budget-allocation/handlers/getDUAllocationsRequest'
import { getDeliveryUnitRequest } from '@/components/features/planning/delivery-unit/handlers/getDeliveryUnitRequest'
import { TemplateTable } from '@/components/TemplateTable'
import { ColumnAllocations } from '@/components/features/planning/budget-allocation/table/ColumnAllocations'
import { Toolbar } from '@/components/features/planning/budget-allocation/table'
import { toTitleCase } from '@/utils/formatters'
import CreateDUAllocationDialog from '@/components/features/planning/budget-allocation/dialog/CreateDUAllocationDialog'

const useBudgetAllocations = createQueryHookFromTemplate(getDUAllocationsRequest)
const useDeliveryUnit = createQueryHookFromTemplate(getDeliveryUnitRequest)

const BudgetAllocationPage = ({
    deliveryUnitId,
}: {
    deliveryUnitId: string
}) => {
  const actions: MetaActions = ['read' ,'write', 'delete']
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { data: deliveryUnitData } = useDeliveryUnit({ pathParams: { id: deliveryUnitId || '' }, queryParams: {} })

  const { data: budgetAllocationsData, isLoading } = useBudgetAllocations({
    pathParams: {},
    queryParams: { filters: `deliveryUnitId==${deliveryUnitId}`},
  })

  const budgetAllocations = budgetAllocationsData?.data

  return (
    <PageContainer
      title={toTitleCase(deliveryUnitData?.data.office?.name) ?? 'Budget Allocations'}
      backTo={{ to: '/planning/fund', search: { tab: 'budget-allocation' } }} backLabel="Back to Budget Allocations"
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64">Loading...</div>
      ) : !budgetAllocations ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Fund source not found.</p>
        </div>
      ) : (
        <TemplateTable
          columns={ColumnAllocations}
          data={budgetAllocations}
          actions={actions}
          readonly={false}
          forTab
          fixedPageSize={11}
          toolbar={(table) => <Toolbar table={table} deliveryUnitId={deliveryUnitId} showColumnVisibility onAllocateFund={() => setIsCreateDialogOpen(true)} />}
        />
      )}
      <CreateDUAllocationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        deliveryUnitId={deliveryUnitId}
      />
    </PageContainer>
  )
}
export default BudgetAllocationPage