import { createFileRoute } from '@tanstack/react-router'
import { ManageAPRsAdminPage } from '@/pages/procurement/apr/ManageAPRsAdminPage'

export const Route = createFileRoute('/v2/(procurement)/manage-aprs/')({
  component: ManageAprsRoute,
})

function ManageAprsRoute() {
  return <ManageAPRsAdminPage />
}
