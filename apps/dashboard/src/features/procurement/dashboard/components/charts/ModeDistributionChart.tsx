import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Layers } from 'lucide-react'
import type { ProcurementModeShare } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartTooltipRow, ChartTooltipShell, useChartTheme } from '@/components/ui/chart-tooltip'

interface ModeDistributionChartProps {
  data: Array<ProcurementModeShare>
  selectedMode?: string
  onSelectMode?: (modeName: string) => void
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']

export function ModeDistributionChart({ data, selectedMode, onSelectMode }: ModeDistributionChartProps) {
  const { isDark, legendStyle } = useChartTheme()

  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            3. Procurement Mode Distribution
          </CardTitle>
          <CardDescription className="text-xs">
            Share of procurement volume across competitive and alternative modes
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/15 border-blue-300 dark:border-blue-500/35 shrink-0"
        >
          {selectedMode ? `Filtered: ${selectedMode}` : 'Click slice to filter'}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-1 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data as any}
              dataKey="percentage"
              nameKey="modeName"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              cursor="pointer"
              onClick={(entry: any) => {
                if (entry && entry.modeName) {
                  onSelectMode?.(entry.modeName)
                }
              }}
            >
              {data.map((entry, index) => {
                const isSelected = selectedMode === entry.modeName
                const hasSelection = Boolean(selectedMode)
                const fill = COLORS[index % COLORS.length]
                const opacity = hasSelection && !isSelected ? 0.35 : 1
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fill}
                    fillOpacity={opacity}
                    stroke={isSelected ? (isDark ? '#f8fafc' : '#1e293b') : 'transparent'}
                    strokeWidth={isSelected ? 2.5 : 0}
                  />
                )
              })}
            </Pie>
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const first = payload[0]
                  const item = first.payload as ProcurementModeShare
                  const swatch = first.payload?.fill || first.color || '#3b82f6'
                  return (
                    <ChartTooltipShell className="space-y-1">
                      <div className="font-semibold text-popover-foreground pb-1 mb-1 border-b border-border/60">
                        {item.modeName}
                      </div>
                      <ChartTooltipRow
                        color={swatch}
                        label="Volume"
                        value={`${item.count} projects (${item.percentage}%)`}
                      />
                      <ChartTooltipRow
                        label="Amount"
                        value={`₱${(item.amount ?? 0).toLocaleString('en-PH')}`}
                      />
                      <div className="text-[10px] font-medium text-blue-600 dark:text-blue-400 pt-1.5 mt-1 border-t border-border/60">
                        {selectedMode === item.modeName
                          ? 'Click to clear filter'
                          : 'Click to filter entire dashboard'}
                      </div>
                    </ChartTooltipShell>
                  )
                }
                return null
              }}
            />
            <Legend
              wrapperStyle={{ ...legendStyle, cursor: 'pointer' }}
              onClick={(e: any) => {
                if (e && e.value) {
                  onSelectMode?.(e.value)
                }
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
