import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthlyPOValuePoint } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface MonthlyPOValueChartProps {
  data: Array<MonthlyPOValuePoint>
}

function formatTooltipCurrency(val: any) {
  const num = typeof val === 'number' ? val : 0
  return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatYAxisCurrency(val: any) {
  if (val >= 1_000_000) return `₱${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `₱${(val / 1_000).toFixed(0)}K`
  return `₱${val}`
}

export function MonthlyPOValueChart({ data }: MonthlyPOValueChartProps) {
  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">
          2. Monthly PO Value Commitment Trend
        </CardTitle>
        <CardDescription className="text-xs">
          Total Purchase Order obligations executed per calendar month (PHP)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-1 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="poColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={formatYAxisCurrency} />
            <Tooltip formatter={formatTooltipCurrency} />
            <Area type="monotone" dataKey="value" name="PO Value" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#poColor)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
