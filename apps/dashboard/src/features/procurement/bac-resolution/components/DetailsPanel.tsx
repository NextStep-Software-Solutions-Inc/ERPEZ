import { useState } from 'react'
import {
  AlertTriangle,
  FileText,
  Building2,
  Tag,
  Wallet,
  ScrollText,
  CalendarDays,
  History,
  ShieldCheck,
  CheckCircle2,
  Users,
  Send,
  Link2,
  Printer,
  Sparkles,
  Layers,
  ArrowUpRight,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BacResolutionStatusBadge } from './index'
import { BacResolutionExecutionBadges } from './BacResolutionExecutionBadges'
import { ConsolidatedPrTable } from './index'
import { BacResolutionActivityLog } from './index'
import type {
  BacResolution,
  BacResolutionListRoutePath,
  BacResolutionRole,
  BacResolutionWorkspaceScope,
} from '../types'
import {
  getBacResolutionScheduleRoutePath,
  hasExactlyOneLinkedConsolidatedPr,
  isBacResolutionPublicBiddingEligible,
  resolveBacScheduleEntryState,
} from '../utils/bacResolutionWorkflow'
import { useNavigate } from '@tanstack/react-router'

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
  onViewDocument?: () => void
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
  onViewDocument,
}: DetailsPanelProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  if (!selectedResolution) {
    return (
      <Card className="border border-dashed border-default-200 bg-default-50/50 shadow-sm h-full">
        <CardContent className="flex min-h-[500px] items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
              <ScrollText className="h-6 w-6" />
            </div>
            <p className="text-lg font-bold text-foreground">No BAC Resolution Selected</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select a BAC resolution from the queue on the left to view its complete
              specifications, WHEREAS clauses, signatories, linked PRs, and audit trail.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const context = selectedResolution.procurementProjectContext
  const title = context?.projectTitle || selectedResolution.description || 'Procurement Project'
  const isDraft = selectedResolution.status === 'draft'
  const isForApproval = selectedResolution.status === 'for-approval'
  const isApproved = selectedResolution.status === 'approved'
  const isReturned = selectedResolution.status === 'returned'

  const missingSingleOwnedPr = !hasExactlyOneLinkedConsolidatedPr(selectedResolution)
  const lacksPublicBiddingEligibility =
    selectedResolution.status === 'approved' &&
    !missingSingleOwnedPr &&
    !isBacResolutionPublicBiddingEligible(selectedResolution)

  const scheduleEntryState = resolveBacScheduleEntryState({
    resolution: selectedResolution,
    role,
  })
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
    <div className="space-y-4">
      {/* Sticky Top Header Banner */}
      <Card className="border border-default-200 shadow-sm bg-linear-to-r from-default-50 to-white">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base text-primary flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {selectedResolution.bacResolutionNumber}
                </span>
                <BacResolutionStatusBadge status={selectedResolution.status} />
                <BacResolutionExecutionBadges resolution={selectedResolution} />
              </div>
              <h2 className="text-lg font-bold text-foreground line-clamp-2">
                {title}
              </h2>
            </div>

            {/* Quick Actions in Header Banner */}
            <div className="flex flex-wrap items-center gap-2">
              {canScheduleNavigate && (
                <Button
                  size="sm"
                  variant={scheduleEntryState.canOpenSchedule ? 'outline' : 'default'}
                  onClick={() =>
                    void navigate({
                      to: scheduleRoutePath,
                      params: { resolutionId: selectedResolution.id },
                    })
                  }
                  disabled={isLoading}
                  className="gap-1.5 text-xs shadow-xs"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  {scheduleCtaLabel}
                </Button>
              )}

              {onViewDocument && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onViewDocument}
                  disabled={isLoading}
                  className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Preview Doc
                </Button>
              )}

              {onPrint && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onPrint}
                  disabled={isLoading}
                  className="gap-1.5 text-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print PDF
                </Button>
              )}

              {role === 'procurement-staff' && (isDraft || isReturned) && onSubmit && (
                <Button
                  size="sm"
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit for Approval
                </Button>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-default-100 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Approved Budget (ABC)
              </span>
              <span className="font-bold text-emerald-700 text-sm">
                ₱{(context?.abc || selectedResolution.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Implementing Unit
              </span>
              <span className="font-medium text-foreground truncate block">
                {context?.officeName || selectedResolution.linkedConsolidatedPrs[0]?.endUser || 'ICT Office'}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Procurement Mode
              </span>
              <span className="font-semibold text-primary truncate block">
                {context?.modeOfProcurement || selectedResolution.linkedConsolidatedPrs[0]?.modeOfProcurement || 'Public Bidding'}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Source of Fund
              </span>
              <span className="font-medium text-foreground truncate block">
                {context?.sourceOfFund || 'GAA'}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerts */}
      {selectedResolution.status === 'returned' && selectedResolution.returnReason && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive text-xs">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            <span className="font-bold">Returned by BAC Chairperson: </span>
            {selectedResolution.returnReason}
          </AlertDescription>
        </Alert>
      )}

      {missingSingleOwnedPr && (
        <Alert className="text-xs border-amber-200 bg-amber-50/70 text-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            Link exactly one Consolidated PR to keep this BAC Resolution in the Public Bidding scheduling flow.
          </AlertDescription>
        </Alert>
      )}

      {/* 5 Structured Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-default-100/80 p-1 rounded-xl h-auto">
          <TabsTrigger value="overview" className="gap-1.5 text-xs py-2">
            <Sparkles className="h-3.5 w-3.5" />
            Overview & Actions
          </TabsTrigger>
          <TabsTrigger value="source" className="gap-1.5 text-xs py-2">
            <Layers className="h-3.5 w-3.5" />
            Procurement Source
          </TabsTrigger>
          <TabsTrigger value="clauses" className="gap-1.5 text-xs py-2">
            <ScrollText className="h-3.5 w-3.5" />
            WHEREAS Clauses
          </TabsTrigger>
          <TabsTrigger value="prs_schedule" className="gap-1.5 text-xs py-2">
            <CalendarDays className="h-3.5 w-3.5" />
            Linked PRs & Sched
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5 text-xs py-2">
            <History className="h-3.5 w-3.5" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW & ACTIONS */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-default-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Resolution Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-default-100">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Resolution Number</span>
                    <span className="font-bold text-foreground">{selectedResolution.bacResolutionNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Resolution Type</span>
                    <Badge variant="secondary" className="text-[10px] mt-0.5">
                      {selectedResolution.resolutionType || 'Standard'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Resolved Date & Location</span>
                  <p className="font-medium text-foreground">
                    {selectedResolution.resolvedDateText || 'N/A'} at {selectedResolution.resolvedLocationText || 'BAC Conference Hall'}
                  </p>
                </div>

                <div className="space-y-1 pt-1 border-t border-default-100">
                  <span className="text-muted-foreground block text-[11px]">Created By & Timestamp</span>
                  <p className="text-default-700">
                    {selectedResolution.createdBy} on {new Date(selectedResolution.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-default-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Approval & Endorsement Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="space-y-1 pb-2 border-b border-default-100">
                  <span className="text-muted-foreground block text-[11px]">HOPE Approval Status</span>
                  {selectedResolution.status === 'approved' ? (
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      Approved by {selectedResolution.approvedBy || 'DR. HOPE'} on {selectedResolution.approvedAt ? new Date(selectedResolution.approvedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">
                      Pending final submission & endorsement by BAC.
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Provisional BAC Representatives</span>
                  <div className="space-y-1 text-default-700">
                    {selectedResolution.provisionalMembers.map((m) => (
                      <p key={m.id} className="flex items-center justify-between">
                        <span className="font-medium">{m.role}:</span>
                        <span>{m.name || m.position}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: PROCUREMENT SOURCE */}
        <TabsContent value="source" className="space-y-4">
          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Authoritative Procurement Source Information
                </CardTitle>
                <Badge className="bg-primary text-white text-[10px]">
                  {selectedResolution.sourceType === 'APP_ITEM' ? 'Path A: APP Item' : 'Path B: Consolidated PR'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-default-50 border border-default-200">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Office / Unit</span>
                  <span className="font-semibold text-foreground text-sm">
                    {context?.officeName || selectedResolution.linkedConsolidatedPrs[0]?.endUser || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Procurement Mode</span>
                  <span className="font-semibold text-primary text-sm">
                    {context?.modeOfProcurement || selectedResolution.linkedConsolidatedPrs[0]?.modeOfProcurement || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Source of Fund</span>
                  <span className="font-semibold text-foreground text-sm">
                    {context?.sourceOfFund || 'GAA'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Approved Budget (ABC)</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    ₱{(context?.abc || selectedResolution.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Item breakdown specifications */}
              <div className="space-y-2 pt-2">
                <p className="font-bold text-xs uppercase tracking-wider text-default-700">
                  Item Specifications & Allocation Details
                </p>
                {context?.itemBreakdown && context.itemBreakdown.length > 0 ? (
                  <div className="space-y-2">
                    {context.itemBreakdown.map((item, idx) => (
                      <div key={idx} className="rounded-lg border border-default-200 p-3 bg-white space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-default-900">{item.itemNumber}: {item.description}</span>
                          <span className="font-bold text-emerald-700">₱{item.estimatedBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <p className="text-muted-foreground text-[11px]">
                          {item.officeName} | {item.modeOfProcurement} | {item.sourceOfFund}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-default-200 p-3 bg-white space-y-1">
                    <p className="font-bold text-default-900">{title}</p>
                    <p className="text-muted-foreground text-[11px]">
                      Full Lot Allocation: ₱{(context?.abc || selectedResolution.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: WHEREAS CLAUSES & SIGNATORIES */}
        <TabsContent value="clauses" className="space-y-4">
          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-primary" />
                Configured WHEREAS Clauses ({selectedResolution.whereasClauses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedResolution.whereasClauses.map((clause, idx) => (
                <div key={idx} className="rounded-xl border border-default-200 p-4 bg-default-50/50 space-y-1.5 font-serif text-xs leading-relaxed">
                  <p className="font-bold text-primary font-sans">{clause.name}</p>
                  <p className="text-default-800 text-justify">{clause.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Bids and Awards Committee Signatories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-default-100">
                <div className="p-3 rounded-lg bg-default-50 border border-default-200">
                  <p className="font-bold text-default-900">{selectedResolution.signatoryOverrides?.chairperson || 'BAC CHAIRPERSON DEMO'}</p>
                  <p className="text-muted-foreground text-[11px]">Chairperson, BAC</p>
                </div>
                <div className="p-3 rounded-lg bg-default-50 border border-default-200">
                  <p className="font-bold text-default-900">{selectedResolution.signatoryOverrides?.viceChairperson || 'BAC VICE-CHAIRPERSON DEMO'}</p>
                  <p className="text-muted-foreground text-[11px]">Vice-Chairperson, BAC</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedResolution.provisionalMembers.map((m) => (
                  <div key={m.id} className="p-3 rounded-lg bg-default-50 border border-default-200">
                    <p className="font-bold text-default-900">{m.name || `[${m.role}]`}</p>
                    <p className="text-muted-foreground text-[11px]">{m.position} ({m.role})</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: LINKED PRS & SCHEDULE */}
        <TabsContent value="prs_schedule" className="space-y-4">
          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                Linked Consolidated PRs ({selectedResolution.linkedConsolidatedPrs.length})
              </CardTitle>
              {role === 'procurement-staff' && onLinkPrs && (
                <Button size="sm" variant="outline" onClick={onLinkPrs} className="text-xs gap-1.5 h-7">
                  <Link2 className="h-3.5 w-3.5" />
                  Manage Linkage
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <ConsolidatedPrTable
                items={selectedResolution.linkedConsolidatedPrs}
                emptyMessage="No Consolidated PRs linked to this BAC resolution."
                onViewDetails={(item) => handleViewConsolidatedPrDetails(item.id)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: AUDIT TRAIL */}
        <TabsContent value="history" className="space-y-4">
          <BacResolutionActivityLog entries={selectedResolution.activityLog} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DetailsPanel
