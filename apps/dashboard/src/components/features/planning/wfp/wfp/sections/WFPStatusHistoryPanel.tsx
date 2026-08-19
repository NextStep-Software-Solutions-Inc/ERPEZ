import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  History,
  ExternalLink,
  PlusCircle,
  FileCheck,
  Target,
  Activity as ActivityIcon,
  DollarSign,
  Calendar,
  User,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDisplayDate } from '@/utils/formatters'
import type { WFPDetails } from '../table/types'
import type { OPCR } from '../../opcr/table/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface WFPStatusHistoryPanelProps {
  wfp: WFPDetails
  opcr?: OPCR
  activityCount?: number
  timelineCount?: number
  expenditureCount?: number
  remainingWeight?: number
}

interface AuditLogEntry {
  id: string
  title: string
  description: string
  actor: string
  timestamp: string | Date
  category: 'wfp' | 'objective' | 'activity' | 'timeline' | 'expenditure'
}

export const WFPStatusHistoryPanel: React.FC<WFPStatusHistoryPanelProps> = ({
  wfp,
  opcr,
  activityCount = 0,
  timelineCount = 0,
  expenditureCount = 0,
  remainingWeight = 0,
}) => {
  const [auditModalOpen, setAuditModalOpen] = useState(false)
  const isOPCRMode = wfp?.mode === 'OPCR'
  const isWeightAllocated = remainingWeight === 0

  // Dynamically collect and build all chronological audit events
  const auditEntries = useMemo(() => {
    const entries: AuditLogEntry[] = []

    if (!wfp) return entries

    // 1. WFP Initial Creation
    if (wfp.createdAt) {
      entries.push({
        id: `wfp-create-${wfp.id}`,
        title: 'WFP Plan Initialized',
        description: `Work & Financial Plan created for "${wfp.projectTitle || 'Project'}"`,
        actor: wfp.createdBy || 'System',
        timestamp: wfp.createdAt,
        category: 'wfp',
      })
    }

    // 2. WFP Status / Modifications
    if (wfp.updatedAt && wfp.updatedAt !== wfp.createdAt) {
      entries.push({
        id: `wfp-update-${wfp.id}`,
        title: 'WFP Details Updated',
        description: `Plan parameters or metadata were modified. Current status: ${wfp.status || 'Draft'}`,
        actor: wfp.updatedBy || wfp.createdBy || 'System',
        timestamp: wfp.updatedAt,
        category: 'wfp',
      })
    }

    if (wfp.submittedDate) {
      entries.push({
        id: `wfp-submitted-${wfp.id}`,
        title: 'WFP Submitted for Review',
        description: 'Work & Financial Plan was marked ready and submitted for administrative approval.',
        actor: wfp.updatedBy || wfp.createdBy || 'User',
        timestamp: wfp.submittedDate,
        category: 'wfp',
      })
    }

    if (wfp.approvedDate) {
      entries.push({
        id: `wfp-approved-${wfp.id}`,
        title: 'WFP Formally Approved',
        description: 'Work & Financial Plan received official approval.',
        actor: 'Approving Authority',
        timestamp: wfp.approvedDate,
        category: 'wfp',
      })
    }

    // 3. Objectives Events
    if (Array.isArray(wfp.wfpObjectives)) {
      wfp.wfpObjectives.forEach((obj: any, idx: number) => {
        if (obj.createdAt) {
          entries.push({
            id: `obj-create-${obj.id || idx}`,
            title: `Objective Added: ${obj.description || 'Objective'}`,
            description: `Weight allocation: ${obj.weight || 0}%${obj.outcome ? ` • Outcome: ${obj.outcome}` : ''}`,
            actor: obj.createdBy || 'System',
            timestamp: obj.createdAt,
            category: 'objective',
          })
        }

        if (obj.updatedAt && obj.updatedAt !== obj.createdAt) {
          entries.push({
            id: `obj-update-${obj.id || idx}`,
            title: `Objective Updated: ${obj.description || 'Objective'}`,
            description: `Weight allocation updated to ${obj.weight || 0}%`,
            actor: obj.updatedBy || obj.createdBy || 'System',
            timestamp: obj.updatedAt,
            category: 'objective',
          })
        }

        // 4. Activities Events
        if (Array.isArray(obj.wfpObjectiveActivities)) {
          obj.wfpObjectiveActivities.forEach((act: any, aIdx: number) => {
            if (act.createdAt) {
              entries.push({
                id: `act-create-${act.id || aIdx}`,
                title: `Activity Created: ${act.activityName || 'Activity'}`,
                description: `Indicator: ${act.indicator || 'N/A'} • Weight: ${act.weight || 0}%`,
                actor: act.createdBy || 'System',
                timestamp: act.createdAt,
                category: 'activity',
              })
            }

            if (act.updatedAt && act.updatedAt !== act.createdAt) {
              entries.push({
                id: `act-update-${act.id || aIdx}`,
                title: `Activity Modified: ${act.activityName || 'Activity'}`,
                description: `Activity specifications or milestones updated.`,
                actor: act.updatedBy || act.createdBy || 'System',
                timestamp: act.updatedAt,
                category: 'activity',
              })
            }

            // 5. Timelines Events
            if (Array.isArray(act.wfpObjectiveTimelines)) {
              act.wfpObjectiveTimelines.forEach((tl: any, tIdx: number) => {
                if (tl.createdAt) {
                  entries.push({
                    id: `tl-create-${tl.id || tIdx}`,
                    title: `Timeline Set (${tl.timelineType || 'Quarter'}) for "${act.activityName || 'Activity'}"`,
                    description: `Target distribution: ${tl.targetValue || 0}%`,
                    actor: tl.createdBy || 'System',
                    timestamp: tl.createdAt,
                    category: 'timeline',
                  })
                }
              })
            }

            // 6. Expenditures Events
            if (Array.isArray(act.wfpObjectiveActivityExpenditures)) {
              act.wfpObjectiveActivityExpenditures.forEach((exp: any, eIdx: number) => {
                const itemName = exp.itemDescription || exp.object?.name || 'Expenditure Item'
                const cost = exp.unitCost || 0
                const qty = exp.quantity || 0
                const subtotal = cost * qty
                if (exp.createdAt) {
                  entries.push({
                    id: `exp-create-${exp.id || eIdx}`,
                    title: `PPMP Expenditure Linked: ${itemName}`,
                    description: `Qty: ${qty} • Unit Cost: ₱${cost.toLocaleString()} • Total: ₱${subtotal.toLocaleString()}`,
                    actor: exp.createdBy || 'System',
                    timestamp: exp.createdAt,
                    category: 'expenditure',
                  })
                }
              })
            }
          })
        }
      })
    }

    // Sort descending by timestamp (newest first)
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return entries
  }, [wfp])

  const createdDate = wfp?.createdAt ? formatDisplayDate(wfp.createdAt) : 'Initial record'
  const lastEvent = auditEntries[0]
  const lastModifiedDate = lastEvent ? formatDisplayDate(lastEvent.timestamp) : createdDate
  const lastModifiedActor = lastEvent?.actor || wfp?.updatedBy || wfp?.createdBy || 'System'

  const getCategoryIcon = (category: AuditLogEntry['category']) => {
    switch (category) {
      case 'objective':
        return <Target className="w-3.5 h-3.5 text-blue-600" />
      case 'activity':
        return <ActivityIcon className="w-3.5 h-3.5 text-indigo-600" />
      case 'expenditure':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
      case 'timeline':
        return <Calendar className="w-3.5 h-3.5 text-purple-600" />
      default:
        return <FileCheck className="w-3.5 h-3.5 text-slate-600" />
    }
  }

  const getCategoryBadge = (category: AuditLogEntry['category']) => {
    switch (category) {
      case 'objective':
        return <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">Objective</Badge>
      case 'activity':
        return <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-indigo-50 text-indigo-700 border-indigo-200">Activity</Badge>
      case 'expenditure':
        return <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">Expenditure</Badge>
      case 'timeline':
        return <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-200">Timeline</Badge>
      default:
        return <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-slate-50 text-slate-700 border-slate-200">Plan</Badge>
    }
  }

  return (
    <>
      <Card className="border-slate-200/80 shadow-xs mb-3.5 bg-white">
        <CardHeader className="py-2.5 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            WFP Readiness & Audit History
          </CardTitle>
          <Badge
            variant="outline"
            className="text-[10px] font-semibold py-0.5 px-2 bg-slate-50 border-slate-200 text-slate-700"
          >
            Status: {wfp?.status || 'Draft'}
          </Badge>
        </CardHeader>

        <CardContent className="px-4 pb-3 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sub-Section 1: Readiness Checklist */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Readiness Checklist
              </h4>

              <div className="space-y-1.5 text-xs">
                {isOPCRMode && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>OPCR Linked ({opcr?.code || 'Connected'})</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Proposed Budget Set (₱{(wfp?.proposedBudget || 0).toLocaleString()})</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  {activityCount > 0 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  )}
                  <span>{activityCount} Activities Linked</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  {timelineCount > 0 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  )}
                  <span>{timelineCount} Quarterly Timelines Configured</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  {expenditureCount > 0 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  )}
                  <span>{expenditureCount} PPMP Items Attached</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  {isWeightAllocated ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  )}
                  <span>
                    Objective Weights ({100 - remainingWeight}% Allocated, {remainingWeight}% Remaining)
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-Section 2: Audit History Log */}
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-600" />
                Recent Activity ({auditEntries.length} logged actions)
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Created</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    {createdDate}
                    {wfp?.createdBy && <span className="text-slate-500 font-normal">by {wfp.createdBy}</span>}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Last Activity</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    {lastModifiedDate}
                    <span className="text-slate-500 font-normal">by {lastModifiedActor}</span>
                  </span>
                </div>

                {auditEntries.length > 0 && (
                  <div className="p-2 rounded bg-slate-50 border border-slate-100 space-y-1 mt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span className="truncate max-w-[200px]">{auditEntries[0].title}</span>
                      {getCategoryBadge(auditEntries[0].category)}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{auditEntries[0].description}</p>
                  </div>
                )}

                <div className="pt-1">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setAuditModalOpen(true)}
                    className="p-0 h-auto text-xs text-indigo-600 hover:text-indigo-800 gap-1 font-semibold"
                  >
                    View full audit trail ({auditEntries.length}) <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Modal */}
      <Dialog open={auditModalOpen} onOpenChange={setAuditModalOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Audit Trail Log — {wfp?.code || wfp?.projectTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Detailed chronological change records ({auditEntries.length} entries) for this Work Financial Plan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {auditEntries.length > 0 ? (
              auditEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold text-xs text-slate-800">
                      {getCategoryIcon(entry.category)}
                      <span>{entry.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(entry.category)}
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatDisplayDate(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-5.5">{entry.description}</p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 pl-5.5 pt-0.5">
                    <User className="w-3 h-3" />
                    <span>Action by: {entry.actor}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs italic">
                No audit records found.
              </div>
            )}

            <div className="text-center py-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 italic">End of audit trail records.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

