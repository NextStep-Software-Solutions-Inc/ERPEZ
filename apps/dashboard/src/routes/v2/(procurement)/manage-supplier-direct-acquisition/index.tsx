import { createFileRoute } from '@tanstack/react-router'
import ManageSupplierDirectAcquisitionPage from '@/features/procurement/direct-acquisition/pages/ManageSupplierDirectAcquisitionPage'

export const Route = createFileRoute('/v2/(procurement)/manage-supplier-direct-acquisition/')({
  component: ManageSupplierDirectAcquisitionPage,
})
