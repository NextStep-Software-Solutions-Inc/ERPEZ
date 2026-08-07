import { createFileRoute } from '@tanstack/react-router'

import OverviewPage from '@/pages/planning/OverviewPage'

export const Route = createFileRoute('/v1/planning/root')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Overview />
}

export default function Overview() {
  return <OverviewPage />
}
