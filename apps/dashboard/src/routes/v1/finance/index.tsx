import { createFileRoute } from '@tanstack/react-router'
import FinanceOverview from '@/pages/finance/FinanceOverview'

export const Route = createFileRoute('/v1/finance/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <FinanceOverview />
}
