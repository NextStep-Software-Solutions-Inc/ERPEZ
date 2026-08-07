import { createFileRoute } from '@tanstack/react-router'
import KpiDetailsPage from '@/pages/planning/kpi/KpiDetailsPage'
import { ROLE } from '@/lib/role'

export const Route = createFileRoute(
  '/v1/planning/$deliveryUnitId/opcr/$opcrId/kpi/$kpiId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { kpiId } = Route.useParams()
  
  // DU role gets read-only access, other roles get full access
  const isReadOnly = ROLE === 'delivery_unit'

  return (
    <KpiDetailsPage 
      kpiId={kpiId} 
      readOnly={isReadOnly}
      isDuView
    />
  )
}
