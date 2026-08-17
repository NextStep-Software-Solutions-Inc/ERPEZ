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

      {selectedResolution.procurementProjectContext && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Authoritative Procurement Context
          </p>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-default-900">
                {selectedResolution.procurementProjectContext.projectTitle}
              </span>
              <span className="rounded-full bg-primary text-white font-semibold text-[10px] px-2 py-0.5">
                {selectedResolution.procurementProjectContext.sourceType === 'APP_ITEM' ? 'Path A: APP Item' : 'Path B: Consolidated PR'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-default-700 pt-1">
              <div>
                <span className="text-muted-foreground block text-[10px]">Implementing Unit</span>
                <span className="font-medium">{selectedResolution.procurementProjectContext.officeName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Procurement Mode</span>
                <span className="font-medium text-blue-700">{selectedResolution.procurementProjectContext.modeOfProcurement}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Source of Fund</span>
                <span className="font-medium">{selectedResolution.procurementProjectContext.sourceOfFund}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Estimated Budget</span>
                <span className="font-bold text-emerald-700">₱{selectedResolution.procurementProjectContext.abc.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
