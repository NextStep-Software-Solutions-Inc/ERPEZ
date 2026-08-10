import { createFileRoute } from '@tanstack/react-router'
import KpiDetailsPage from '@/pages/planning/kpi/KpiDetailsPage'

export const Route = createFileRoute(
  '/v1/planning/$deliveryUnitId/opcr/$opcrId/kpi/$functionType/$kpiId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { kpiId } = Route.useParams()
  return (
    <KpiDetailsPage kpiId={kpiId} isDuView opcrActivity isSubKpi />
  )
}
