import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthlyPRCountPoint } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface MonthlyPRChartProps {
  data: Array<MonthlyPRCountPoint>
}

export function MonthlyPRChart({ data }: MonthlyPRChartProps) {
  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">
          1. Monthly PR Volume by Status
        </CardTitle>
        <CardDescription className="text-xs">
          Draft vs. Submitted vs. Approved Purchase Requests across calendar months
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-1 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="draft" name="Draft" stackId="a" fill="#94a3b8" radius={[0, 0, 0, 0]} />
            <Bar dataKey="submitted" name="Submitted" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="approved" name="Approved" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
