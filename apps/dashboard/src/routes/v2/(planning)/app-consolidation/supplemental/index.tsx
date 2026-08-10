import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/v2/(planning)/app-consolidation/supplemental/')({
  component: SupplementalLayout,
})

function SupplementalLayout() {
  return <Outlet />
}
