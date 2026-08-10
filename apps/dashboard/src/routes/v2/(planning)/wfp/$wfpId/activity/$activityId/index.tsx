import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/v2/(planning)/wfp/$wfpId/activity/$activityId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/v2/(planning)/wfp/$wfpId/activity/$activityId/"!</div>
}
