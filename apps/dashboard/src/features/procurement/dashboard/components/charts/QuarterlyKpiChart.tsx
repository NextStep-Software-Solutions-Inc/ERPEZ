import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { QuarterlyKpiPoint } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface QuarterlyKpiChartProps {
  data: Array<QuarterlyKpiPoint>
}

export function QuarterlyKpiChart({ data }: QuarterlyKpiChartProps) {
  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">
          10. Quarterly Operational Throughput (Q1–Q4)
        </CardTitle>
        <CardDescription className="text-xs">
          Comparison of PR counts, PO counts, and executed Contracts across quarters
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-1 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="prCount" name="PRs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="poCount" name="POs" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="contractCount" name="Contracts" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
