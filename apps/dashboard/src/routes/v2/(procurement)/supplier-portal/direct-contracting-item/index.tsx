import { createFileRoute } from '@tanstack/react-router'
import { DirectContractingItemPage } from '@/features/procurement/supplier-portal/pages/DirectContractingItemPage'

export const Route = createFileRoute('/v2/(procurement)/supplier-portal/direct-contracting-item/')({
  component: SupplierPortalDCItemRoute,
})

function SupplierPortalDCItemRoute() {
  return <DirectContractingItemPage />
}
