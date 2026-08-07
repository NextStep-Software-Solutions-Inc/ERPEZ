import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/v2/(planning)/wfp/$wfpId/activity/$activityId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
