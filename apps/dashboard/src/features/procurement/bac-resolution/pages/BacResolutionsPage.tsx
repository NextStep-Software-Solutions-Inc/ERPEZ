import { BacResolutionWorkspace } from '../components/BacResolutionWorkspace'
import type {
  BacResolutionListRoutePath,
  BacResolutionRole,
  BacResolutionWorkspaceScope,
} from '../types'

interface BacResolutionsPageProps {
  selectedResolutionId?: string
  title?: string
  description?: string
  role?: BacResolutionRole
  workspaceScope?: BacResolutionWorkspaceScope
  bacListRoutePath?: BacResolutionListRoutePath
}

export function BacResolutionsPage({
  selectedResolutionId,
  title = 'BAC Resolutions',
  description = 'Combined inbox for BAC Resolution drafting, printing, submission, and status tracking.',
  role = 'procurement-staff',
  workspaceScope = 'all',
  bacListRoutePath = '/v2/bac-resolutions',
}: BacResolutionsPageProps) {
  return (
    <BacResolutionWorkspace
      role={role}
      title={title}
      description={description}
      initialSelectedResolutionId={selectedResolutionId}
      workspaceScope={workspaceScope}
      bacListRoutePath={bacListRoutePath}
    />
  )
}
