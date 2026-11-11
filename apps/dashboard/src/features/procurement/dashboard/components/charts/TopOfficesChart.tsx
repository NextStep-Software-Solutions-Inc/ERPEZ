import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Building } from 'lucide-react'
import type { OfficeSpendingItem } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartTooltipRow, ChartTooltipShell, useChartTheme } from '@/components/ui/chart-tooltip'

interface TopOfficesChartProps {
  data: Array<OfficeSpendingItem>
  selectedOffice?: string
  onSelectOffice?: (officeName: string, officeId?: string) => void
}

function formatCurrency(val: any) {
  const num = typeof val === 'number' ? val : 0
  if (num >= 1_000_000) return `₱${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `₱${(num / 1_000).toFixed(0)}K`
  return `₱${num}`
}

export function TopOfficesChart({ data, selectedOffice, onSelectOffice }: TopOfficesChartProps) {
  const { tickColor, gridStroke, axisStroke, barCursor } = useChartTheme()

  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            4. Top Requesting Offices / Units
          </CardTitle>
          <CardDescription className="text-xs">
            Offices with highest total Purchase Request volume and value
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/15 border-sky-300 dark:border-sky-500/35 shrink-0"
        >
          {selectedOffice ? `Filtered: ${selectedOffice}` : 'Click bar to filter'}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-1 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
            <XAxis
              type="number"
              tickFormatter={formatCurrency}
              tick={{ fontSize: 10, fill: tickColor }}
              tickLine={false}
              axisLine={{ stroke: axisStroke }}
            />
            <YAxis
              type="category"
              dataKey="officeName"
              tick={{ fontSize: 10, fill: tickColor, cursor: 'pointer' }}
              tickLine={false}
              axisLine={{ stroke: axisStroke }}
              width={112}
              onClick={(e: any) => {
                if (e && e.value) {
                  const match = data.find((d) => d.officeName === e.value)
                  onSelectOffice?.(e.value, match?.officeId)
                }
              }}
            />
            <Tooltip
              cursor={barCursor}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as OfficeSpendingItem
                  return (
                    <ChartTooltipShell className="space-y-1">
                      <div className="font-semibold text-popover-foreground pb-1 mb-1 border-b border-border/60">
                        {item.officeName}
                      </div>
                      <ChartTooltipRow
                        color="#0284c7"
                        label="Amount"
                        value={formatCurrency(item.amount)}
                      />
                      <ChartTooltipRow
                        label="Requests"
                        value={`${item.prCount} PRs`}
                      />
                      <div className="text-[10px] font-medium text-sky-600 dark:text-sky-400 pt-1.5 mt-1 border-t border-border/60">
                        {selectedOffice === item.officeName
                          ? 'Click to clear filter'
                          : 'Click to filter entire dashboard'}
                      </div>
                    </ChartTooltipShell>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="amount"
              name="PR Amount"
              radius={[0, 4, 4, 0]}
              cursor="pointer"
              onClick={(entry: any) => {
                onSelectOffice?.(entry.officeName, entry.officeId)
              }}
            >
              {data.map((entry, index) => {
                const isSelected = selectedOffice === entry.officeName
                const hasSelection = Boolean(selectedOffice)
                const fill = isSelected ? '#0284c7' : hasSelection ? '#94a3b8' : '#0284c7'
                const opacity = hasSelection && !isSelected ? 0.35 : 1
                return <Cell key={`cell-${index}`} fill={fill} fillOpacity={opacity} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
