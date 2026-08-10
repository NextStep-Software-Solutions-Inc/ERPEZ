import { createFileRoute, useParams } from '@tanstack/react-router'
import DeliveryUnitOPCRDetailsPage from '@/pages/planning/opcr/DeliveryUnitOPCRDetailsPage'
import { ROLE } from '@/lib/role'

export const Route = createFileRoute('/v1/planning/opcr/$opcrId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { opcrId } = useParams({ from: Route.id })
  return <DeliveryUnitOPCRDetailsPage opcrId={opcrId} role={ROLE} />
}

