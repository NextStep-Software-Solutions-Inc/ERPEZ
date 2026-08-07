import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { useLIBAmendments } from '@/features/planning/line-item-budgeting/realignment/hooks/useLIBAmendments'
import { VersionHistoryPanel } from '@/features/planning/line-item-budgeting/realignment/components'

interface LIBHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  libId: string | null
}

export function LIBHistoryDialog({ open, onOpenChange, libId }: LIBHistoryDialogProps) {
  // Fetch amendments to look for any active realignment draft (status Draft, Returned, or Submitted)
  const { data: amendmentsData } = useLIBAmendments({
    pathParams: {},
    queryParams: {
      pageSize: 1000,
      pageNumber: 1,
      filters: `lineItemBudgetId==${libId || ''}`,
    },
    enabled: !!libId && open,
  })

  const amendmentsList = amendmentsData?.data || []
  const activeAmendment = amendmentsList.find(
    (a) =>
      a.lineItemBudgetId === libId &&
      ['Draft', 'Returned', 'Submitted'].includes(a.status)
  )
  const proposedLibId = activeAmendment?.proposedLineItemBudgetId || null
  const proposedTotalAmount = activeAmendment?.proposedLineItemBudget?.totalAmount || undefined

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Realignment Version Timeline"
      description="Explore draft revisions, audit approvals, and run side-by-side split comparisons."
      size="xl"
      className="h-[85vh]"
      showCloseButton
    >
      <VersionHistoryPanel
        libId={libId}
        proposedLibId={proposedLibId}
        proposedTotalAmount={proposedTotalAmount}
        onClose={() => onOpenChange(false)}
        hideHeader={true}
      />
    </ResponsiveDialogDashtail>
  )
}
