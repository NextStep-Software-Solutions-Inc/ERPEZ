import { createFileRoute, useParams } from '@tanstack/react-router'
import KpiAssignmentDetailsPage from '@/pages/planning/kpi/KpiAssignmentDetailsPage'

export const Route = createFileRoute(
  '/v1/planning/kpi-assignment-for-du/$kpiAssignmentForDuId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { kpiAssignmentForDuId } = useParams({
    from: Route.id,
  })
  return <KpiAssignmentDetailsPage deliveryUnitId={kpiAssignmentForDuId} />
}
