import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/v1/finance/budget-allocation')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BudgetAllocation />
}

function BudgetAllocation() {
  return <div>BudgetAllocation</div>
}

export default BudgetAllocation
