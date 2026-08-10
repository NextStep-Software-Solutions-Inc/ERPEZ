import { AlertTriangle, FileText } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BacResolutionSummaryCard } from './index'
import { ConsolidatedPrTable } from './index'
import { BacResolutionActivityLog } from './index'
import type {
  BacResolution,
  BacResolutionListRoutePath,
  BacResolutionRole,
  BacResolutionWorkspaceScope,
} from '../types'
import {
  hasExactlyOneLinkedConsolidatedPr,
  isBacResolutionPublicBiddingEligible,
} from '../utils/bacResolutionWorkflow'

interface DetailsPanelProps {
  selectedResolution: BacResolution | null
  role: BacResolutionRole
  workspaceScope?: BacResolutionWorkspaceScope
  bacListRoutePath?: BacResolutionListRoutePath
  handleViewConsolidatedPrDetails: (id: string) => void
  isLoading?: boolean
  onLinkPrs?: () => void
  onPrint?: () => void | Promise<void>
  onSubmit?: () => void | Promise<void>
}

export function DetailsPanel({
  selectedResolution,
  role,
  workspaceScope = 'all',
  bacListRoutePath = '/v2/bac-resolutions',
  handleViewConsolidatedPrDetails,
  isLoading = false,
  onLinkPrs,
  onPrint,
  onSubmit,
}: DetailsPanelProps) {
  if (!selectedResolution) {
    return (
      <Card className="border border-dashed border-default-200 bg-default-50 shadow-sm">
        <CardContent className="flex min-h-80 items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-3">
            <p className="text-lg font-semibold">No BAC Resolution selected</p>
            <p className="text-sm text-muted-foreground">
              Select a record from the inbox to view the linked Consolidated PRs
              and workflow history.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const missingSingleOwnedPr =
    !hasExactlyOneLinkedConsolidatedPr(selectedResolution)
  const lacksPublicBiddingEligibility =
    selectedResolution.status === 'approved' &&
    !missingSingleOwnedPr &&
    !isBacResolutionPublicBiddingEligible(selectedResolution)

  return (
    <>
      <BacResolutionSummaryCard
        resolution={selectedResolution}
        role={role}
        workspaceScope={workspaceScope}
        bacListRoutePath={bacListRoutePath}
        isLoading={isLoading}
        onLinkPrs={onLinkPrs}
        onPrint={onPrint}
        onSubmit={onSubmit}
      />

      <Card className="border border-default-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Linked Consolidated PRs</CardTitle>
        </CardHeader>
        <CardContent>
          <ConsolidatedPrTable
            items={selectedResolution.linkedConsolidatedPrs}
            emptyMessage="No Consolidated PRs linked yet."
            onViewDetails={(item) => handleViewConsolidatedPrDetails(item.id)}
          />
        </CardContent>
      </Card>

      {missingSingleOwnedPr ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Link exactly one Consolidated PR to keep this BAC Resolution in the
            Public Bidding scheduling flow.
          </AlertDescription>
        </Alert>
      ) : null}

      {lacksPublicBiddingEligibility ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This owning Consolidated PR is not tagged for Public Bidding or Limited Bidding, so
            TC-01 schedule generation will remain unavailable.
          </AlertDescription>
        </Alert>
      ) : null}

      {selectedResolution.status === 'returned' &&
        selectedResolution.returnReason && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {selectedResolution.returnReason}
            </AlertDescription>
          </Alert>
        )}

      {role === 'bac-chairperson' &&
        selectedResolution.status === 'for-approval' && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Approval requires the physically signed BAC Resolution PDF upload.
            </AlertDescription>
          </Alert>
        )}

      <Card className="border border-default-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Resolution metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3">
            <div className="grid gap-1">
              <p className="text-sm font-semibold">Resolved date</p>
              <p className="text-sm text-muted-foreground">
                {selectedResolution.resolvedDateText}
              </p>
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-semibold">Resolved location</p>
              <p className="text-sm text-muted-foreground">
                {selectedResolution.resolvedLocationText}
              </p>
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-semibold">WHEREAS clauses</p>
              <p className="text-sm text-muted-foreground">
                {selectedResolution.whereasClauses.length} clause(s) configured
              </p>
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-semibold">Provisional members</p>
              <div className="text-sm text-muted-foreground space-y-1">
                {selectedResolution.provisionalMembers.map((member) => (
                  <p key={member.id}>
                    {member.role}: {member.name || member.position}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <BacResolutionActivityLog entries={selectedResolution.activityLog} />
    </>
  )
}

export default DetailsPanel
