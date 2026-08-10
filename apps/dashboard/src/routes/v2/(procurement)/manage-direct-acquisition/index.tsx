import { createFileRoute } from '@tanstack/react-router'
import ManageDirectAcquisitionPage from '@/features/procurement/direct-acquisition/pages/ManageDirectAcquisitionPage'

export const Route = createFileRoute('/v2/(procurement)/manage-direct-acquisition/')({
  component: ManageDirectAcquisitionRoute,
})

function ManageDirectAcquisitionRoute() {
  return <ManageDirectAcquisitionPage />
}
