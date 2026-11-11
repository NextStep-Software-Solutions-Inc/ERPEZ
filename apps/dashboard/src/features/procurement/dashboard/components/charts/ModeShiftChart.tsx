import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { QuarterlyModeShiftPoint } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartTooltipContent, useChartTheme } from '@/components/ui/chart-tooltip'

interface ModeShiftChartProps {
  data: Array<QuarterlyModeShiftPoint>
}

export function ModeShiftChart({ data }: ModeShiftChartProps) {
  const { tickColor, gridStroke, axisStroke, legendStyle, lineCursor, activeDot } = useChartTheme()

  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">
          11. Procurement Mode Shift Across Quarters
        </CardTitle>
        <CardDescription className="text-xs">
          Evolution of method mix (Bidding vs. Shopping vs. Direct) across the fiscal year
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-1 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
            <XAxis
              dataKey="quarter"
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
              content={<ChartTooltipContent showTotal totalLabel="Total Projects" />}
            />
            <Legend wrapperStyle={legendStyle} />
            <Area
              type="monotone"
              dataKey="biddingCount"
              stackId="1"
              name="Public Bidding"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.55}
              activeDot={{ ...activeDot, fill: '#3b82f6' }}
            />
            <Area
              type="monotone"
              dataKey="shoppingCount"
              stackId="1"
              name="Shopping / SVP"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.55}
              activeDot={{ ...activeDot, fill: '#10b981' }}
            />
            <Area
              type="monotone"
              dataKey="directCount"
              stackId="1"
              name="Direct Contracting"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.55}
              activeDot={{ ...activeDot, fill: '#f59e0b' }}
            />
            <Area
              type="monotone"
              dataKey="otherCount"
              stackId="1"
              name="Other Modes"
              stroke="#94a3b8"
              fill="#94a3b8"
              fillOpacity={0.55}
              activeDot={{ ...activeDot, fill: '#94a3b8' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
