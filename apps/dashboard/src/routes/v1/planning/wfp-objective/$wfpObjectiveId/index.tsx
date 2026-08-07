import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/v1/planning/wfp-objective/$wfpObjectiveId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello WFP Objective "/planning/wfp-objective/$wfpObjectiveId/"!</div>
}
