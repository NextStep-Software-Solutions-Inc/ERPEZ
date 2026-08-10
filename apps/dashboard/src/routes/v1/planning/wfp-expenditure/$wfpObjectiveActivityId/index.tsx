import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/v1/planning/wfp-expenditure/$wfpObjectiveActivityId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/planning/wfp-expenditure/$wfpObjectiveActivityId/"!</div>
}
