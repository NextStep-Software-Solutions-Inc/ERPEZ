import { createFileRoute } from '@tanstack/react-router'
import { ManageNTPListPage } from '@/features/procurement/ntp'

export const Route = createFileRoute('/v2/(procurement)/manage-ntp/')({
  component: ManageNtpRoute,
})

function ManageNtpRoute() {
  return <ManageNTPListPage />
}
