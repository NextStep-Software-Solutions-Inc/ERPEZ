import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/v1/planning/kpi/$kpiId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/planning/kpi/$kpiId/edit"!</div>
}
