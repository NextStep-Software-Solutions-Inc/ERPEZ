import { createFileRoute } from '@tanstack/react-router'
import { BACPublicPortalPage } from '@/features/procurement/bac-public-portal/pages/BACPublicPortalPage'

export const Route = createFileRoute('/v2/bac/')({
  component: BACPublicPortalRoute,
})

function BACPublicPortalRoute() {
  return <BACPublicPortalPage />
}
