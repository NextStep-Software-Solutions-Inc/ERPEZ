import {
  ModeOfDeliveryCard,
  InsufficientFundsCard,
  AttachmentRequirementsCard,
  ProcurementTimelineCard,
  RemarksCard,
} from './APRTermsDisplay'
import type { APRTerms } from '@/features/procurement/apr/types'

interface APRTermsConditionsSectionProps {
  terms: APRTerms | undefined
}

/**
 * APR Terms & Conditions Display
 * Displays all terms and conditions configured during APR creation
 * including delivery method, funding handling, attachments, timeline, and remarks
 */
export function APRTermsConditionsSection({
  terms,
}: APRTermsConditionsSectionProps) {
  if (!terms)
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No terms and conditions specified</p>
      </div>
    )

  return (
    <div className="space-y-4">
      {/* Primary Terms - 2 column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ModeOfDeliveryCard mode={terms.modeOfDelivery} />
        <InsufficientFundsCard action={terms.insufficientFundsAction} />
      </div>

      {/* Attachment Requirements */}
      <AttachmentRequirementsCard attachments={terms.attachments} />

      {/* Procurement Timeline */}
      <ProcurementTimelineCard milestones={terms.milestones} />

      {/* Remarks */}
      <RemarksCard remarks={terms.remarks} />
    </div>
  )
}
