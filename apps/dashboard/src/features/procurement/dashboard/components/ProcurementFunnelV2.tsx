import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Columns,
  FileText,
  Send,
  ShoppingCart,
  TrendingUp,
  Zap
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { ProcurementDashboardSummary } from '../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardInfoTooltip } from './CardInfoTooltip'

interface ProcurementFunnelV2Props {
  summary?: ProcurementDashboardSummary
  trendData?: Array<{
    month: string
    requests: number
    bidding: number
    award: number
    ordering: number
  }>
}

export function ProcurementFunnelV2({ summary, trendData = [] }: ProcurementFunnelV2Props) {
  const [viewMode, setViewMode] = useState<'funnel' | 'trend'>('funnel')

  if (!summary) return null

  const stages = [
    {
      id: 'requests',
      label: '1. Requests',
      sublabel: 'PRs & Out-of-Stock APRs',
      count: summary.requests.totalCount,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      subItems: summary.requests.subItems,
    },
    {
      id: 'bidding',
      label: '2. Bidding & Quotation',
      sublabel: 'Active RFQs & AOB Matrix',
      count: summary.bidding.totalCount,
      icon: Send,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      subItems: summary.bidding.subItems,
    },
    {
      id: 'award',
      label: '3. Awarding',
      sublabel: 'BAC Res. & Notice of Award',
      count: summary.award.totalCount,
      icon: Award,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      subItems: summary.award.subItems,
    },
    {
      id: 'ordering',
      label: '4. Ordering & Execution',
      sublabel: 'POs, Contracts, & NTPs',
      count: summary.ordering.totalCount,
      icon: ShoppingCart,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      subItems: summary.ordering.subItems,
    },
  ]

  return (
    <Card className="border border-border shadow-xs mb-6">
      <CardHeader className="p-4 pb-2 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span>PROCUREMENT PIPELINE LIFECYCLE</span>
              <CardInfoTooltip infoKey="panel-procurement-funnel" />
            </span>
            <Badge variant="outline" className="text-[10px] font-normal">
              PR → CPR → RFQ → BAC/AOB → NOA → Contract → PO/NTP
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            End-to-end operational volume progressing through competitive and alternative lanes
          </CardDescription>
        </div>

        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
          <Button
            variant={viewMode === 'funnel' ? 'outline' : 'ghost'}
            size="sm"
            className="h-7 px-2.5 text-xs gap-1"
            onClick={() => setViewMode('funnel')}
          >
            <Columns className="w-3.5 h-3.5" />
            Pipeline Stages
          </Button>
          <Button
            variant={viewMode === 'trend' ? 'outline' : 'ghost'}
            size="sm"
            className="h-7 px-2.5 text-xs gap-1"
            onClick={() => setViewMode('trend')}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Monthly Trend
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {viewMode === 'funnel' ? (
          <div>
            {/* 4 Competitive Funnel Stages */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
              {stages.map((stage, idx) => {
                const Icon = stage.icon
                return (
                  <div key={stage.id} className="relative flex flex-col">
                    <div
                      className={`h-full border rounded-xl p-3.5 ${stage.bgColor} ${stage.borderColor} flex flex-col justify-between transition-all hover:border-primary/40`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md bg-background ${stage.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-xs">{stage.label}</span>
                          </div>
                          <span className="text-base font-black tracking-tight">{stage.count}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-3">{stage.sublabel}</p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-border/50">
                        {stage.subItems.map((sub, i) => (
                          <div key={i} className="flex items-center justify-between text-xs bg-background/80 px-2 py-1 rounded">
                            <span className="text-muted-foreground flex items-center gap-1">
                              {sub.isStalled && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                              {sub.label}
                            </span>
                            <span className="font-semibold">{sub.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {idx < stages.length - 1 && (
                      <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-1 bg-background border rounded-full text-muted-foreground shadow-xs">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Direct Methods Lane */}
            <div className="mt-3 bg-muted/30 border border-dashed border-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold">Direct Methods Fast-Track Lane</span>
                  <span className="text-[11px] text-muted-foreground ml-2">Alternative non-competitive procurement modes (Direct Contracting & Direct Acquisition)</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Direct Contracting:</span>
                  <Badge variant="outline" className="font-bold">{summary.directContractingCount}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Direct Acquisition:</span>
                  <Badge variant="outline" className="font-bold">{summary.directAcquisitionCount}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <span>Total Direct Volume:</span>
                  <span>{summary.directContractingCount + summary.directAcquisitionCount} items</span>
                </div>
              </div>
            </div>
          </div>
        ) : trendData.length > 0 ? (
          <div className="h-[260px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="requests" name="Requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bidding" name="Bidding" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="award" name="Award" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ordering" name="Ordering" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[260px] w-full flex flex-col items-center justify-center text-xs text-muted-foreground">
            <TrendingUp className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="font-semibold text-foreground">No Monthly Trend Data Available</p>
            <p className="text-muted-foreground mt-1">Monthly pipeline throughput records will appear here as procurement activities progress.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
