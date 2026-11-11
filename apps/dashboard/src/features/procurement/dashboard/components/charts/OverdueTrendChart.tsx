import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthlyOverdueTrend } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartTooltipContent, useChartTheme } from '@/components/ui/chart-tooltip'

interface OverdueTrendChartProps {
  data: Array<MonthlyOverdueTrend>
}

export function OverdueTrendChart({ data }: OverdueTrendChartProps) {
  const { tickColor, gridStroke, axisStroke, legendStyle, lineCursor, activeDot } = useChartTheme()

  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">
          7. Monthly Overdue Items Trajectory
        </CardTitle>
        <CardDescription className="text-xs">
          Overdue PRs, expired RFQs, and delayed NTPs tracked across months
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-1 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: tickColor }}
              tickLine={false}
              axisLine={{ stroke: axisStroke }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: tickColor }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={lineCursor}
              content={<ChartTooltipContent indicator="line" showTotal totalLabel="Total Overdue" />}
            />
            <Legend wrapperStyle={legendStyle} />
            <Line
              type="monotone"
              dataKey="overduePRs"
              name="Overdue PRs"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ ...activeDot, fill: '#ef4444' }}
            />
            <Line
              type="monotone"
              dataKey="overdueRFQs"
              name="Overdue RFQs"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ ...activeDot, fill: '#f59e0b' }}
            />
            <Line
              type="monotone"
              dataKey="overdueNTPs"
              name="Overdue NTPs"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ ...activeDot, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
