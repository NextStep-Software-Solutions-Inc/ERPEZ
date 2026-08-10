import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  Calendar,
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  FileDown,
  FileSignature,
  FileText,
  RotateCcw,
  Send,
  ShieldCheck,
  Upload,
  Building2,
  Coins,
  Scale,
  Hash,
  Layers,
  Eye,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { NoticeOfAward, NoticeOfAwardMilestone } from '../types'
import { NoticeOfAwardStatusBadge } from './NoticeOfAwardStatusBadge'
import type { NoticeOfAwardRole } from '../types'
import {
  formatNoaSlaDate,
  getNoaContractExecutionSlaState,
  getNoaMilestoneFileName,
  getNoaMilestoneDate,
  NOA_CONTRACT_EXECUTION_MILESTONES,
} from '../utils/noaContractExecutionSla'
import { Input } from '@/components/ui/input'

type NoticeOfAwardDetailsShellProps = {
  noticeOfAward: NoticeOfAward
  role: NoticeOfAwardRole
  isLoading?: boolean
  onPrint?: () => void | Promise<void>
  onSubmit?: () => void | Promise<void>
  onReturn?: () => void
  onApprove?: () => void
  onLogMilestone?: (
    milestone: NoticeOfAwardMilestone,
    file: File,
  ) => void | Promise<void>
  onLogJustification?: () => void | Promise<void>
  onTriggerCascade?: () => void | Promise<void>
  onViewSignedDocument?: () => void | Promise<void>
  onViewMilestoneFile?: (
    milestone: NoticeOfAwardMilestone,
    fileName: string,
  ) => void | Promise<void>
}

