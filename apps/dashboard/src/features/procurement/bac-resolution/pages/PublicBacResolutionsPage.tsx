import { BacResolutionsPage } from './BacResolutionsPage'
import type { BacResolutionRole } from '../types'

interface PublicBacResolutionsPageProps {
  selectedResolutionId?: string
  role?: BacResolutionRole
}

export function PublicBacResolutionsPage({
  selectedResolutionId,
  role = 'procurement-staff',
}: PublicBacResolutionsPageProps) {
  return (
    <BacResolutionsPage
      selectedResolutionId={selectedResolutionId}
      title="BAC Resolutions (Public Bidding)"
      description="Focused workspace for Public Bidding BAC Resolution review, schedule readiness, and downstream execution tracking."
      role={role}
      workspaceScope="public-bidding"
      bacListRoutePath="/v2/bac-resolutions-public-bidding"
    />
  )
}
