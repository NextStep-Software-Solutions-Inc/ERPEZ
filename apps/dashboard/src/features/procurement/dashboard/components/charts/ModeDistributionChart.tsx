import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Layers } from 'lucide-react'
import type { ProcurementModeShare } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ModeDistributionChartProps {
  data: Array<ProcurementModeShare>
  selectedMode?: string
  onSelectMode?: (modeName: string) => void
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']

export function ModeDistributionChart({ data, selectedMode, onSelectMode }: ModeDistributionChartProps) {
  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            3. Procurement Mode Distribution
          </CardTitle>
          <CardDescription className="text-xs">
            Share of procurement volume across competitive and alternative modes
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-300"
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
                    stroke={isSelected ? '#1e293b' : 'transparent'}
                    strokeWidth={isSelected ? 3 : 0}
                  />
                )
              })}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [`${value}%`, name]}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as ProcurementModeShare
                  return (
                    <div className="bg-popover border border-border p-2.5 rounded-lg shadow-md text-xs space-y-1">
                      <div className="font-bold text-foreground">{item.modeName}</div>
                      <div className="text-muted-foreground">Volume: {item.count} projects ({item.percentage}%)</div>
                      <div className="text-muted-foreground">Amount: ₱{item.amount?.toLocaleString('en-PH')}</div>
                      <div className="text-[10px] text-blue-600 pt-1 border-t border-border/50">
                        {selectedMode === item.modeName ? 'Click to clear filter' : 'Click to filter entire dashboard'}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, cursor: 'pointer' }}
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
