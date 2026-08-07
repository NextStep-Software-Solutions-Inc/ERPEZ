import { createFileRoute } from '@tanstack/react-router'
import { DirectAcquisitionRequestPage } from '@/features/procurement/direct-acquisition/pages/DirectAcquisitionRequestPage'

export const Route = createFileRoute('/v2/(procurement)/direct-acquisition-request/')({
  component: DirectAcquisitionRequestRoute,
})

function DirectAcquisitionRequestRoute() {
  return <DirectAcquisitionRequestPage />
}


