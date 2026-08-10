import { createFileRoute } from '@tanstack/react-router'
import ManageSupplierDirectContractingPage from '@/features/procurement/direct-contracting/pages/ManageSupplierDirectContractingPage'

export const Route = createFileRoute('/v2/(procurement)/manage-supplier-direct-contracting/')({
  component: ManageSupplierDirectContractingPage,
})
