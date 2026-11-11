import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Building2 } from 'lucide-react'
import type { SupplierConcentration } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartTooltipRow, ChartTooltipShell, useChartTheme } from '@/components/ui/chart-tooltip'
import { SupplierIntelligenceDrawer } from '../SupplierIntelligenceDrawer'

interface TopSuppliersChartProps {
  data: Array<SupplierConcentration>
}

function formatCurrency(val: any) {
  const num = typeof val === 'number' ? val : 0
  if (num >= 1_000_000) return `₱${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `₱${(num / 1_000).toFixed(0)}K`
  return `₱${num}`
}

export function TopSuppliersChart({ data }: TopSuppliersChartProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierConcentration | null>(null)
  const { tickColor, gridStroke, axisStroke, barCursor } = useChartTheme()

  return (
    <>
      <Card className="border border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              6. Top 10 Suppliers by Award Value
            </CardTitle>
            <CardDescription className="text-xs">
              Vendors with highest cumulative contract awards and win concentration
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/15 border-teal-300 dark:border-teal-500/35 shrink-0"
          >
            Click bar for Rating Matrix
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
                dataKey="supplierName"
                tick={{ fontSize: 10, fill: tickColor, cursor: 'pointer' }}
                tickLine={false}
                axisLine={{ stroke: axisStroke }}
                width={112}
              />
              <Tooltip
                cursor={barCursor}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as SupplierConcentration
                    return (
                      <ChartTooltipShell className="space-y-1">
                        <div className="font-semibold text-popover-foreground pb-1 mb-1 border-b border-border/60">
                          {item.supplierName}
                        </div>
                        <ChartTooltipRow
                          color="#14b8a6"
                          label="Awarded"
                          value={formatCurrency(item.totalAwarded)}
                        />
                        <ChartTooltipRow
                          label="Contracts"
                          value={`${item.contractCount} (${item.percentage}% share)`}
                        />
                        <div className="text-[10px] font-medium text-teal-600 dark:text-teal-400 pt-1.5 mt-1 border-t border-border/60">
                          Click to open Vendor Performance Scorecard
                        </div>
                      </ChartTooltipShell>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="totalAwarded"
                name="Awarded Amount"
                fill="#14b8a6"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(entry: any) => setSelectedSupplier(entry)}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <SupplierIntelligenceDrawer
        supplier={selectedSupplier}
        open={Boolean(selectedSupplier)}
        onClose={() => setSelectedSupplier(null)}
      />
    </>
  )
}
