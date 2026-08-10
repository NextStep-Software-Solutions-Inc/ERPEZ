import { createFileRoute } from '@tanstack/react-router'
import { ManageContractsPage } from '@/features/procurement/contract'

export const Route = createFileRoute('/v2/(procurement)/manage-contracts/')({
  component: ManageContractsRoute,
})

function ManageContractsRoute() {
  return <ManageContractsPage />
}
