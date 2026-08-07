import {
  SubmitForReviewButton,
  ReturnForRevisionsButton,
  ApproveAPRButton,
  ViewSignedDocumentButton,
  APRStatusInfo,
} from './APRActionsDisplay'
import type { APRMaster } from '@/features/procurement/apr/types'

interface APRActionsSectionProps {
  apr: APRMaster
  canSubmitForReview: boolean
  canReturn: boolean
  canApprove: boolean
  isSubmitting: boolean
  onSubmit: () => void
  onReturn: () => void
  onApprove: () => void
}

/**
 * APR Actions Section
 * Displays all available actions based on APR status
 * Includes: Submit, Return, Approve, View Document, and Status Info
 */
export function APRActionsSection({
  apr,
  canSubmitForReview,
  canReturn,
  canApprove,
  isSubmitting,
  onSubmit,
  onReturn,
  onApprove,
}: APRActionsSectionProps) {
  const hasActions =
    canSubmitForReview || canReturn || canApprove || apr.signedDocumentUrl

  if (!hasActions) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No actions available for this APR at this time
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Primary Actions - Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {canSubmitForReview && (
          <SubmitForReviewButton
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {canReturn && (
          <ReturnForRevisionsButton
            onReturn={onReturn}
            isSubmitting={isSubmitting}
          />
        )}

        {canApprove && (
          <ApproveAPRButton
            onApprove={onApprove}
            isSubmitting={isSubmitting}
          />
        )}

        {apr.signedDocumentUrl && (
          <ViewSignedDocumentButton documentUrl={apr.signedDocumentUrl} />
        )}
      </div>

      {/* Status Information */}
      <APRStatusInfo status={apr.status} apr={apr} />
    </div>
  )
}
