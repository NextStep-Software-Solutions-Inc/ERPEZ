import { AlertTriangle, ArrowRight, Calendar, Clock, ShieldAlert } from 'lucide-react'
import type { ProcurementContractRisk } from '../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ContractRiskPanelProps {
  data?: ProcurementContractRisk
  isLoading?: boolean
}

function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ContractRiskPanel({ data, isLoading }: ContractRiskPanelProps) {
  if (isLoading) {
    return <div className="h-48 bg-muted/40 animate-pulse rounded-xl mb-6" />
  }

  const risk30 = data?.totalValueAtRisk30Days || 0
  const risk60 = data?.totalValueAtRisk60Days || 0
  const risk90 = data?.totalValueAtRisk90Days || 0
  const contracts = data?.expiringContracts || []

  return (
    <Card className="border border-border shadow-xs mb-6">
      <CardHeader className="p-4 pb-2 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>CONTRACT RISK & EXPIRATION TIMELINE HORIZON</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Early surveillance of bilateral contract delivery deadlines and renewal milestones across 30, 60, and 90-day windows
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Value at Risk Windows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="border border-rose-500/30 bg-rose-500/10 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">URGENT EXPIRY (≤ 30 DAYS)</span>
              <Badge className="bg-rose-600 text-white text-[10px]">Action Required</Badge>
            </div>
            <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1">{formatPHP(risk30)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Total contract value facing imminent expiration or delivery deadline</p>
          </div>

          <div className="border border-amber-500/30 bg-amber-500/10 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">UPCOMING RENEWAL (31–60 DAYS)</span>
              <Badge className="bg-amber-600 text-white text-[10px]">Plan Extension</Badge>
            </div>
            <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">{formatPHP(risk60)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Contracts requiring procurement renewal or closeout inspection</p>
          </div>

          <div className="border border-blue-500/30 bg-blue-500/10 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">SURVEILLANCE WINDOW (61–90 DAYS)</span>
              <Badge className="bg-blue-600 text-white text-[10px]">Monitoring</Badge>
            </div>
            <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1">{formatPHP(risk90)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Mid-term monitoring horizon for project deliverables</p>
          </div>
        </div>

        {/* Expiring Contracts List */}
        {contracts.length > 0 ? (
          <div className="border border-border/80 rounded-xl overflow-hidden">
            <div className="bg-muted/40 p-2.5 px-3 border-b border-border/80 flex items-center justify-between">
              <span className="text-xs font-semibold">Contracts Nearing Expiration</span>
              <span className="text-xs text-muted-foreground">{contracts.length} active agreements</span>
            </div>
            <div className="divide-y divide-border/60">
              {contracts.slice(0, 5).map((c) => {
                const isUrgent = c.daysUntilExpiry <= 30
                const isWarning = c.daysUntilExpiry > 30 && c.daysUntilExpiry <= 60

                return (
                  <div key={c.id} className="p-3 flex flex-wrap items-center justify-between gap-3 text-xs hover:bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${isUrgent ? 'bg-rose-500/10 text-rose-600' : isWarning ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <span>{c.contractNumber}</span>
                          <span className="text-muted-foreground font-normal">· {c.title}</span>
                        </div>
                        <span className="text-muted-foreground text-[11px]">Supplier: {c.supplierName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-foreground">{formatPHP(c.totalAmount)}</span>
                      <Badge variant="outline">{c.status}</Badge>
                      <span className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                        isUrgent
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : isWarning
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}>
                        {c.daysUntilExpiry < 0 ? `${Math.abs(c.daysUntilExpiry)}d overdue` : `${c.daysUntilExpiry}d left`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-muted-foreground bg-muted/20 rounded-xl">
            No active contracts with expiration deadlines within the 90-day surveillance horizon.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
