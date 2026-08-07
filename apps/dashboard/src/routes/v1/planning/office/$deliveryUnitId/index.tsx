import { createFileRoute, useParams } from '@tanstack/react-router'
import DeliveryUnitDetailsPage from '@/pages/planning/office/DeliveryUnitPage'

export const Route = createFileRoute('/v1/planning/office/$deliveryUnitId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { deliveryUnitId } = useParams({
    from: Route.id,
  })

  return <DeliveryUnitDetailsPage deliveryUnitId={deliveryUnitId} />
}
