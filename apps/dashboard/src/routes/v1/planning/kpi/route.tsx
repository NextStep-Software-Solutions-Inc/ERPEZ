import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/v1/planning/kpi')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
