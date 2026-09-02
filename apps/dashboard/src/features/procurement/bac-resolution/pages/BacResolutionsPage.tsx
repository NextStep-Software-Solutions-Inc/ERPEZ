import { BacResolutionWorkspace } from '../components/BacResolutionWorkspace'
import type {
  BacResolutionListRoutePath,
  BacResolutionRole,
  BacResolutionWorkspaceScope,
} from '../types'

interface BacResolutionsPageProps {
  selectedId?: string
  title?: string
  description?: string
  role?: BacResolutionRole
  workspaceScope?: BacResolutionWorkspaceScope
  bacListRoutePath?: BacResolutionListRoutePath
}

export function BacResolutionsPage({
  selectedId,
  title = 'BAC Resolutions',
  description = 'Combined inbox for BAC Resolution drafting, printing, submission, and status tracking.',
  role = 'all',
  workspaceScope = 'all',
  bacListRoutePath = '/v2/bac-resolutions',
}: BacResolutionsPageProps) {
  return (
    <BacResolutionWorkspace
      role={role}
      title={title}
      description={description}
      selectedId={selectedId}
      workspaceScope={workspaceScope}
      bacListRoutePath={bacListRoutePath}
    />
  )
}
