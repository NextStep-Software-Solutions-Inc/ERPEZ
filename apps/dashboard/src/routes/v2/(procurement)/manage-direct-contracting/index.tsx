import { ManageDirectContractingPage } from '@/features/procurement/direct-contracting/pages/ManageDirectContractingPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/v2/(procurement)/manage-direct-contracting/')({
  component: ManageDirectContractingPage,
})
