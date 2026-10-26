import { CheckCircle2, Clock, FileText, ShieldAlert } from 'lucide-react'
import type { ProcurementBottleneck } from '../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CardInfoTooltip } from './CardInfoTooltip'

interface BottleneckDetectionPanelProps {
  data?: ProcurementBottleneck
  isLoading?: boolean
}

export function BottleneckDetectionPanel({ data, isLoading }: BottleneckDetectionPanelProps) {
  if (isLoading) {
    return <div className="h-48 bg-muted/40 animate-pulse rounded-xl mb-6" />
  }

  const stages = data?.stages || []
  const topItems = data?.topStalledItems || []

  if (!data || stages.length === 0) {
    return (
      <Card className="border border-border shadow-xs mb-6">
        <CardHeader className="p-4 pb-2 border-b border-border/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="flex items-center gap-1.5">
                <span>BOTTLENECK DETECTION &amp; AGING PIPELINE CHECKPOINTS</span>
                <CardInfoTooltip infoKey="panel-bottleneck-detection" />
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Automated statutory threshold surveillance identifying where procurement workflow documents stall
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
            SLA Compliant
          </Badge>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2 py-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-full">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">No Workflow Bottlenecks Detected</p>
            <p className="text-xs text-muted-foreground max-w-md">
              All procurement workflow stages and documents are executing within statutory SLA thresholds.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border shadow-xs mb-6">
      <CardHeader className="p-4 pb-2 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span className="flex items-center gap-1.5">
              <span>BOTTLENECK DETECTION & AGING PIPELINE CHECKPOINTS</span>
              <CardInfoTooltip infoKey="panel-bottleneck-detection" />
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Automated statutory threshold surveillance identifying where procurement workflow documents stall
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Stage Checkpoints Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {stages.map((st, i) => {
            const hasStalls = st.stalledCount > 0
            const isWorst = st.isWorstBottleneck

            const cardClasses = isWorst
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-400 ring-1 ring-rose-500/30'
              : hasStalls
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
              : 'bg-card border-border/70 text-foreground'

            return (
              <div key={i} className={`border rounded-xl p-3 flex flex-col justify-between transition-all ${cardClasses}`}>
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-1">{st.stage}</span>
                    {isWorst && (
                      <Badge className="bg-rose-600 text-white text-[9px] px-1 py-0 h-4">Worst</Badge>
                    )}
                  </div>
                  <div className="text-lg font-black tracking-tight">{st.stalledCount}</div>
                  <p className="text-[10px] text-muted-foreground">stalled items</p>
                </div>

                <div className="mt-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground flex items-center justify-between">
                  <span>Limit: &gt;{st.thresholdDays}d</span>
                  {hasStalls && <span className="font-semibold text-rose-500">avg {st.avgStalledDays}d</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Top 5 Oldest Pending Items */}
        {topItems.length > 0 && (
          <div className="bg-muted/20 border border-border/60 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2.5">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground tracking-wide">TOP STALLED ITEMS REQUIRING IMMEDIATE INTERVENTION</span>
            </div>

            <div className="space-y-2">
              {topItems.map((item, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-between gap-2 p-2 bg-background border rounded-lg text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded bg-muted">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{item.documentNo}</span>
                      <span className="text-muted-foreground ml-2 line-clamp-1">{item.description}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-[11px] bg-muted/60 px-2 py-0.5 rounded">{item.officeName}</span>
                    <Badge variant="outline" className="text-[10px]">{item.stage}</Badge>
                    <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                      {item.ageDays} days old
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
