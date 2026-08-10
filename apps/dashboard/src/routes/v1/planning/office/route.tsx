import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/v1/planning/office')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
