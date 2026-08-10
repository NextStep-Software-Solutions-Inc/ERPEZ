import { createFileRoute, useParams } from '@tanstack/react-router' 
import DeliveryUnitOPCRDetailsPage from '@/pages/planning/opcr/DeliveryUnitOPCRDetailsPage'

export const Route = createFileRoute('/v1/planning/$deliveryUnitId/opcr/$opcrId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { deliveryUnitId, opcrId } = useParams({
    from: Route.id,
  })

  return <DeliveryUnitOPCRDetailsPage opcrId={opcrId} deliveryUnitId={deliveryUnitId} />
}
