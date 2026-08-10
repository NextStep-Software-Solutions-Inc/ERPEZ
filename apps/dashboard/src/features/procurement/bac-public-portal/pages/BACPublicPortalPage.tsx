import { useState } from 'react'
import type { PublicProject } from '../types/portalTypes'
import { BACPublicPortalLanding } from '../components/BACPublicPortalLanding'
import { BACProjectDetail } from '../components/BACProjectDetail'

export function BACPublicPortalPage() {
  const [selectedProject, setSelectedProject] = useState<PublicProject | null>(null)

  if (selectedProject) {
    return (
      <BACProjectDetail
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    )
  }

  return <BACPublicPortalLanding onViewProject={setSelectedProject} />
}
