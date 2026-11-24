import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AbcVsAwardedItem } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AbcVsAwardedChartProps {
  data: Array<AbcVsAwardedItem>
}

function formatCurrency(val: any) {
  const num = typeof val === 'number' ? val : 0
  if (num >= 1_000_000) return `₱${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `₱${(num / 1_000).toFixed(0)}K`
  return `₱${num}`
}

export function AbcVsAwardedChart({ data }: AbcVsAwardedChartProps) {
  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">
          9. Approved Budget (ABC) vs. Final Awarded Amount
        </CardTitle>
        <CardDescription className="text-xs">
          Direct financial variance reflecting cost savings achieved per procurement project
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-1 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="projectTitle" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(val: any) => formatCurrency(val)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="abc" name="ABC (Budget)" fill="#64748b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="awardedAmount" name="Awarded Amount" fill="#059669" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
