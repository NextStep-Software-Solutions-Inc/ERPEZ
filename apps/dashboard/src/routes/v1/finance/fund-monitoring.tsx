import { createFileRoute } from '@tanstack/react-router'
import FundMonitoring from '@/pages/finance/FundMonitoring'

export const Route = createFileRoute('/v1/finance/fund-monitoring')({
  component: RouteComponent,
})

function RouteComponent() {
  return <FundMonitoring />
}
