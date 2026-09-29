import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { YearOverYearSummary } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface YearOverYearTableProps {
  data: YearOverYearSummary
}

function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function DeltaCell({ current, prior }: { current: number; prior: number }) {
  if (prior <= 0) return <span className="text-muted-foreground">—</span>
  const pct = Math.round(((current - prior) / prior) * 1000) / 10
  const isUp = pct > 0
  return (
    <span className={`inline-flex items-center gap-1 font-semibold text-xs ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
      {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
      {Math.abs(pct)}%
    </span>
  )
}

export function YearOverYearTable({ data }: YearOverYearTableProps) {
  const cy = data.currentYear
  const py = data.priorYear

  const rows = [
    {
      metric: 'Total Purchase Requests',
      current: data.currentYearPRCount.toLocaleString(),
      prior: data.priorYearPRCount.toLocaleString(),
      delta: <DeltaCell current={data.currentYearPRCount} prior={data.priorYearPRCount} />,
    },
    {
      metric: 'Total Purchase Order Value',
      current: formatPHP(data.currentYearPOValue),
      prior: formatPHP(data.priorYearPOValue),
      delta: <DeltaCell current={data.currentYearPOValue} prior={data.priorYearPOValue} />,
    },
    {
      metric: 'Active Contracts Executed',
      current: data.currentYearContractCount.toLocaleString(),
      prior: data.priorYearContractCount.toLocaleString(),
      delta: <DeltaCell current={data.currentYearContractCount} prior={data.priorYearContractCount} />,
    },
    {
      metric: 'Procurement Savings Rate',
      current: `${data.currentYearSavingsRate}%`,
      prior: `${data.priorYearSavingsRate}%`,
      delta: <DeltaCell current={data.currentYearSavingsRate} prior={data.priorYearSavingsRate} />,
    },
  ]

  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">
          12. Year-over-Year (YoY) Comprehensive Strategic Comparison
        </CardTitle>
        <CardDescription className="text-xs">
          Executive performance audit comparing FY {cy} against FY {py} baseline
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 border-b border-border text-left">
              <tr>
                <th className="p-3 font-semibold text-muted-foreground">Performance Metric</th>
                <th className="p-3 font-semibold text-muted-foreground text-right">FY {cy} (Current)</th>
                <th className="p-3 font-semibold text-muted-foreground text-right">FY {py} (Prior)</th>
                <th className="p-3 font-semibold text-muted-foreground text-right">YoY Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-medium text-foreground">{row.metric}</td>
                  <td className="p-3 font-bold text-foreground text-right">{row.current}</td>
                  <td className="p-3 text-muted-foreground text-right">{row.prior}</td>
                  <td className="p-3 text-right">{row.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
