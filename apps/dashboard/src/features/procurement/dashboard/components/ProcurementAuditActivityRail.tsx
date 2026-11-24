import { useState } from 'react'
import { CheckCircle2, Clock, FileText, History, RefreshCw, User, X } from 'lucide-react'
import { useProcurementAuditTrail } from '../hooks/useProcurementDashboard'
import type { ProcurementAuditLogItem } from '../types/dashboardV2'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function formatTimeAgo(timestampStr: string) {
  const date = new Date(timestampStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffDay > 0) return `${diffDay}d ago`
  if (diffHour > 0) return `${diffHour}h ago`
  if (diffMin > 0) return `${diffMin}m ago`
  return 'Just now'
}

interface ProcurementAuditActivityRailProps {
  onSelectDocument?: (documentNumber: string) => void
}

export function ProcurementAuditActivityRail({ onSelectDocument }: ProcurementAuditActivityRailProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: logs, isLoading, refetch, isFetching } = useProcurementAuditTrail(25)

  const items: Array<ProcurementAuditLogItem> = logs || []

  return (
    <>
      {/* Floating Pill Trigger (when closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed right-4 bottom-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all transform hover:-translate-y-0.5 border border-slate-700/60"
        >
          <div className="relative">
            <History className="w-4 h-4 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
          <span className="text-xs font-semibold">Audit Trail</span>
          <Badge className="h-5 px-1.5 text-[10px] bg-slate-800 text-slate-200 border-slate-700">
            {items.length}
          </Badge>
        </button>
      )}

      {/* Slide-over Docked Rail (when open) */}
      {isOpen && (
        <div className="fixed right-0 top-0 bottom-0 z-50 w-80 sm:w-96 bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 border-b border-border/80 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Audit Activity Trail</h3>
                <p className="text-[11px] text-muted-foreground">Live statutory status transitions</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                title="Refresh audit activity"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Subheader summary */}
          <div className="px-4 py-2 bg-muted/15 border-b border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Tracking HoPE, BAC &amp; TWG Actions</span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-600">
              <CheckCircle2 className="w-3 h-3" /> RA 9184 Audit Compliance
            </span>
          </div>

          {/* Activity Timeline List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 bg-muted/40 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No recorded transition actions in this session.
              </div>
            ) : (
              items.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors space-y-2 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <User className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{log.actorName}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimeAgo(log.timestamp)}
                    </span>
                  </div>

                  <div className="text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">{log.role}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                      {log.action}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => onSelectDocument?.(log.documentNumber)}
                      className="text-[10px] font-mono text-primary hover:underline flex items-center gap-0.5 truncate"
                      title="Filter dashboard to this document"
                    >
                      <FileText className="w-2.5 h-2.5 shrink-0" />
                      {log.documentNumber}
                    </button>
                  </div>

                  {log.notes && (
                    <p className="text-[10px] text-muted-foreground italic line-clamp-2 bg-muted/20 p-1.5 rounded">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border/80 bg-muted/20 text-center">
            <span className="text-[10px] text-muted-foreground">
              Automated statutory procurement audit logging enabled
            </span>
          </div>
        </div>
      )}
    </>
  )
}
