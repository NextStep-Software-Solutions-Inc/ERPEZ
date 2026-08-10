import { createFileRoute } from '@tanstack/react-router'
import ManageSupplierPortalPage from '@/features/procurement/manage-supplier-portal/pages/ManageSupplierPortalPage'

export const Route = createFileRoute('/v2/(procurement)/manage-supplier-portal/')({
  component: ManageSupplierPortalPage,
})
