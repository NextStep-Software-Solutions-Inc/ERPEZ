import { createFileRoute, useParams } from '@tanstack/react-router'
import OfficeDetailsPage from '@/pages/planning/office/OfficeDetailsPage'

export const Route = createFileRoute('/v1/planning/office/$officeId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { officeId } = useParams({
    from: Route.id,
  })

  return <OfficeDetailsPage officeId={officeId} />
}
