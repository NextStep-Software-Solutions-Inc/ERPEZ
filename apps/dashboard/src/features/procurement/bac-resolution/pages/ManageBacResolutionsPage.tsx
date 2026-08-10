import { BacResolutionWorkspace } from '../components/BacResolutionWorkspace'

export function ManageBacResolutionsPage() {
  return (
    <BacResolutionWorkspace
      role="bac-chairperson"
      title="Manage BAC Resolutions"
      description="Review queue for BAC Resolution approval, return, and signed document upload."
      defaultFilter="for-approval"
    />
  )
}
