import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TatBenchmarkItem } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TatBenchmarkChartProps {
  data: Array<TatBenchmarkItem>
}

export function TatBenchmarkChart({ data }: TatBenchmarkChartProps) {
  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">
          8. Turnaround Time (TAT) Stage Benchmarking
        </CardTitle>
        <CardDescription className="text-xs">
          Current Year vs. Prior Year vs. Statutory Target TAT (Days)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-1 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="currentYearDays" name="Current Year" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="priorYearDays" name="Prior Year" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="targetDays" name="Target TAT" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
