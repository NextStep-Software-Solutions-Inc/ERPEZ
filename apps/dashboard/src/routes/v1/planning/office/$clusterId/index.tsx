import { createFileRoute, useParams } from '@tanstack/react-router'
import OrganizationalClusterDetailsPage from '@/pages/planning/office/OrganizationalClusterDetailsPage'

export const Route = createFileRoute('/v1/planning/office/$clusterId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { clusterId } = useParams({
    from: Route.id,
  })

  return <OrganizationalClusterDetailsPage clusterId={clusterId} />
}
