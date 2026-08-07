import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/v1/planning/$deliveryUnitId/wfp/$wfpId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello WFP "/planning/wfp/$wfpId/"!</div>
}
