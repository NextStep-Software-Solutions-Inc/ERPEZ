import { createFileRoute } from '@tanstack/react-router'
import KpiDetailsPage from '@/pages/planning/kpi/KpiDetailsPage'

export const Route = createFileRoute('/v1/planning/$deliveryUnitId/opcr/$opcrId/kpi/$kpiId/subKpi/$subKpiId/')({
  component: SubKpiDetailsRoute,
})

function SubKpiDetailsRoute() {
  const { kpiId, subKpiId } = Route.useParams()

  return <KpiDetailsPage kpiId={subKpiId} isSubKpi parentKpiId={kpiId} />
}