export function NoticeOfAwardDetailsShell({
  noticeOfAward,
  role,
  isLoading = false,
  onPrint,
  onSubmit,
  onReturn,
  onApprove,
  onLogMilestone,
  onLogJustification,
  onTriggerCascade,
  onViewSignedDocument,
  onViewMilestoneFile,
}: NoticeOfAwardDetailsShellProps) {
  const isDraft = noticeOfAward.status === 'draft'
  const isReturned = noticeOfAward.status === 'returned'
  const isForApproval = noticeOfAward.status === 'for-approval'
  const canLogContractExecution = noticeOfAward.status === 'approved'

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
      <div className="space-y-4">
        <Card className="border-default-200/70 shadow-sm overflow-hidden bg-white">
          <CardHeader className="space-y-2 border-b border-default-200/60 pb-4 bg-default-50/40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <NoticeOfAwardStatusBadge status={noticeOfAward.status} />
              <Badge
                variant="outline"
                className="border-default-300 text-default-700 font-semibold shadow-sm"
              >
                Public Bidding
              </Badge>
              <Badge
                variant="outline"
                className="border-primary/20 text-primary-750 bg-primary/5 font-semibold shadow-sm"
              >
                {noticeOfAward.linkedBacResolution.bacResolutionNumber}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {onPrint ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-9 font-medium shadow-sm hover:bg-default-50 transition-all duration-200"
                  onClick={onPrint}
                  disabled={isLoading}
                >
                  <FileDown className="h-4 w-4" />
                  Print NOA
                </Button>
              ) : null}

              {role === 'procurement-staff' &&
              (isDraft || isReturned) &&
              onSubmit ? (
                <Button
                  size="sm"
                  className="gap-1.5 h-9 font-bold bg-primary text-white hover:bg-primary/90 shadow-md transition-all duration-200"
                  onClick={onSubmit}
                  disabled={isLoading}
                >
                  <Send className="h-4 w-4" />
                  Submit
                </Button>
              ) : null}

              {role === 'hope' && isForApproval && onReturn ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-9 font-bold border-rose-250 text-rose-600 hover:bg-rose-50 shadow-sm transition-all duration-200"
                  onClick={onReturn}
                  disabled={isLoading}
                >
                  <RotateCcw className="h-4 w-4" />
                  Return
                </Button>
              ) : null}

              {role === 'hope' && isForApproval && onApprove ? (
                <Button
                  size="sm"
                  className="gap-1.5 h-9 font-bold bg-success text-white hover:bg-success/90 shadow-md transition-all duration-200"
                  onClick={onApprove}
                  disabled={isLoading}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Approve / Issue
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Details Sections Panel */}
          <div className="grid gap-4 md:grid-cols-3">
            
            {/* Group 1: Award & Financials */}
            <Card className="border border-default-200 shadow-sm border-l-4 border-l-success bg-white hover:translate-y-[-2px] transition-all duration-200">
              <CardHeader className="pb-2.5 pt-3.5 px-4 border-b border-default-100 bg-default-50/20">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-success-850">
                  Award & Financials
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 space-y-2.5">
                <InfoBlock
                  label="Winning supplier"
                  value={noticeOfAward.supplierName}
                  icon={<Building2 className="h-4 w-4 text-emerald-600" />}
                />
                <InfoBlock
                  label="Awarded Amount"
                  value={noticeOfAward.totalAmount.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  valueClassName="text-emerald-700 font-extrabold text-sm"
                  icon={<Coins className="h-4 w-4 text-emerald-650" />}
                />
                {noticeOfAward.linkedBacResolution.awardCriterion && (
                  <InfoBlock
                    label="Award Criterion"
                    value={
                      noticeOfAward.linkedBacResolution.awardCriterion === 'LCRB'
                        ? 'LCRB (Lowest Price)'
                        : 'MEARB (Weighted Total)'
                    }
                    icon={<Scale className="h-4 w-4 text-emerald-600" />}
                  />
                )}
              </CardContent>
            </Card>

            {/* Group 2: Procurement References */}
            <Card className="border border-default-200 shadow-sm border-l-4 border-l-blue-500 bg-white hover:translate-y-[-2px] transition-all duration-200">
              <CardHeader className="pb-2.5 pt-3.5 px-4 border-b border-default-100 bg-default-50/20">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Procurement References
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 space-y-2.5">
                <InfoBlock
                  label="BAC Resolution"
                  value={noticeOfAward.linkedBacResolution.bacResolutionNumber}
                  icon={<FileCheck2 className="h-4 w-4 text-blue-600" />}
                />
                <InfoBlock
                  label="Purchase Request (PR)"
                  value={noticeOfAward.linkedConsolidatedPr.prNumber}
                  icon={<FileText className="h-4 w-4 text-blue-500" />}
                />
                <InfoBlock
                  label="Source AOB"
                  value={noticeOfAward.linkedBacResolution.sourceAobNumber ?? '-'}
                  icon={<Hash className="h-4 w-4 text-blue-500" />}
                />
              </CardContent>
            </Card>

            {/* Group 3: Timeline & Classification */}
            <Card className="border border-default-200 shadow-sm border-l-4 border-l-purple-500 bg-white hover:translate-y-[-2px] transition-all duration-200">
              <CardHeader className="pb-2.5 pt-3.5 px-4 border-b border-default-100 bg-default-50/20">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-purple-800">
                  Timeline & Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 space-y-2.5">
                <InfoBlock
                  label="Date"
                  value={noticeOfAward.date}
                  icon={<Calendar className="h-4 w-4 text-purple-600" />}
                />
                <InfoBlock
                  label="Date Bid"
                  value={noticeOfAward.dateBid}
                  icon={<CalendarClock className="h-4 w-4 text-purple-600" />}
                />
                <InfoBlock
                  label="Type"
                  value={getTypeLabel(noticeOfAward.type)}
                  icon={<Layers className="h-4 w-4 text-purple-600" />}
                />
              </CardContent>
            </Card>
          </div>

          <div className="rounded-2xl border border-default-200 bg-background shadow-sm overflow-hidden mt-6">
            <div className="px-5 py-4 border-b border-default-100 bg-default-50/50 flex items-center justify-between">
              <div className="text-sm font-bold text-default-900">
                Awarded Line Items
              </div>
              <Badge variant="outline" className="font-semibold text-[11px] border-primary/20 text-primary bg-primary/5">
                {noticeOfAward.lineItems.length} items
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-default-50/70">
                  <TableRow>
                    <TableHead className="font-bold text-default-900 py-3">Category</TableHead>
                    <TableHead className="font-bold text-default-900 py-3">Item Name</TableHead>
                    <TableHead className="font-bold text-default-900 py-3">Description</TableHead>
                    <TableHead className="font-bold text-default-900 py-3">Qty</TableHead>
                    <TableHead className="font-bold text-default-900 py-3">Unit</TableHead>
                    <TableHead className="font-bold text-default-900 py-3">Unit Price</TableHead>
                    <TableHead className="font-bold text-default-900 py-3 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {noticeOfAward.lineItems.length ? (
                    noticeOfAward.lineItems.map((lineItem) => (
                      <TableRow key={lineItem.id} className="transition-colors duration-150 hover:bg-default-50/50">
                        <TableCell className="font-medium text-default-800">{lineItem.category}</TableCell>
                        <TableCell className="font-semibold text-default-950">{lineItem.itemName}</TableCell>
                        <TableCell className="text-default-600">{lineItem.description}</TableCell>
                        <TableCell className="font-semibold text-default-900">{lineItem.quantity}</TableCell>
                        <TableCell className="text-default-500">{lineItem.unit}</TableCell>
                        <TableCell className="font-mono text-default-700">
                          {lineItem.unitPrice.toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-default-900 text-right">
                          {lineItem.amount.toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-sm text-default-500"
                      >
                        No Consolidated PR line items are available yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-default-200 shadow-sm hover:translate-y-[-2px] transition-all duration-200 bg-white">
        <CardHeader className="pb-3 pt-4 px-4 border-b border-default-100 bg-default-50/20">
          <CardTitle className="text-sm font-bold text-default-900">Source Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoBlock
              label="Project"
              value={noticeOfAward.linkedConsolidatedPr.projectName}
              icon={<Building2 className="h-4 w-4 text-blue-500" />}
            />
            <InfoBlock
              label="Project description"
              value={noticeOfAward.linkedConsolidatedPr.projectDescription}
              icon={<FileText className="h-4 w-4 text-blue-500" />}
            />
            <InfoBlock
              label="BAC Resolution Date"
              value={noticeOfAward.linkedBacResolution.resolutionDate}
              icon={<Calendar className="h-4 w-4 text-blue-500" />}
            />
            <InfoBlock
              label="Approved budget"
              value={noticeOfAward.linkedConsolidatedPr.approvedBudget.toLocaleString(
                'en-PH',
                {
                  style: 'currency',
                  currency: 'PHP',
                },
              )}
              valueClassName="text-primary font-bold"
              icon={<Coins className="h-4 w-4 text-blue-500" />}
            />
            <InfoBlock
              label="Created"
              value={noticeOfAward.createdAt}
              icon={<CalendarClock className="h-4 w-4 text-blue-500" />}
            />
            <InfoBlock
              label="Updated"
              value={noticeOfAward.updatedAt}
              icon={<CalendarClock className="h-4 w-4 text-blue-500" />}
            />
          </div>
        </CardContent>
      </Card>
    </div>

      <div className="space-y-4">
        {(role !== 'hope' || noticeOfAward.status === 'approved') && (
          <ContractExecutionSlaCard
            noticeOfAward={noticeOfAward}
            canLogMilestones={role === 'procurement-staff' && canLogContractExecution}
            isLoading={isLoading}
            onLogMilestone={onLogMilestone}
            onLogJustification={onLogJustification}
            onTriggerCascade={onTriggerCascade}
            onViewMilestoneFile={onViewMilestoneFile}
          />
        )}


        <Card className="border-default-200/70 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Signed NOA</CardTitle>
                <CardDescription className="mt-1">
                  {noticeOfAward.signedDocumentFileName ??
                    'HoPE-signed document is pending.'}
                </CardDescription>
              </div>
              {noticeOfAward.signedDocumentFileName && onViewSignedDocument ? (
                <Button
                  type="button"
                  variant="outline"
                  color="secondary"
                  size="sm"
                  className="gap-1.5 h-8 font-medium shadow-sm hover:bg-default-50 border-default-300 transition-all duration-200"
                  onClick={onViewSignedDocument}
                  disabled={isLoading}
                >
                  <Eye className="h-4 w-4 text-default-500" />
                  View PDF
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <InfoBlock
              label="Approved By"
              value={noticeOfAward.approvedBy ?? '-'}
            />
            <InfoBlock
              label="Issued At"
              value={formatNoaSlaDate(noticeOfAward.issuedAt)}
            />
            <InfoBlock
              label="PhilGEPS Posted"
              value={formatNoaSlaDate(noticeOfAward.philgepsPostedAt)}
            />
            <InfoBlock
              label="PhilGEPS Reference"
              value={noticeOfAward.philgepsReferenceNumber ?? '-'}
            />
          </CardContent>
        </Card>

        <Card className="border-default-200/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Workflow Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {noticeOfAward.activityLog.length ? (
              noticeOfAward.activityLog.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-default-200 bg-background p-3"
                >
                  <div className="flex items-center justify-between gap-3 text-sm font-medium text-default-900">
                    <span>{entry.action}</span>
                    <span className="text-xs text-default-500">
                      {entry.timestamp}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-default-500">
                    {entry.actor}
                    {entry.note ? ` - ${entry.note}` : ''}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-default-200 bg-background p-3 text-xs text-default-500">
                No workflow activity has been recorded yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ContractExecutionSlaCard({
  noticeOfAward,
  canLogMilestones,
  isLoading,
  onLogMilestone,
  onLogJustification,
  onTriggerCascade,
  onViewMilestoneFile,
}: {
  noticeOfAward: NoticeOfAward
  canLogMilestones: boolean
  isLoading: boolean
  onLogMilestone?: (
    milestone: NoticeOfAwardMilestone,
    file: File,
  ) => void | Promise<void>
  onLogJustification?: () => void | Promise<void>
  onTriggerCascade?: () => void | Promise<void>
  onViewMilestoneFile?: (
    milestone: NoticeOfAwardMilestone,
    fileName: string,
  ) => void | Promise<void>
}) {
  const slaState = getNoaContractExecutionSlaState(noticeOfAward)

  return (
    <Card className="border-default-200/70 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Contract Execution SLA</CardTitle>
            <CardDescription>
              {slaState.isIssued
                ? `Issued ${formatNoaSlaDate(slaState.issuedDate)} - Due ${formatNoaSlaDate(slaState.deadlineDate)}`
                : 'Starts after HoPE approval / issuance.'}
            </CardDescription>
          </div>
          <SlaStateBadge noticeOfAward={noticeOfAward} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <Progress
            value={slaState.progressPercent}
            color={
              slaState.isOverdue
                ? 'destructive'
                : slaState.isComplete
                  ? 'success'
                  : 'warning'
            }
            size="sm"
          />
          <div className="flex items-center justify-between text-xs text-default-500">
            <span>
              {slaState.completedMilestones}/{slaState.totalMilestones}{' '}
              milestones logged
            </span>
            <span>{slaState.label}</span>
          </div>
        </div>

        <div className="relative pl-2 space-y-0.5">
          {NOA_CONTRACT_EXECUTION_MILESTONES.map((milestone, idx) => {
            const milestoneDate = getNoaMilestoneDate(
              noticeOfAward,
              milestone.key,
            )
            const milestoneFileName = getNoaMilestoneFileName(
              noticeOfAward,
              milestone.key,
            )
            const inputId = `${noticeOfAward.id}-${milestone.key}-file`
            const isLogged = !!milestoneDate
            
            const isPrevLogged = idx === 0 || !!getNoaMilestoneDate(noticeOfAward, NOA_CONTRACT_EXECUTION_MILESTONES[idx - 1].key)
            const isCurrentActive = !isLogged && isPrevLogged

            const canUploadMilestone =
              canLogMilestones &&
              isCurrentActive &&
              Boolean(onLogMilestone) &&
              !isLoading

            return (
              <div
                key={milestone.key}
                className="relative pl-8 pb-6 last:pb-2"
              >
                {idx < NOA_CONTRACT_EXECUTION_MILESTONES.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-[13px] top-[30px] bottom-0 w-[2px] transition-all duration-300",
                      isLogged ? "bg-emerald-500" : "bg-default-200"
                    )}
                  />
                )}

                <div
                  className={cn(
                    "absolute left-0 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition-all duration-300 text-xs font-bold",
                    isLogged
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                      : isCurrentActive
                        ? "border-primary bg-primary/10 text-primary animate-pulse"
                        : "border-default-200 bg-default-100 text-default-450"
                  )}
                >
                  {isLogged ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow",
                    isLogged
                      ? "border-emerald-100 bg-emerald-50/20"
                      : isCurrentActive
                        ? "border-primary/20 bg-primary/5 ring-1 ring-primary/5"
                        : "border-default-100 bg-default-50/40 opacity-70"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className={cn(
                      "text-sm font-bold text-default-900 transition-colors duration-200",
                      isLogged && "text-emerald-950",
                      isCurrentActive && "text-primary"
                    )}>
                      {milestone.label}
                    </div>
                    <div className="mt-1 space-y-1 text-xs text-default-500">
                      {isLogged && milestoneDate ? (
                        <div className="font-semibold text-emerald-700">
                          Logged on {formatNoaSlaDate(milestoneDate)}
                        </div>
                      ) : (
                        <div className="text-default-400 font-medium">Pending upload</div>
                      )}
                      
                      {milestoneFileName ? (
                        <button
                          type="button"
                          onClick={() => onViewMilestoneFile?.(milestone.key, milestoneFileName)}
                          className="flex items-center gap-1.5 mt-1 rounded bg-background border border-default-150 px-2 py-1 w-fit max-w-full hover:bg-default-50 hover:border-default-300 transition-colors text-left cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5 text-default-500 shrink-0" />
                          <span className="max-w-[180px] truncate text-[11px] font-semibold text-default-700 underline text-primary">
                            {milestoneFileName}
                          </span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                  
                  <div>
                    {!isLogged ? (
                      <Input
                        id={inputId}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        removeWrapper
                        className="sr-only"
                        disabled={!canUploadMilestone}
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0]

                          if (file) {
                            void onLogMilestone?.(milestone.key, file)
                            event.currentTarget.value = ''
                          }
                        }}
                      />
                    ) : null}

                    {isLogged ? (
                      <Button
                        type="button"
                        variant="outline"
                        color="success"
                        size="sm"
                        className="gap-1.5 h-8 font-bold border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm"
                        disabled
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Logged
                      </Button>
                    ) : canUploadMilestone ? (
                      <Button
                        type="button"
                        variant="outline"
                        color="primary"
                        size="sm"
                        className="gap-1.5 h-8 font-bold hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer shadow-sm animate-in fade-in"
                        asChild
                      >
                        <label htmlFor={inputId} className="cursor-pointer">
                          <Upload className="h-3.5 w-3.5" />
                          Log {toMilestoneActionLabel(milestone.label)}
                        </label>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        color="primary"
                        size="sm"
                        className="gap-1.5 h-8 font-bold"
                        disabled
                      >
                        <FileCheck2 className="h-3.5 w-3.5" />
                        Log {toMilestoneActionLabel(milestone.label)}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {slaState.requiresCascadeDecision ? (
          <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <div className="flex items-start gap-2 font-medium">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <span>
                Contract execution deadline passed without a logged contract.
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                color="secondary"
                size="sm"
                className="gap-2"
                onClick={onLogJustification}
                disabled={isLoading || !onLogJustification}
              >
                <FileSignature className="h-4 w-4" />
                Log Justification
              </Button>
              <Button
                type="button"
                color="destructive"
                size="sm"
                className="gap-2"
                onClick={onTriggerCascade}
                disabled={isLoading || !onTriggerCascade}
              >
                <AlertTriangle className="h-4 w-4" />
                Trigger Cascade
              </Button>
            </div>
          </div>
        ) : null}

        {noticeOfAward.contractExecutionJustification ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {noticeOfAward.contractExecutionJustification}
          </div>
        ) : null}

        {noticeOfAward.cascadeTriggeredAt ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <div className="font-medium">
              Cascade triggered{' '}
              {formatNoaSlaDate(noticeOfAward.cascadeTriggeredAt)}
            </div>
            <div className="mt-1 text-xs">
              {noticeOfAward.cascadeNote ??
                'Next-ranked bidder cascade recorded.'}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function SlaStateBadge({ noticeOfAward }: { noticeOfAward: NoticeOfAward }) {
  const state = getNoaContractExecutionSlaState(noticeOfAward)

  if (!state.isIssued) {
    return (
      <Badge className="border border-default-300 bg-default-100 text-default-700">
        <CalendarClock className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    )
  }

  if (state.isComplete) {
    return (
      <Badge className="border border-emerald-300 bg-emerald-50 text-emerald-700">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Complete
      </Badge>
    )
  }

  if (state.isOverdue) {
    return (
      <Badge className="border border-rose-300 bg-rose-50 text-rose-700">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Overdue
      </Badge>
    )
  }

  return (
    <Badge className="border border-amber-300 bg-amber-50 text-amber-700">
      <CalendarClock className="mr-1 h-3 w-3" />
      Open
    </Badge>
  )
}

function getTypeLabel(type: NoticeOfAward['type']) {
  switch (type) {
    case 'goods-services':
      return 'Goods and Services'
    case 'infrastructure':
      return 'Infrastructure'
    case 'consulting':
      return 'Consulting'
    default:
      return type
  }
}

function toMilestoneActionLabel(label: string) {
  return label
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function InfoBlock({
  label,
  value,
  icon,
  valueClassName,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-default-100 bg-default-50/30 p-2.5 shadow-sm hover:shadow transition-shadow duration-150">
      {icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-default-150 shadow-sm text-default-600">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
          {label}
        </div>
        <div className={cn("mt-0.5 text-xs font-semibold text-default-900 truncate", valueClassName)}>
          {value}
        </div>
      </div>
    </div>
  )
}
