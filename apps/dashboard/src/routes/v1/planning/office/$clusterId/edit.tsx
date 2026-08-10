import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/v1/planning/office/$clusterId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/planning/office/$deliveryUnitId/edit"!</div>
}
