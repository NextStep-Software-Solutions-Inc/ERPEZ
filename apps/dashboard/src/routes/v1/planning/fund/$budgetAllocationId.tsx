import { createFileRoute } from '@tanstack/react-router'
import type { MetaActions } from '@/types/global'
import BudgetAllocationPage from '@/pages/planning/fund/BudgetAllocationPage'
import BudgetAllocationPageDUDetails from '@/pages/planning/fund/BudgetAllocationPageDUDetails'

export const Route = createFileRoute('/v1/planning/fund/$budgetAllocationId')({
  component: FundDetailPage,
  validateSearch: (search) => ({
    page: (search.page as string) || 'allocations',
  }),
})

const actions: MetaActions = ['write', 'delete', 'read', 'approve']
function FundDetailPage() {
  const { budgetAllocationId } = Route.useParams()
  const { page } = Route.useSearch()

  if (page === 'delivery-unit') {
    return (
      <BudgetAllocationPage
        deliveryUnitId={budgetAllocationId}
        actions={actions}
      />
    )
  }

  // Default to allocations details page
  return (
    <BudgetAllocationPageDUDetails
      budgetAllocationId={budgetAllocationId}
      actions={actions}
    />
  )
}
