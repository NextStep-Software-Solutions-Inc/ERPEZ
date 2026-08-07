import { useNavigate } from '@tanstack/react-router'
import {
  CalendarDays,
  FileDown,
  FileText,
  Link2,
  Map,
  PackageOpen,
  Receipt,
  Send,
  FileCheck,
} from 'lucide-react'
import { BacResolutionExecutionBadges } from './BacResolutionExecutionBadges'
import { BacResolutionStatusBadge } from './BacResolutionStatusBadge'
import type {
  BacResolution,
  BacResolutionListRoutePath,
  BacResolutionRole,
  BacResolutionWorkspaceScope,
} from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getPrimaryLinkedConsolidatedPr,
  getBacResolutionScheduleRoutePath,
  hasExactlyOneLinkedConsolidatedPr,
  isBacResolutionPublicBiddingEligible,
  resolveBacScheduleEntryState,
} from '../utils/bacResolutionWorkflow'

interface BacResolutionSummaryCardProps {
  resolution: BacResolution
  role: BacResolutionRole
  workspaceScope?: BacResolutionWorkspaceScope
  bacListRoutePath?: BacResolutionListRoutePath
  isLoading?: boolean
  onLinkPrs?: () => void
  onPrint?: () => void | Promise<void>
  onSubmit?: () => void | Promise<void>
}

export function BacResolutionSummaryCard({
  resolution,
  role,
  workspaceScope = 'all',
  bacListRoutePath = '/v2/bac-resolutions',
  isLoading = false,
  onLinkPrs,
  onPrint,
  onSubmit,
}: BacResolutionSummaryCardProps) {
  const navigate = useNavigate()
  const isDraft = resolution.status === 'draft'
  const isReturned = resolution.status === 'returned'
  const primaryLinkedPr = getPrimaryLinkedConsolidatedPr(resolution)
  const hasSingleOwnedPr = hasExactlyOneLinkedConsolidatedPr(resolution)
  const scheduleEntryState = resolveBacScheduleEntryState({ resolution, role })
  const scheduleCtaLabel = scheduleEntryState.canOpenSchedule
    ? 'Open Bidding Schedule'
    : 'Generate Bidding Schedule'
  const showScheduleBlocker =
    workspaceScope === 'public-bidding' &&
    scheduleEntryState.showBlockedScheduleAction
  const canScheduleNavigate =
    scheduleEntryState.canGenerateSchedule || scheduleEntryState.canOpenSchedule
  const scheduleRoutePath = getBacResolutionScheduleRoutePath(
    bacListRoutePath === '/v2/bac-resolutions-public-bidding',
  )

  return (
    <Card className="border border-default-200 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              {resolution.bacResolutionNumber}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {resolution.description}
            </p>
            <BacResolutionExecutionBadges resolution={resolution} />
          </div>
          <BacResolutionStatusBadge status={resolution.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap justify-end gap-3">
          {canScheduleNavigate && (
            <Button
              variant={
                scheduleEntryState.canOpenSchedule ? 'outline' : 'default'
              }
              color={
                scheduleEntryState.canOpenSchedule ? 'secondary' : 'primary'
              }
              onClick={() =>
                void navigate({
                  to: scheduleRoutePath,
                  params: { resolutionId: resolution.id },
                })
              }
              disabled={isLoading}
              className="gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              {scheduleCtaLabel}
            </Button>
          )}

          {showScheduleBlocker && (
            <Button
              variant="outline"
              color="warning"
              disabled
              className="gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              Generate Bidding Schedule
            </Button>
          )}

          {resolution.status === 'approved' && hasSingleOwnedPr && (
            <Button
              variant="outline"
              color="success"
              onClick={() =>
                void navigate({
                  to: '/v2/bidding-documents/$bacResolutionId',
                  params: { bacResolutionId: resolution.id },
                })
              }
              disabled={isLoading}
              className="gap-2"
            >
              <FileCheck className="h-4 w-4" />
              Proceed to PBD
            </Button>
          )}

          {resolution.status === 'approved' && (
            <Button
              variant="outline"
              color="secondary"
              onClick={() =>
                void navigate({
                  to: '/v2/bidding-master-calendar',
                  search: {
                    selectedResolutionId: resolution.id,
                  },
                })
              }
              disabled={isLoading}
              className="gap-2"
            >
              <Map className="h-4 w-4" />
              Open Master Calendar
            </Button>
          )}

          {role === 'procurement-staff' &&
            (isDraft || isReturned) &&
            onLinkPrs && (
              <Button
                variant="outline"
                onClick={onLinkPrs}
                disabled={isLoading}
                className="gap-2"
              >
                <Link2 className="h-4 w-4" />
                Add Consolidated PR
              </Button>
            )}

          {onPrint && (
            <Button
              variant="outline"
              onClick={onPrint}
              disabled={isLoading}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              Print BAC Resolution
            </Button>
          )}

          {role === 'procurement-staff' &&
            (isDraft || isReturned) &&
            onSubmit && (
              <Button onClick={onSubmit} disabled={isLoading} className="gap-2">
                <Send className="h-4 w-4" />
                Submit
              </Button>
            )
            }
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-default-200 bg-default-50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Resolution Date
            </p>
            <p className="mt-2 font-medium">{resolution.resolutionDate}</p>
          </div>
          <div className="rounded-lg border border-default-200 bg-default-50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Owning Consolidated PR
            </p>
            <div className="mt-2 flex items-center gap-2">
              <PackageOpen className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">
                  {primaryLinkedPr?.prNumber ?? 'Not linked yet'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {primaryLinkedPr?.projectName ??
                    'Link exactly one Consolidated PR before continuing to TC-01.'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-default-200 bg-default-50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total Amount
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              <p className="font-medium">
                ₱{(resolution.totalAmount ?? 0).toLocaleString('en-PH')}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-default-200 bg-default-50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Signed Copy
            </p>
            <p className="mt-2 font-medium">
              {resolution.signedDocumentFileName ?? 'Not uploaded yet'}
            </p>
          </div>
          <div className="sm:col-span-2 xl:col-span-4 flex flex-wrap gap-2 pt-1">
            <Badge variant="outline">Created by {resolution.createdBy}</Badge>
            <Badge variant="outline">
              Updated {resolution.updatedAt.slice(0, 10)}
            </Badge>
            {primaryLinkedPr ? (
              <Badge variant="outline">
                End-user {primaryLinkedPr.endUser}
              </Badge>
            ) : null}
          </div>
        </div>

        {showScheduleBlocker ? (
          <p className="text-sm text-warning">
            Scheduling is unavailable until this BAC Resolution owns exactly one
            Consolidated PR.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
