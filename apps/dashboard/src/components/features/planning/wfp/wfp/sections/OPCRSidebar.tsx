import type { WFPDetails } from '../table/types'
import type { OPCR } from '../../opcr/table/types'
import { OPCRStatusCard } from './OPCRStatusCard'
import { OPCRReadinessCard } from './OPCRReadinessCard'
import { OPCRAuditCard } from './OPCRAuditCard'

interface OPCRSidebarProps {
  wfp: WFPDetails
  opcr: OPCR | undefined
}

export const OPCRSidebar = ({ wfp, opcr }: OPCRSidebarProps) => {
  return (
    <div className="space-y-6">
      <OPCRStatusCard wfp={wfp} />
      <OPCRReadinessCard wfp={wfp} opcr={opcr} />
      <OPCRAuditCard wfp={wfp} />
    </div>
  )
}
