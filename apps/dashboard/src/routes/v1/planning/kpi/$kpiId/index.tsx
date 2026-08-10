import { createFileRoute, useParams } from '@tanstack/react-router'
import KpiDetailsPage from '@/pages/planning/kpi/KpiDetailsPage'

export const Route = createFileRoute('/v1/planning/kpi/$kpiId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { kpiId } = useParams({
    from: Route.id,
  })
  return <KpiDetailsPage kpiId={kpiId} />
}
