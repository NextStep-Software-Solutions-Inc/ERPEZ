import { createFileRoute } from '@tanstack/react-router'
import SettingsPage from '@/pages/planning/settings/SettingsPage'

export const Route = createFileRoute('/v1/planning/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsPage />
}
