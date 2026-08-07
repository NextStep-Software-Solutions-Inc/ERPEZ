import type { WFPDetails } from '../table/types'
import type { OPCR } from '../../opcr/table/types'
import { OPCROverviewCard } from './OPCROverviewCard'
import { FundSourceCard } from './FundSourceCard'
import { WorkflowStepsCard } from './WorkflowStepsCard'
import { DurationObjectiveCards } from './DurationObjectiveCards'
import { SubmissionActionsCard } from './SubmissionActionsCard'

interface FundSource {
  name: string
  code: string
  isActive: boolean
  fiscalYear?: {
    year: string
    startDate: string
    endDate: string
  }
}

interface OPCRMainContentProps {
  wfp: WFPDetails
  opcr: OPCR | undefined
  fundSource: FundSource | undefined
  wfpId: string
  onPrint: () => void
  onMarkReady: () => void
}

export const OPCRMainContent = ({
  wfp,
  opcr,
  fundSource,
  wfpId,
  onPrint,
  onMarkReady,
}: OPCRMainContentProps) => {
  return (
    <div className="space-y-6">
      <OPCROverviewCard opcr={opcr} />
      <FundSourceCard fundSource={fundSource} />
      <WorkflowStepsCard opcr={opcr} />
      <DurationObjectiveCards wfp={wfp} />
      <SubmissionActionsCard
        wfp={wfp}
        wfpId={wfpId}
        onPrint={onPrint}
        onMarkReady={onMarkReady}
      />
    </div>
  )
}
